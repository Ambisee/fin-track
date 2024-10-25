import datetime
import calendar
from typing import List
from pydantic import TypeAdapter

from supabase import Client

from ...supabase import client
from ...models import UserViewModel, EntryModel


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

        settings_response = self.client.table("settings").select("allow_report, currency(currency_name)").eq("user_id", uid).single().execute()
        if not settings_response.data:
            return "Unable to retrieve the user's data"
    
        adapter = TypeAdapter(UserViewModel)
        return adapter.validate_python({
            'id': user_response.user.id,
            'currency_name': settings_response.data['currency']['currency_name'],
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
        


    def get_period_data(self, uid: str, month: int, year: int) -> List[EntryModel]:
        """Get a user's entry data in the given month/year period

        Params
        ------
        user_id: str
            The user's id
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
                 .lte("date", end.strftime("%Y-%m-%d"))
                 .gte("date", start.strftime("%Y-%m-%d")))
        
        response = query.execute()

        adapter = TypeAdapter(List[EntryModel])
        return adapter.validate_python(response.data)
