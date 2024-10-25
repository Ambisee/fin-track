from typing import List
from datetime import datetime
from calendar import monthrange, month_name

from babel.numbers import format_currency
from django.contrib.staticfiles import finders

from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus.doctemplate import SimpleDocTemplate
from reportlab.platypus.paragraph import Paragraph
from reportlab.platypus.tables import Table
from reportlab.lib.styles import getSampleStyleSheet

from .base import BaseDocumentEngine
from ...models import UserViewModel, EntryModel


class ReportlabEngine(BaseDocumentEngine):
    
    def __init__(self, period: tuple[int, int] = None):
        super().__init__(period)
        
        self.margin = cm
        self.pagesize = A4
        self.initialize_font()

    def initialize_font(self):
        raleway_fonts = {
            "normal": TTFont("Raleway", finders.find("fonts/Raleway/Raleway-Regular.ttf")),
            "bold": TTFont("RalewayBd", finders.find("fonts/Raleway/Raleway-Bold.ttf"))
        }

        pdfmetrics.registerFont(raleway_fonts["normal"])
        pdfmetrics.registerFont(raleway_fonts["bold"])
        pdfmetrics.registerFontFamily("Raleway", normal="Raleway", bold="RalewayBd")

    def _create_document(self, filename):
        return SimpleDocTemplate(
            filename,
            pagesize=self.pagesize,
            leftMargin=self.margin,
            topMargin=self.margin,
            rightMargin=self.margin,
            bottomMargin=self.margin,
        )

    def _create_header(self):
        stylesheet = getSampleStyleSheet()
        return Paragraph(f"Monthly Report - {month_name[self.month]} {self.year}", stylesheet["Heading2"])

    def _create_report_info(self, user: UserViewModel):
        _, end_dd = monthrange(self.year, self.month)
        
        format = "%d %B %Y"
        s_date = datetime(self.year, self.month, 1).strftime(format)
        e_date = datetime(self.year, self.month, end_dd).strftime(format)
        
        fields = [
            ["Username", f": {user.username}"],
            ["Email", f": {user.email}"],
            ["Period", f": {s_date} - {e_date}"],
            ["Generated on", f": {datetime.now().strftime(format)}"],
        ]

        return Table(
            fields, style=[("LEFTPADDING", (0, 0), (-1, -1), 0)], hAlign="LEFT"
        )

    def _create_entry_table(self, user: UserViewModel, entries: List[EntryModel]):
        data = [
            ["No.", "Date", "Category", "Debit", "Credit"]
        ]

        for i, entry in enumerate(entries):
            row = [str(i + 1) + ".", entry.date, entry.category]
            amount = format_currency(entry.amount, user.currency_name)

            if entry.is_positive:
                row.append(amount)
                row.append("-")
            else:
                row.append("-")
                row.append(amount)

            data.append(row)

        aW = self.pagesize[0] - 2 * self.margin
        return Table(
            data,
            colWidths=[aW * 0.075, aW * 0.145, aW * 0.38, aW * 0.2, aW * 0.2],
            spaceBefore=cm,
            repeatRows=1,
            style=[
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BACKGROUND", (0, 0), (-1, 0), colors.black),
                ("TEXTCOLOR", (0, 1), (-1, -1), colors.black),
                ("ALIGNMENT", (0, 0), (-1, -1), "CENTER"),
                ("ALIGNMENT", (-2, 1), (-1, -1), "RIGHT"),
                ("ALIGNMENT", (2, 1), (2, -1), "LEFT"),
                ("LINEAFTER", (0, 0), (-2, -1), 0.5, colors.Color(0, 0, 0)),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), (colors.white, colors.Color(*[0.9] * 3)))
            ]
        )

    def generate_pdf(self, user: UserViewModel, entries: List[EntryModel]):
        filepath = self.get_filepath(user)
        document: SimpleDocTemplate = self._create_document(filepath)
        flowables = []

        flowables.append(self._create_header())
        flowables.append(self._create_report_info(user))
        flowables.append(self._create_entry_table(user, entries))

        document.build(flowables)

        return filepath
