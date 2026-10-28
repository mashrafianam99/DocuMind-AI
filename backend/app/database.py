
"""Supabase client configuration."""

import os
from functools import lru_cache

from dotenv import load_dotenv
from pathlib import Path
from supabase import Client, create_client

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SECRET_KEY")

    if not url or not key:
        raise RuntimeError(
            "Configure SUPABASE_URL and SUPABASE_SECRET_KEY "
            "in backend/.env."
        )

    return create_client(url, key)
