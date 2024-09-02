import os
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

    def _verify_request(self, request: Request):
        data = dict(request.data)
        
        # Check for the existence of the token in the payload
        if data.get("token") is None:
            return Response({"error": "The request doesn't have the required credentials"})

        # Check if the token is valid
        user_response = client.auth.get_user(data.get("token"))
        if user_response is None:
            return Response({"error": "Invalid credentials"})

        # Add user into the processed data
        data["uid"] = user_response.user.id
        return data

    def post(self, request: Request):
        # Check if the request body has the required data
        request_data = self._verify_request(request)
        if type(request_data) is not dict:
            return request_data

        # Get the user
        fetcher = self.fetcher()

        today = datetime.now()
        user_view = fetcher.get_user(request_data.get("uid"))
        data = fetcher.get_period_data(user_view.id, today.month, today.year)

        d_engine = self.document_engine()
        d_engine.set_period(today.month, today.year)
        filepath = d_engine.generate_pdf(user_view, data)

        response = FileResponse(open(filepath, 'rb'), content_type="application/pdf")
        response["Content-Disposition"] = "inline; filename=report.pdf"

        return response


class AutomatedMonthlyReportView(AdminView):

    def _generate_report(self, period, user, data):
        d_engine = ReportlabEngine((period.month, period.year))
        return d_engine.generate_pdf(user, data)

    def _set_filepath(self, target, value):
        target["filepath"] = value

    def post(self, request: Request):
        # Retrieve all users who allow monthly reports generation
        allow_report_users = self.fetcher().get_allow_report_users()

        data = []
        period = datetime.now()

        for u in allow_report_users:
            user_data = self.fetcher().get_period_data(u.id, period.month, period.year)

            if len(user_data) < 1:
                continue

            data.append({'user': u, 'data': user_data})

        # Generate monthly report
        with ThreadPoolExecutor(max_workers=10) as executor:
            for i, d in enumerate(data):
                # 1. Generate report with the document engine
                # 2. Update the filepath to the document of the user
                executor \
                    .submit(self._generate_report, period, d['user'], d['data']) \
                    .add_done_callback(lambda future: self._set_filepath(data[i], future.result()))

        # Send the report by email
        for d in data:
            self.delivery_engine().send_email(
                f"Monthly Financial Report - {month_name[period.month]} {period.year}",
                f"""
                    <h2 style="padding-bottom: 1rem;">Hello {d['user'].username},</h2>
                    <p>
                        Your monthly financial report is ready.
                        You will find attached to this email the report for the period <b>{month_name[period.month]} {period.year}</b>.
                    </p>
                    
                    <p>Thank you for using FinTrack.</p>
                """,
                d['user'].email,
                d['filepath'],
                f"Monthly Financial Report - {month_name[period.month]} {period.year}.pdf"
            )

        return Response({'data': data})


class ClearStorageView(AdminView):
    
    def post(self, request: Request):
        shutil.rmtree(os.path.join(os.path.dirname(apps.__file__), "storage"))
        
        return Response({"message": "Cleared the storage for any documents"})
