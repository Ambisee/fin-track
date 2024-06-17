import os
from datetime import datetime
from calendar import month_name
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_api_key.permissions import HasAPIKey

from .data_retriever import DataRetriever
from .document_engine import ReportlabEngine, PDFKitEngine
from .delivery_engine import DeliveryEngine

if settings.DEBUG:
    os.unsetenv("RESEND_KEY")
    os.unsetenv("SUPABASE_KEY")
    os.unsetenv("SUPABASE_URL")
    load_dotenv('.env')


class BaseAdminView(APIView):
    data_retriever = DataRetriever()
    delivery_engine = DeliveryEngine()
    
    if settings.DOCUMENT_ENGINE == "pdfkit":
        document_engine = PDFKitEngine()
    else:
        document_engine = ReportlabEngine()

    if settings.DEBUG:
        permission_classes = []
    else:
        permission_classes = [HasAPIKey]


class AllowReportUsersView(BaseAdminView):

    def get(self, request: Request) -> Response:
        allow_report_users = self.data_retriever.get_allow_report_users()

        uids = []
        for u in allow_report_users:
            uids.append(u.id)

        return Response({
            'count': len(allow_report_users),
            'uids': uids
        })


class AutomatedMonthlyReportView(BaseAdminView):

    def _generate_report(self, user, data):
        return self.document_engine.generate_pdf(user, data)

    def post(self, request: Request):
        # Retrieve all users who allow monthly reports generation
        allow_report_users = self.data_retriever.get_allow_report_users()

        data = []
        period = datetime.now()

        for u in allow_report_users:
            user_data = self.data_retriever.get_period_data(u, period.month, period.year)
            data.append({'user': u, 'data': user_data})

        # Generate monthly report
        self.document_engine.set_period(period.month, period.year)

        with ThreadPoolExecutor(max_workers=10) as executor:
            for i, d in enumerate(data):
                # 1. Generate report with the document engine
                # 2. Update the filepath to the document of the user
                executor \
                    .submit(self._generate_report, d['user'], d['data']) \
                    .add_done_callback(lambda future: data[i].update(filepath=future.result()))

        # Send the report by email
        for d in data:
            self.delivery_engine.send_email(
                f"Monthly Financial Report - {month_name[period.month]} {period.year}",
                f"""
                    Hello {d['user'].user_metadata['username']},

                    You have subscribed for a monthly financial report to be emailed.
                    Attached to this email is the monthly financial report for the period: <b>{month_name[period.month]} {period.year}</b>.
                    
                    Thank you for using FinTrack.
                """,
                d['user'].email,
                d['filepath'],
                f"Monthly Financial Report - {month_name[period.month]} {period.year}.pdf"
            )

        return Response({'data': data})
