import os
import logging
import shutil
from datetime import datetime
from calendar import month_name
from concurrent.futures import ThreadPoolExecutor

from django.conf import settings
from django.http.response import FileResponse
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_api_key.permissions import HasAPIKey


from . import apps
from .supabase import client
from .utils.fetcher.fetcher import DataFetcher
from .utils.docgen.reportlab import ReportlabEngine
from .utils.delivery.gmail import GmailDeliveryEngine


class BaseView(APIView):
    fetcher = DataFetcher
    document_engine = ReportlabEngine
    delivery_engine = GmailDeliveryEngine


class UserView(BaseView):
    permission_classes = []


class AdminView(BaseView):
    if settings.DEBUG:
        permission_classes = []
    else:
        permission_classes = [HasAPIKey]


class AllowReportUsersView(AdminView):

    def get(self, request: Request) -> Response:
        allow_report_users = self.fetcher().get_allow_report_users()

        uids = []
        for u in allow_report_users:
            uids.append(u.id)

        return Response({
            'count': len(allow_report_users),
            'uids': uids
        })


class GenerateReportView(UserView):

    def _verify_user(self, request: Request):
        data = request.data
        headers = request._request.headers

        # Check for the existence of the token in the payload
        if headers.get("Authorization") is None:
            return Response({"error": "The request doesn't have the required credentials"}, 400)

        # Check if the token is valid
        _, auth_token = headers.get("Authorization").split(" ")

        user_response = client.auth.get_user(auth_token)
        if isinstance(user_response, str):
            return Response({"error": user_response}, 400)

        # Add user into the processed data
        data["uid"] = user_response.user.id
        return request

    def _verify_payload(self, request: Request):
        data = request.data
        month = data.get("month")
        year = data.get("year")
        ledger_id = data.get("ledger_id")

        # Check for the existence of the month and year values
        if month is None:
            return Response({"error": "No month specified"}, 400)
        if year is None:
            return Response({"error": "No year specified"}, 400)
        if ledger_id is None:
            return Response({"error": "No ledger id specified"}, 400)

        # Check if the month and year values are ints
        if not isinstance(month, int) or (month < 1 or month > 12):
            return Response({"error": "Expected month to be an integer between 1 and 12"}, 400)
        if not isinstance(year, int):
            return Response({"error": "Expected year to be an integer"}, 400)
        if not isinstance(ledger_id, int):
            return Response({"error": "Expected ledger id to be an integer"}, 400)
            
        return request

    def _verify_request(self, request: Request):
        user_verification = self._verify_user(request)
        if not isinstance(user_verification, dict):
            return user_verification
    
        payload_verification = self._verify_payload(request)
        if not isinstance(payload_verification, dict):
            return payload_verification
    
        return request

    def post(self, request: Request):
        # Check if the request body has the required data
        request_data = self._verify_request(request)
        if not isinstance(request_data, Request):
            return request_data

        # Get the user
        request_data = request_data.data
        fetcher = self.fetcher()

        period = datetime(request_data.get("year"), request_data.get("month"), 1)

        user = fetcher.get_user(request_data.get("uid"))
        if isinstance(user, str):
            return Response({'error': user}, status=400)

        ledger_data = fetcher.get_ledger(user.id, request_data.get("ledger_id"))
        if isinstance(ledger_data, str):
            return Response({'error': ledger_data}, status=400)

        entry_data = fetcher.get_period_data(user.id, ledger_data, period.month, period.year)
        if (len(entry_data) < 1):
            return Response({'error': "No transaction records available for the given period and ledger."}, status=400)

        d_engine = self.document_engine()
        d_engine.set_period(period.month, period.year)
        d_engine.set_locale(request_data.get("locale").replace('-', '_')

        filepath = d_engine.get_filepath(user)
        
        if len(os.listdir(os.path.dirname(filepath))) > 10:
            shutil.rmtree(os.path.dirname(filepath))
            logging.warning("Cleared out the PDF storage directory")

        filepath = d_engine.generate_pdf(user, ledger_data, entry_data)

        response = FileResponse(open(filepath, 'rb'), content_type="application/pdf")
        response["Content-Disposition"] = "inline; filename=report.pdf"

        return response


class AutomatedMonthlyReportView(AdminView):

    def _generate_report(self, period, user, ledger, data):
        d_engine = ReportlabEngine((period.month, period.year))

        return d_engine.generate_pdf(user, ledger, data)

    def _set_filepath(self, target, value):
        target["filepath"] = value

    def post(self, request: Request):
        # Retrieve all users who allow monthly reports generation
        allow_report_users = self.fetcher().get_allow_report_users()

        data = []
        period = datetime.now()

        for u in allow_report_users:
            fetcher = self.fetcher()
            user_data = fetcher.get_period_data(u.id, period.month, period.year)
            ledger_data = fetcher.get_ledger(u.id, u.current_ledger)

            if len(user_data) < 1:
                continue

            data.append({'user': u, 'ledger': ledger_data, 'data': user_data})

        # Generate monthly report
        with ThreadPoolExecutor(max_workers=10) as executor:
            for i, d in enumerate(data):
                # 1. Generate report with the document engine
                # 2. Update the filepath to the document of the user
                executor \
                    .submit(self._generate_report, period, d['user'], d['ledger'], d['data']) \
                    .add_done_callback(lambda future: self._set_filepath(data[i], future.result()))

        # Send the report by email
        deliv_eng = self.delivery_engine()
        for d in data:
            deliv_eng.send_email(
                f"Monthly Financial Report - {month_name[period.month]} {period.year}",
                f"""
                    <h2 style="padding-bottom: 1rem;">Hello {d['user'].username},</h2>
                    <p>
                        Your monthly financial report is ready.
                        You will find attached to this email the report for the ledger <b>{ledger_data.name}</b> and period <b>{month_name[period.month]} {period.year}</b>
                    </p>
                    
                    <p>Thank you for using FinTrack.</p>
                """,
                d['user'].email,
                d['filepath'],
                f"Monthly Financial Report - {ledger_data.name} ({month_name[period.month]} {period.year}).pdf"
            )

        return Response({'data': data})


class ClearStorageView(AdminView):
    
    def post(self, request: Request):
        shutil.rmtree(os.path.join(os.path.dirname(apps.__file__), "storage"))
        
        return Response({"message": "Cleared the storage for any documents"})
