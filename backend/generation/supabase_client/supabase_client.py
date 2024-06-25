import os

from supabase import create_client, Client

supabase_key = os.getenv("SUPABASE_SECRET_KEY")
supabase_url = os.getenv("SUPABASE_URL")

client: Client = create_client(supabase_url, supabase_key)
