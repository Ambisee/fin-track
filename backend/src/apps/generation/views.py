import os
import logging
import shutil
from datetime import datetime
from calendar import month_name
from concurrent.futures import ThreadPoolExecutor

from django.http.response import FileResponse
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response

from . import apps
from ..common.supabase import SupabaseUser
from ..common.authentication import SupabaseAuthentication, AdminAuthentication
from ..common.utils.logging import CommonLogger
from .serializers import ReportRequestSerializer
from .utils.fetcher.fetcher import DataFetcher
from .utils.docgen.reportlab import ReportlabEngine
from .utils.delivery.gmail import GmailDeliveryEngine


class RequiresUserView(APIView):

    authentication_classes = [SupabaseAuthentication]

    fetcher = DataFetcher
    document_engine = ReportlabEngine
    delivery_engine = GmailDeliveryEngine

    logger = CommonLogger


class RequiresAdminView(RequiresUserView):
    
    authentication_classes = [AdminAuthentication]


class GenerateReportView(RequiresUserView):

    def post(self, request: Request):
        """Generate a monthly report for the given user
        based on the given ledger and period.

        Method
        ------
        POST

        Request
        -------
        - Header
            - `Authentication` (Required): The token which identifies the user
        - Body (Content-Type: `application/json`)
            - `month: int` - the month of the report period. Value must be an integer between 1 and 12
            - `year: int` - the year of the report period
            - `ledger: int` - the ledger id of the data
            - `locale: str` - the locale to use when generating the report. Value must be in the format of <lang>-<region>. The default value is `"en-us"`
            
        Response
        --------
        - Success
            - code: 200
            - content-type: `application/pdf`
            - body: *the PDF document of the monthly report*
        - Authentication failed
            - code: 400
            - content-type: `application/json`
            - body:
                - `error: str | list[str]`
        """

        supabaseUser: SupabaseUser = request.user

        # Get the user and their associated data
        payload_serializer = ReportRequestSerializer(data=request.data)
        if not payload_serializer.is_valid():
            return Response({'error': payload_serializer.errors}, status=400)

        data = payload_serializer.create(payload_serializer.validated_data)
        period = datetime(data.year, data.month, 1)
        
        fetcher = self.fetcher()
        user = fetcher.get_user(supabaseUser.id)
        if isinstance(user, str):
            return Response({'error': user}, status=400)
        
        self.logger.d(f"User: username={user.username}.")

        ledger_data = fetcher.get_ledger(user.id, data.ledger)
        if isinstance(ledger_data, str):
            return Response({'error': ledger_data}, status=400)
        
        self.logger.d(f"Fetched ledger: {ledger_data.name}.")

        entry_data = fetcher.get_period_data(user.id, ledger_data, period.month, period.year)
        if (len(entry_data) < 1):
            return Response({'error': "No transaction records available for the given period and ledger."}, status=400)

        self.logger.d(f"Fetched {len(entry_data)} entry data.")

        d_engine = self.document_engine()
        d_engine.set_period(period.month, period.year)
        d_engine.set_locale(data.locale.replace('-', '_'))

        filepath = d_engine.get_filepath(user)
        
        if len(os.listdir(os.path.dirname(filepath))) > 10:
            shutil.rmtree(os.path.dirname(filepath))
            logging.warning("Cleared out the PDF storage directory")

        filepath = d_engine.generate_pdf(user, ledger_data, entry_data)

        response = FileResponse(open(filepath, 'rb'), content_type="application/pdf")
        response["Content-Disposition"] = "inline; filename=report.pdf"

        self.logger.i(f"Generated report for user: username={user.username}, ledger={ledger_data.name}, period={month_name[period.month]}-{period.year}")
        return response


class AutomatedMonthlyReportView(RequiresAdminView):

    def _generate_report(self, period, user, ledger, data):
        d_engine = self.document_engine((period.month, period.year))
        return d_engine.generate_pdf(user, ledger, data)

    def _set_filepath(self, target, value):
        target["filepath"] = value

    def post(self, request: Request):
        """Request the app to generate monthly reports for
        all users who allowed automatic monthly reports and
        send them to their email.

        Method
        ------
        POST

        Request
        -------
        Header
            - `X-ADMIN-USERNAME` (Required): Admin username
            - `X-ADMIN-PASSWORD` (Required): Admin password

        Response
        --------
        - Success
            - code: `200`
            - content type: `application/json`
            - body:
                - `data`
                    - `period: str` - The month-year period of the current request
                    - `users`
                        - `count: int` - Total number of users who allowed automatic monthly report
                        - `sent: int` - Number of reports actually sent
        - Authentication failed
            - code: `400`
            - content type: `application/json`
            - body:
                - `error: str | list[str]`
        """

        # Retrieve all users who allow monthly reports generation
        allow_report_users = self.fetcher().get_allow_report_users()
        self.logger.d(f"Fetched {len(allow_report_users)} users who allowed automatic monthly report")

        data = []
        period = datetime.now()

        for u in allow_report_users:
            fetcher = self.fetcher()
            ledger_data = fetcher.get_ledger(u.id, u.current_ledger)
            user_data = fetcher.get_period_data(u.id, ledger_data, period.month, period.year)

            if len(user_data) < 1:
                continue

            data.append({'user': u, 'ledger': ledger_data, 'data': user_data})
        
        self.logger.d(f"Fetched and processed {len(data)} data groups. {len(allow_report_users) - len(data)} users have no data in the current period.")

        # Generate monthly report
        with ThreadPoolExecutor(max_workers=10) as executor:
            for i, d in enumerate(data):
                # 1. Generate report with the document engine
                # 2. Update the filepath to the document of the user
                executor \
                    .submit(self._generate_report, period, d['user'], d['ledger'], d['data']) \
                    .add_done_callback(lambda future: self._set_filepath(data[i], future.result())) \


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

        self.logger.i(f"Report generated and sent for {len(data)}/{len(allow_report_users)} users.")
        return Response({
            'data': {
                'period': f"{month_name[period.month]} {period.year}",
                'users': {
                    'count': len(allow_report_users),
                    'sent': len(data)
                }
            }
        })


class ClearStorageView(RequiresUserView):
    
    def post(self, request: Request):
        shutil.rmtree(os.path.join(os.path.dirname(apps.__file__), "storage"))
        
        return Response({"message": "Cleared the storage for any documents"})
