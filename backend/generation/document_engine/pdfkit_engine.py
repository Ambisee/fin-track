from datetime import datetime
from calendar import month_name, monthrange

import pdfkit
from gotrue import User
from django.template.loader import render_to_string
from django.conf import settings

from .base_engine import BaseDocumentEngine


class PDFKitEngine(BaseDocumentEngine):
    def __init__(self, period: tuple[int, int] = None):
        if period is None:
            return

        self.month = period[0]
        self.year = period[1]

    def set_period(self, month=None, year=None):
        if month is not None:
            self.month = month
        if year is not None:
            self.year = year

    def is_period_defined(self):
        return \
            isinstance(self.month, int) and \
            isinstance(self.year, int) and \
            self.month >= 1 and \
            self.month <= 12

    def generate_html(self, user: User, entries):
        _, end_date = monthrange(self.year, self.month)
        
        return render_to_string(
            "report_template.html",
            context={
                "month": month_name[self.month],
                "year": self.year,
                "user": user.model_dump(),
                "entries": entries,
                "period": {
                    "start": datetime(self.year, self.month, 1),
                    "end": datetime(self.year, self.month, end_date)
                }
            }
        )
    
    def generate_pdf(self, user: User, entries):
        html_str = self.generate_html(user, entries)
        filepath = self.get_filepath(user)

        pdfkit.from_string(
            html_str,
            filepath,
            configuration=settings.PDFKIT_CONFIG,
            options={
                "enable-local-file-access": ""
            }
        )

        return filepath
