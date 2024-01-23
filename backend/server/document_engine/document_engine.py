from datetime import datetime
from calendar import month_name, monthrange

import pdfkit
from gotrue import User
from django.template.loader import render_to_string
from django.contrib.staticfiles import finders
from django.conf import settings


class DocumentEngine:
    def __init__(self, period: tuple[int, int]):
        self.month = period[0]
        self.year = period[1]

    def generate_html(self, user: User, entries):
        _, end_date = monthrange(self.year, self.month)
        
        font_paths = {
            "regular": finders.find("Raleway/static/Raleway-Regular.ttf"),
            "medium": finders.find("Raleway/static/Raleway-Medium.ttf"),
            "light": finders.find("Raleway/static/Raleway-Light.ttf")
        }

        return render_to_string(
            "report_template.html",
            context={
                "month": month_name[self.month],
                "year": self.year,
                "user": user,
                "entries": entries,
                "font_raleway": font_paths,
                "period": {
                    "start": datetime(self.year, self.month, 1),
                    "end": datetime(self.year, self.month, end_date)
                }
            }
        )
    
    def generate_pdf(self, user: User, entries):
        html_str = self.generate_html(user, entries)
        filepath = "example.pdf"

        pdfkit.from_string(
            html_str,
            filepath,
            configuration=settings.PDFKIT_CONFIG,
            options={
                "enable-local-file-access": ""
            }
        )

        return filepath
