import os
import datetime
import calendar

from dotenv import load_dotenv
from django.conf import settings
from supabase import create_client, Client
from gotrue import User


class DataRetriever:
    """A wrapper class around a Supabase client that provides a collection of
    helper functions

    Attributes
    ----------
    client: Client
        A Supabase client object that is initialized with admin privileges
    """

    def __init__(self, supabase_url, secret_key):
        self.client: Client = create_client(supabase_url, secret_key)

    @staticmethod
    def initialize():
        if settings.DEBUG:
            load_dotenv()

        supabase_url = os.getenv("SUPABASE_URL")
        secret_key = os.getenv("SUPABASE_SECRET_KEY")

        if supabase_url is None or secret_key is None:
            return None

        return DataRetriever(supabase_url, secret_key)

    def list_users(self) -> list[User]:
        """Retrieve the list of users in the app.

        Params
        ------
        None

        Returns
        -------
        list of User
            The list of user registered on the application
        """

        return self.client.auth.admin.list_users()

    def get_allow_report_users(self) -> list[User]:
        """Filter the users for those who allow reports

        Params
        ------
        None

        Returns
        list of User
            The list of users that allow reports
        """
        users = self.list_users()
        result = []

        for user in users:
            if not user.user_metadata.get("allow_report"):
                continue

            result.append(user)

        return result

    def get_period_data(self, user: User, month: int, year: int):
        last_date = calendar.monthrange(year, month)[1]

        start = datetime.datetime(year, month, 1)
        end = datetime.datetime(year, month, last_date)

        query = (self.client
                 .table("entry")
                 .select("*")
                 .eq("created_by", user.id)
                 .lte("date", end.strftime("%Y-%m-%d"))
                 .gte("date", start.strftime("%Y-%m-%d")))
        
        response = query.execute()
        return response.data
