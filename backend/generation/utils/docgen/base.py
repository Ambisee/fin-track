import os
from typing import List
from datetime import datetime
from babel.numbers import LC_NUMERIC

from ...models import UserViewModel, LedgerModel, EntryModel
from ... import apps


class BaseDocumentEngine:
    month: int
    year: int
    
    def __init__(self, period: tuple[int, int] = None):
        if period is None:
            return

        self.currency = 'USD'
        self.locale = LC_NUMERIC
        self.month = period[0]
        self.year = period[1]

    def set_period(self, month=None, year=None):
        if month is not None:
            self.month = month
        if year is not None:
            self.year = year

    def set_currency(self, currency: str):
        self.currency = currency
    
    def set_locale(self, locale: str):
        self.locale = locale

    def is_period_defined(self):
        """Check if the instance's period is valid
        
        Params
        ------
        None

        Returns
        -------
        bool
            True if the period is valid
            False otherwise
        """

        return \
            isinstance(self.month, int) and \
            isinstance(self.year, int) and \
            self.month >= 1 and \
            self.month <= 12

    def get_filepath(self, user: UserViewModel):
        """Get a new filepath where a report document will be located
        
        Params
        ------
        user: UserViewModel
            A user object
        
        Returns
        -------
        string
            An absolute path to a PDF file
        """
        now = datetime.now()
        filepath = os.path.join(os.path.dirname(apps.__file__), "storage", f"{user.id}-{now.strftime('%d%m%Y-%H%M%S')}.pdf")

        if not os.path.exists(os.path.dirname(filepath)):
            os.makedirs(os.path.dirname(filepath))

        return filepath

    def generate_pdf(self, user: UserViewModel, ledger: LedgerModel, entries: List[EntryModel]):
        """Generate a PDF report for the specified user and their data

        Params
        ------
        user: UserViewModel
            An object containing user information
        entries: list of Entry
            A list user's data

        Returns
        -------
        str
            The filepath to the generated PDF file
        """
        pass
