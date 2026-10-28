
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(Path(__file__).resolve().parent / ".env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SECRET_KEY")

if not url or not key:
    raise SystemExit(
        "Missing SUPABASE_URL or SUPABASE_SECRET_KEY in backend/.env"
    )

client = create_client(url, key)

try:
    result = (
        client.table("documents")
        .select("id")
        .limit(1)
        .execute()
    )
    print("Supabase connection successful!")
    print(f"Query completed. Rows returned: {len(result.data)}")
except Exception:
    print("Supabase query failed. Check the configuration and permissions.")
    raise
