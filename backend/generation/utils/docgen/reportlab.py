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
from reportlab.graphics.shapes import String
from reportlab.platypus.tables import Table
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.piecharts import Pie
from reportlab.platypus.flowables import PageBreak
from reportlab.lib.styles import getSampleStyleSheet

from .base import BaseDocumentEngine
from ...models import UserViewModel, EntryModel


class ReportlabEngine(BaseDocumentEngine):
    
    def __init__(self, period: tuple[int, int] = None):
        super().__init__(period)
        
        self.margin = cm
        self.pagesize = A4
        self.initialize_font()

    def initialize_font(self) -> None:
        raleway_fonts = {
            "normal": TTFont("Raleway", finders.find("fonts/Raleway/Raleway-Regular.ttf")),
            "bold": TTFont("RalewayBd", finders.find("fonts/Raleway/Raleway-Bold.ttf"))
        }

        pdfmetrics.registerFont(raleway_fonts["normal"])
        pdfmetrics.registerFont(raleway_fonts["bold"])
        pdfmetrics.registerFontFamily("Raleway", normal="Raleway", bold="RalewayBd")

    def _create_document(self, filename) -> SimpleDocTemplate:
        return SimpleDocTemplate(
            filename,
            pagesize=self.pagesize,
            leftMargin=self.margin,
            topMargin=self.margin,
            rightMargin=self.margin,
            bottomMargin=self.margin,
        )

    def _create_header(self) -> Paragraph:
        stylesheet = getSampleStyleSheet()
        style = stylesheet["Heading1"]
        style.fontName = "RalewayBd"

        return Paragraph(f"Monthly Report - {month_name[self.month]} {self.year}", style)

    def _create_report_info(self, user: UserViewModel) -> Table:
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
            fields,
            hAlign="LEFT",
            style=[
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("FONT", (0, 0), (-1, -1), "Raleway")
            ],
        )

    def _create_entry_table(self, user: UserViewModel, entries: List[EntryModel]) -> Table:
        total_debit = 0
        total_credit = 0
        
        data = [
            ["No.", "Date", "Category", "Debit", "Credit"]
        ]

        for i, entry in enumerate(entries):
            row = [str(i + 1) + ".", entry.date, entry.category]
            amount = format_currency(entry.amount, user.currency_name)

            if entry.is_positive:
                total_debit += entry.amount
                row.append(amount)
                row.append("-")
            else:
                total_credit += entry.amount
                row.append("-")
                row.append(amount)

            data.append(row)

        data.append([
            'Total', '', '',
            format_currency(total_debit, user.currency_name),
            format_currency(total_credit, user.currency_name)
        ])

        aW = self.pagesize[0] - 2 * self.margin
        return Table(
            data,
            colWidths=[aW * 0.075, aW * 0.145, aW * 0.38, aW * 0.2, aW * 0.2],
            spaceBefore=cm,
            repeatRows=1,
            style=[
                ("FONT", (0, 0), (-1, -1), "Raleway"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BACKGROUND", (0, 0), (-1, 0), colors.black),
                ("TEXTCOLOR", (0, 1), (-1, -1), colors.black),
                ("ALIGNMENT", (0, 0), (-1, -1), "CENTER"),
                ("ALIGNMENT", (-2, 1), (-1, -1), "RIGHT"),
                ("ALIGNMENT", (2, 1), (2, -1), "LEFT"),
                ("LINEAFTER", (0, 0), (-2, -1), 0.5, colors.Color(0, 0, 0)),
                ("SPAN", (0, -1), (-3, -1)),
                ("ALIGNMENT", (0, -1), (-2, -1), "RIGHT"),
                ("LINEABOVE", (0, -1), (-1, -1), 1, colors.black),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), (colors.white, colors.Color(*[0.9] * 3))),
            ]
        )

    def _create_pie_chart(self, drawing: Drawing, labels: List[str], values: List[str]):
        if len(values) < 1:
            drawing.add(String(drawing.width / 2, drawing.height / 2, "No entry data", fontSize=18, fontName="RalewayBd", textAnchor="middle"), '')
            return drawing
        
        pc = Pie()
        pc.x = drawing.width / 2 - 0.5 * pc.width
        pc.y = drawing.height / 2 - 0.5 * pc.height
        pc.labels = labels
        pc.data = values
        pc.slices.fontName = "Raleway"
        pc.slices.strokeWidth = 0.5
        pc.simpleLabels = 0
        pc.sideLabels = 1
        
        drawing.add(pc, '')
        return drawing

    def _create_category_section(self, entrylist: List[List[str]]):
        if len(entrylist) < 1:
            return Paragraph("")
    
        aW = self.pagesize[0] - 2 * self.margin
        return Table(
            entrylist,
            colWidths=[0.25 * aW, 0.25 * aW],
            style=[
                ("FONT", (0, 0), (-1, -1), "Raleway"),
                ("ALIGNMENT", (1, 0), (1, -1), "RIGHT"),
                ("LEFTPADDING", (0, 0), (0, -1), 24),
                ("RIGHTPADDING", (1, 0), (1, -1), 24),
            ])


    def _create_statistics(self, user: UserViewModel, entries: List[EntryModel]):
        incomes = {}
        expenses = {}
        
        total_income = 0
        total_expense = 0
        
        aW = self.pagesize[0] - 2 * self.margin
        styles = getSampleStyleSheet()

        for entry in entries:
            # Get the dictionary to increment the counter for
            target_counter = incomes if entry.is_positive else expenses
            if target_counter.get(entry.category) is None:
                target_counter[entry.category] = 0

            target_counter[entry.category] += entry.amount

            if entry.is_positive:
                total_income += entry.amount
            else:
                total_expense += entry.amount

        income_d, expense_d = Drawing(0.5 * aW, 150), Drawing(0.5 * aW, 150)
        income_list, expense_list = [], []

        # Process income values
        income_labels, income_values = [], []
        for k in incomes:
            income_labels.append(k)
            income_values.append(incomes[k])

        income_d = self._create_pie_chart(income_d, income_labels, income_values)

        for inc in incomes:
            income_list.append([
                f'{inc} ({round(100 * incomes[inc] / total_income, 2)}%)',
                format_currency(incomes[inc], user.currency_name)
            ])

        # Process expense values
        expense_labels, expense_values = [], []
        for k in expenses:
            expense_labels.append(k)
            expense_values.append(expenses[k])

        expense_d = self._create_pie_chart(expense_d, expense_labels, expense_values)

        for exp in expenses:
            expense_list.append([
                f'{exp} ({round(100 * expenses[exp] / total_expense, 2)}%)',
                format_currency(expenses[exp], user.currency_name)
            ])
            
        data = [
            [Paragraph("Expense", styles["Heading2"]), Paragraph("Income", styles["Heading2"])],
            [expense_d, income_d],
            [self._create_category_section(expense_list), self._create_category_section(income_list)]
        ]
        
        return Table(
            data,
            colWidths=[aW * 0.5, aW * 0.5],
            style=[
                ("VALIGN", (0, 0), (-1, -2), "MIDDLE"),
                ("VALIGN", (0, -1), (-1, -1), "TOP"),
            ]
        )

    def generate_pdf(self, user: UserViewModel, entries: List[EntryModel]):
        filepath = self.get_filepath(user)
        document: SimpleDocTemplate = self._create_document(filepath)
        flowables = []

        flowables.append(self._create_header())
        flowables.append(self._create_report_info(user))
        flowables.append(self._create_entry_table(user, entries))
        flowables.append(PageBreak())
        flowables.append(self._create_statistics(user, entries))
        
        document.build(flowables)

        return filepath
