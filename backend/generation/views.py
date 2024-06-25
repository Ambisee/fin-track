from datetime import datetime
from calendar import month_name
from concurrent.futures import ThreadPoolExecutor

from django.conf import settings
from django.http.response import FileResponse
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_api_key.permissions import HasAPIKey

from .supabase_client.supabase_client import client
from .data_retriever.data_retriever import DataRetriever
from .document_engine.reportlab_engine import ReportlabEngine
from .delivery_engine.delivery_engine import DeliveryEngine


class BaseView(APIView):
    data_retriever = DataRetriever
    document_engine = ReportlabEngine
    delivery_engine = DeliveryEngine


class UserView(BaseView):
    permission_classes = []


class AdminView(BaseView):
    if settings.DEBUG is True:
        permission_classes = []
    else:
        permission_classes = [HasAPIKey]


class AllowReportUsersView(AdminView):

    def get(self, request: Request) -> Response:
        allow_report_users = self.data_retriever().get_allow_report_users()

        uids = []
        for u in allow_report_users:
            uids.append(u.id)

        return Response({
            'count': len(allow_report_users),
            'uids': uids
        })


class GenerateReportView(AdminView):

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
        data["user"] = user_response.user
        return data

    def post(self, request: Request):
        # Check if the request body has the required data
        request_data = self._verify_request(request)
        if type(request_data) is not dict:
            return request_data

        # Get the user
        user = request_data.get("user")

        today = datetime.now()
        data = self.data_retriever().get_period_data(user, today.month, today.year)

        d_engine = self.document_engine()
        d_engine.set_period(today.month, today.year)
        filepath = d_engine.generate_pdf(user, data)

        response = FileResponse(open(filepath, 'rb'), content_type="application/pdf")
        response["Content-Disposition"] = "inline; filename=report.pdf"

        return response


class AutomatedMonthlyReportView(AdminView):

    def _generate_report(self, period, user, data):
        d_engine = ReportlabEngine(period.month, period.year)
        return d_engine.generate_pdf(user, data)

    def post(self, request: Request):
        # Retrieve all users who allow monthly reports generation
        allow_report_users = self.data_retriever.get_allow_report_users()

        data = []
        period = datetime.now()

        for u in allow_report_users:
            user_data = self.data_retriever.get_period_data(u, period.month, period.year)
            data.append({'user': u, 'data': user_data})

        # Generate monthly report
        with ThreadPoolExecutor(max_workers=10) as executor:
            for i, d in enumerate(data):
                # 1. Generate report with the document engine
                # 2. Update the filepath to the document of the user
                executor \
                    .submit(self._generate_report, period, d['user'], d['data']) \
                    .add_done_callback(lambda future: data[i].update(filepath=future.result()))

        # Send the report by email
        for d in data:
            self.delivery_engine.send_email(
                f"Monthly Financial Report - {month_name[period.month]} {period.year}",
                f"""
                    Hello {d['user'].user_metadata['username']}, <br />

                    You have subscribed for a monthly financial report to be emailed. <br />
                    Attached to this email is the monthly financial report for the period: <b>{month_name[period.month]} {period.year}</b>.
                    
                    Thank you for using FinTrack.
                """,
                d['user'].email,
                d['filepath'],
                f"Monthly Financial Report - {month_name[period.month]} {period.year}.pdf"
            )

        return Response({'data': data})
