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
        return Paragraph(f"Monthly Report - {month_name[self.month]} {self.year}", stylesheet["Heading1"])

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
            fields, style=[("LEFTPADDING", (0, 0), (-1, -1), 0)], hAlign="LEFT"
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
        if len(incomes) >= 1:
            income_labels, income_values = map(list, zip(*incomes.items()))

            income_pc = Pie()
            income_pc.x = 0.25 * aW - 0.5 * income_pc.width
            income_pc.y = 75 - 0.5 * income_pc.height
            income_pc.labels = income_labels
            income_pc.data = income_values
            income_pc.slices.strokeWidth = 0.5
            income_pc.simpleLabels = 0
            income_pc.sideLabels = 1
            
            income_d.add(income_pc, '')

            for inc in incomes:
                income_list.append([
                    f'{inc} ({round(100 * incomes[inc] / total_income, 2)}%)',
                    format_currency(incomes[inc], user.currency_name)
                ])

        if len(expenses) >= 1:
            expense_labels, expense_values = map(list, zip(*expenses.items()))

            expense_pc = Pie()
            expense_pc.x = 0.25 * aW - 0.5 * expense_pc.width
            expense_pc.y = 75 - 0.5 * expense_pc.height
            expense_pc.labels = expense_labels
            expense_pc.data = expense_values
            expense_pc.slices.strokeWidth = 0.5
            expense_pc.simpleLabels = 0
            expense_pc.sideLabels = 1
            
            expense_d.add(expense_pc, '')

            for exp in expenses:
                expense_list.append([
                    f'{exp} ({round(100 * expenses[exp] / total_expense, 2)}%)',
                    format_currency(expenses[exp], user.currency_name)
                ])
            
        
        data = [
            [Paragraph("Income", styles["Heading2"]), Paragraph("Expense", styles["Heading2"])],
            [income_d, expense_d],
            [
                Table(
                    income_list,
                    colWidths=[0.25 * aW, 0.25 * aW],
                    style=[
                        ("ALIGNMENT", (1, 0), (1, -1), "RIGHT"),
                        ("LEFTPADDING", (0, 0), (0, -1), 24),
                        ("RIGHTPADDING", (1, 0), (1, -1), 24),
                    ]),
                Table(
                    expense_list,
                    colWidths=[0.25 * aW, 0.25 * aW],
                    style=[
                        ("ALIGNMENT", (1, 0), (1, -1), "RIGHT"),
                        ("LEFTPADDING", (0, 0), (0, -1), 24),
                        ("RIGHTPADDING", (1, 0), (1, -1), 24),
                    ]),
            ]
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
