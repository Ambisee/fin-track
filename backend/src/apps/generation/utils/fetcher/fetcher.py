import datetime
import calendar
from typing import List
from pydantic import TypeAdapter

from supabase import Client

from ....common.supabase import client
from ...models import UserViewModel, EntryModel, LedgerModel


class DataFetcher:
    """A wrapper class around a Supabase client that provides a collection of
    helper functions. The Supabase URL and secret key environment variables must be
    set before calling the initializer.

    Attributes
    ----------
    client: Client
        A Supabase client object that is initialized with admin privileges
    """

    def __init__(self):
        self.client: Client = client

    def get_user(self, uid: str) -> UserViewModel | str:
        """Retrieve user information based on the given id

        Params
        ------
        uid: str
            The id of the user

        Returns
        -------
        UserViewModel | str
            A user object with the given id if a user is found.
            Otherwise a string detailing the cause of error if no user is found.
        """
        user_response = self.client.auth.admin.get_user_by_id(uid)
        if not user_response.user:
            return "Unable to find the user with the given user id"

        settings_response = self.client \
            .table("settings") \
            .select("allow_report, current_ledger") \
            .eq("user_id", uid) \
            .single() \
            .execute()
        
        if not settings_response.data:
            return "Unable to retrieve the user's data"
    
        adapter = TypeAdapter(UserViewModel)
        return adapter.validate_python({
            'id': user_response.user.id,
            'current_ledger': settings_response.data['current_ledger'],
            'allow_report': settings_response.data['allow_report'],
            'username': user_response.user.user_metadata.get("username"),
            'email': user_response.user.email
        })


    def get_allow_report_users(self) -> List[UserViewModel]:
        """Filter the users for those who allow reports

        Params
        ------
        None

        Returns
        -------
        List[UserViewModel]
            A list of users that allow reports
        """
        response = self.client.table("user_view").select("*").eq("allow_report", True).execute()

        adapter = TypeAdapter(List[UserViewModel])
        return adapter.validate_python(response.data)


    def get_ledger(self, uid: str, ledger_id: int) -> LedgerModel | str:
        """Get a ledger from an id

        Params
        ------
        uid: str
            The user's id to be checked against the ledger's creator
        ledger_id: int
            The id of the ledger to be fetched

        Returns
        -------
        LedgerModel or str
            If the uid matches the ledger's creator, returns the ledger
            else it returns None
        """
        query = (self.client
                 .table("ledger")
                 .select("*, currency (currency_name)")
                 .eq("id", ledger_id)
                 .eq("created_by", uid))

        response = query.execute()
        if not response.data:
            return "Unable to retrieve the ledger. Please check that you have a valid ledger id and user id."

        adapter = TypeAdapter(LedgerModel)
        return adapter.validate_python({
            "currency_name": response.data[0]["currency"]["currency_name"],
            "id": response.data[0]['id'],
            "name": response.data[0]["name"]
        })


    def get_period_data(self, uid: str, ledger: LedgerModel, month: int, year: int) -> List[EntryModel]:
        """Get a user's entry data in the given month/year period

        Params
        ------
        uid: str
            The user's id
        ledger: LedgerModel
            The ledger from which to search for the data
        month: int
            An integer value in the range [1,12]
        year: int
            An integer value
        
        Returns
        -------
        List[EntryModel]
            A list of entry objects in the specified month/year period
        """
        last_day = calendar.monthrange(year, month)[1]

        start = datetime.datetime(year, month, 1)
        end = datetime.datetime(year, month, last_day)

        query = (self.client
                 .table("entry")
                 .select("*")
                 .eq("created_by", uid)
                 .eq("ledger", ledger.id)
                 .lte("date", end.strftime("%Y-%m-%d"))
                 .gte("date", start.strftime("%Y-%m-%d")))
        
        response = query.execute()

        adapter = TypeAdapter(List[EntryModel])
        return adapter.validate_python(response.data)
