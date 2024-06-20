import os
from datetime import datetime

from gotrue.types import User

from .. import apps


class BaseDocumentEngine:
    month: int
    year: int
    
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

    def get_filepath(self, user: User):
        now = datetime.now()
        filepath = os.path.join(os.path.dirname(apps.__file__), "static", "documents", f"{user.id}-{now.strftime('%d%m%Y-%H%M%S')}.pdf")

        if not os.path.exists(os.path.dirname(filepath)):
            os.makedirs(os.path.dirname(filepath))

        return filepath

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
        pass
