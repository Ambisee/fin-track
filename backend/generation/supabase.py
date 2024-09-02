from supabase import create_client, Client
from django.conf import settings

supabase_key = settings.SUPABASE_KEY
supabase_url = settings.SUPABASE_URL

client: Client = create_client(supabase_url, supabase_key)
