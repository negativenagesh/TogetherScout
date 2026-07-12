import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

_pool = None

async def init_db_pool():
    global _pool
    db_url = os.getenv("SUPABASE_DB_URL")
    if not db_url:
        print("Warning: SUPABASE_DB_URL not set. Auditing features will be disabled.")
        return
    try:
        _pool = await asyncpg.create_pool(db_url)
        print("Successfully connected to Supabase Database.")
    except Exception as e:
        print(f"Failed to connect to Supabase: {e}")

async def get_db_pool():
    if not _pool:
        await init_db_pool()
    return _pool

async def close_db_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
