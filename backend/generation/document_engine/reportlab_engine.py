from calendar import monthrange, month_name
from datetime import datetime

from gotrue.types import User

from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.pagesizes import A4
from reportlab.platypus.doctemplate import SimpleDocTemplate
from reportlab.platypus.paragraph import Paragraph
from reportlab.platypus.tables import Table
from reportlab.lib.styles import getSampleStyleSheet

from .base_engine import BaseDocumentEngine


class ReportlabEngine(BaseDocumentEngine):
    def __init__(self, period: tuple[int, int] = None):
        super().__init__(period)
        self.margin = cm
        self.pagesize = A4

    def create_document(self, filename):
        return SimpleDocTemplate(
            filename,
            pagesize=self.pagesize,
            leftMargin=self.margin,
            topMargin=self.margin,
            rightMargin=self.margin,
            bottomMargin=self.margin,
        )

    def create_header(self):
        stylesheet = getSampleStyleSheet()
        return Paragraph(f"Monthly Report - {month_name[self.month]} {self.year}", stylesheet["Heading2"])

    def create_report_info(self, user: User):
        start_dd, end_dd = monthrange(self.year, self.month)
        
        format = "%Y-%m-%d"
        s_date = datetime(self.year, self.month, start_dd).strftime(format)
        e_date = datetime(self.year, self.month, end_dd).strftime(format)
        
        fields = [
            ["Username", f": {user.user_metadata.get('username')}"],
            ["Email", f": {user.email}"],
            ["Period", f": {s_date} - {e_date}"],
            ["Generated on", f": {datetime.now().strftime(format)}"],
        ]

        return Table(
            fields, style=[("LEFTPADDING", (0, 0), (-1, -1), 0)], hAlign="LEFT"
        )

    def create_entry_table(self, entries):
        data = [
            ["No.", "Date", "Title", "Debit", "Credit"]
        ]

        for i, entry in enumerate(entries):
            row = [str(i), entry["date"], entry["title"]]
            if entry["amount_is_positive"]:
                row.append(entry["amount"])
                row.append("-")
            else:
                row.append("-")
                row.append(entry["amount"])

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
                ("LINEAFTER", (0, 0), (-2, -1), 0.5, colors.Color(0, 0, 0)),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), (colors.white, colors.Color(*[0.9] * 3)))
            ]
        )

    def generate_pdf(self, user: User, entries):
        filepath = self.get_filepath(user)
        document: SimpleDocTemplate = self.create_document(filepath)
        flowables = []

        flowables.append(self.create_header())
        flowables.append(self.create_report_info(user))
        flowables.append(self.create_entry_table(entries))

        document.build(flowables)

        return filepath
