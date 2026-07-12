import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def setup_database():
    db_url = os.getenv("SUPABASE_DB_URL")
    if not db_url or "[YOUR-PASSWORD]" in db_url:
        print("Please set your SUPABASE_DB_URL with the actual password in the .env file before running this script.")
        return

    print("Connecting to Supabase Database...")
    try:
        conn = await asyncpg.connect(db_url)
        
        # Create visitors_audit table
        print("Creating visitors_audit table...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS visitors_audit (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                route TEXT NOT NULL,
                ip_address TEXT,
                country TEXT,
                region TEXT,
                city TEXT,
                zip TEXT,
                lat FLOAT,
                lon FLOAT,
                isp TEXT,
                org TEXT,
                os_name TEXT,
                browser_name TEXT,
                resolution TEXT,
                cpu_cores INTEGER,
                ram_gb INTEGER,
                timezone TEXT,
                language TEXT,
                referrer TEXT,
                timestamp TIMESTAMPTZ DEFAULT NOW()
            );
        """)
        
        # Create chat_audit table
        print("Creating chat_audit table...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS chat_audit (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                query TEXT NOT NULL,
                model_used TEXT,
                ip_address TEXT,
                country TEXT,
                region TEXT,
                city TEXT,
                isp TEXT,
                timestamp TIMESTAMPTZ DEFAULT NOW()
            );
        """)
        
        print("Database setup complete!")
        await conn.close()
    except Exception as e:
        print(f"Error setting up database: {e}")

if __name__ == "__main__":
    asyncio.run(setup_database())
