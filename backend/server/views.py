import os

from dotenv import load_dotenv
from django.http import \
    HttpRequest, \
    HttpResponse

load_dotenv(".env")

secret_key: str | None = os.getenv("SUPABASE_SECRET_KEY")
supabase_url: str | None = os.getenv("SUPABASE_URL")


def foo(req: HttpRequest) -> HttpResponse:
    return HttpResponse("No credentials")
