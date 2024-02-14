import os
import base64
from datetime import datetime
from calendar import month_name, monthrange

import pdfkit
from gotrue import User
from django.template.loader import render_to_string
from django.conf import settings

from .. import apps


class DocumentEngine:
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
        """Generate a PDF report for the specified user and their data

        Params
        ------
        user: User
            A User object
        entries: list of Entry
            A list user's data

        Returns
        -------
        str
            The filepath to the generated PDF file
        """

        html_str = self.generate_html(user, entries)
        filepath = os.path.join(os.path.dirname(apps.__file__), "storage", "pdf", f"{user.id}.pdf")

        if not os.path.exists(os.path.dirname(filepath)):
            os.makedirs(os.path.dirname(filepath))

        pdfkit.from_string(
            html_str,
            filepath,
            configuration=settings.PDFKIT_CONFIG,
            options={
                "enable-local-file-access": ""
            }
        )

        return filepath
