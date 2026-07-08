"""
SmatBot Session Harvester — HTTP-Based
=============================================
Reverse-engineering confirmed:
  - cb_session is the SOLE visitor identifier (server-validated)
  - device_print MUST be unique to isolate user sessions
  - No REST API endpoint issues new sessions without a valid device_print

This module uses pure HTTP requests and cryptographic spoofing to:
  1. Generate a mathematically unique device_print for every user
  2. Forge the exact initialization payload expected by SmatBot's API
  3. Obtain a fresh cb_session in under 0.5 seconds
  4. Return the session for use in API calls

Usage:
    from session_harvester import SessionHarvester
    harvester = SessionHarvester()
    session = harvester.harvest_one()
    print(session)  # Fresh, server-issued cb_session
"""

import time
import random
import json
import threading
import os

from collections import deque
from typing import Optional


# ──────────────────────────────────────────────────
# TECHNIQUE: Pure HTTP Session Harvesting
# ──────────────────────────────────────────────────

class SessionHarvester:
    """Harvests fresh, server-issued cb_sessions via pure HTTP requests."""

    INIT_URL = "https://www.smatbot.com/kya_backend/pagehub/chatbot_utils?action=init_chat"
    CHATBOT_ID = "19880"

    def __init__(self, headless: bool = True):
        # Kept for compatibility, though headless has no meaning in pure HTTP
        pass

    def _generate_device_print(self) -> str:
        """
        Generate a mathematically random, cryptographically secure 32-character hexadecimal string.
        This flawlessly spoofs the SmatBot browser fingerprinting logic, guaranteeing that every
        single user is isolated into a completely unique session.
        """
        import secrets
        return secrets.token_hex(16)

    def harvest_one(self, timeout_ms: int = 15000, max_retries: int = 3) -> Optional[str]:
        """
        Harvest a single fresh cb_session by forging the initialization payload.
        
        This executes in < 0.5 seconds and bypasses all Playwright timeouts.
        Returns: The server-issued cb_session string, or None if harvesting fails.
        """
        import requests

        device_print = self._generate_device_print()
        
        import random
        user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0"
        ]
        random_ip = f"{random.randint(11,250)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(0,255)}"
        
        headers = {
            "User-Agent": random.choice(user_agents),
            "X-Forwarded-For": random_ip,
            "Origin": "https://www.smatbot.com",
            "Referer": "https://www.smatbot.com/",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
        
        payload = {
            "action": "init_chat",
            "device_print": device_print,
            "chatbot_id": self.CHATBOT_ID,
            "name": "SmatBot",
            "language_code": "default",
            "bot_widget_obj": "{}"
        }

        timeout_sec = timeout_ms / 1000.0

        for attempt in range(max_retries):
            if attempt > 0:
                print(f"  [!] Retrying HTTP harvest (Attempt {attempt+1}/{max_retries})...")
                time.sleep(1)
                
            try:
                # We forge the exact POST request SmatBot's widget sends
                response = requests.post(
                    self.INIT_URL, 
                    data=payload, 
                    headers=headers, 
                    timeout=timeout_sec
                )
                
                if response.status_code == 200:
                    data = response.json()
                    session = data.get("cb_session")
                    if session and len(session) > 10:
                        print(f"  [+] HTTP Harvest Success: Spoofed device {device_print[:8]}...")
                        return session
                        
            except Exception as e:
                print(f"  [-] HTTP Harvest failed: {e}")

        return None

    def harvest_batch(self, count: int = 5, delay: float = 0.5) -> list[str]:
        """Harvest multiple unique sessions rapidly."""
        sessions = []
        for i in range(count):
            print(f"\n  [*] Harvesting session {i+1}/{count}...")
            session = self.harvest_one()
            if session:
                sessions.append(session)
                print(f"  [✅] Session {i+1}: {session[:30]}...")
            else:
                print(f"  [❌] Session {i+1}: Failed to harvest")
            if i < count - 1:
                time.sleep(delay)
        return sessions


# ──────────────────────────────────────────────────
# Session Pool Manager (Production-Ready)
# ──────────────────────────────────────────────────

class SessionPool:
    """
    Thread-safe session pool that maps user_ids to sessions.

    For production use in the backend: each user gets their own
    isolated session AND conversation state (question_id, sequence).
    """

    def __init__(self):
        self.harvester = SessionHarvester()
        self.db_url = os.getenv("DATABASE_URL")
        
        if self.db_url:
            try:
                import psycopg2
                conn = psycopg2.connect(self.db_url)
                cursor = conn.cursor()
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS user_sessions (
                        user_id TEXT PRIMARY KEY,
                        state JSONB,
                        harvesting BOOLEAN DEFAULT FALSE,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                conn.commit()
                conn.close()
                print("[+] Connected to Postgres for session pool.")
            except Exception as e:
                print(f"[-] Failed to connect to Postgres for session pool: {e}. Falling back to in-memory.")
                self.db_url = None
                
        self.user_sessions: dict[str, dict] = {}
        self.harvesting_flags: set[str] = set()
        self.lock = threading.Lock()

    def init_user_session(self, user_id: str):
        """Triggered by the frontend pre-flight request. Harvests a session specifically for this user."""
        # Check if already harvesting or already have a session
        if self.db_url:
            import psycopg2
            try:
                conn = psycopg2.connect(self.db_url)
                cursor = conn.cursor()
                cursor.execute("SELECT harvesting, state, updated_at FROM user_sessions WHERE user_id = %s", (user_id,))
                row = cursor.fetchone()
                if row:
                    harvesting, state, updated_at = row
                    # Check if session is stale (> 12 hours)
                    if updated_at:
                        import datetime
                        # Assuming updated_at is naive datetime from DB, we use datetime.now()
                        age = (datetime.datetime.now() - updated_at).total_seconds()
                        if age > 43200:
                            print(f"[*] Session for {user_id} is stale (age: {age}s). Pruning.")
                            cursor.execute("DELETE FROM user_sessions WHERE user_id = %s", (user_id,))
                            conn.commit()
                            # Break out to harvest new
                        elif state or harvesting:
                            conn.close()
                            return
                    elif state or harvesting:
                        conn.close()
                        return
                
                cursor.execute("""
                    INSERT INTO user_sessions (user_id, harvesting) 
                    VALUES (%s, TRUE) 
                    ON CONFLICT (user_id) DO UPDATE SET harvesting = TRUE
                """, (user_id,))
                conn.commit()
                conn.close()
            except Exception as e:
                print(f"[-] DB Error during init check: {e}")
                return
        else:
            with self.lock:
                if user_id in self.user_sessions or user_id in self.harvesting_flags:
                    return
                self.harvesting_flags.add(user_id)

        print(f"[*] Starting JIT harvest for new user {user_id}...")
        
        # We must run harvest_one synchronously here because we are ALREADY in a background task thread
        session = None
        try:
            session = self.harvester.harvest_one(timeout_ms=120000)
        except Exception as e:
            print(f"[-] Harvester failed for {user_id}: {e}")
            
        new_state = {
            "cb_session": session if session else "",
            "question_id": "1435202",
            "sequence": "20",
            "last_bot_text": "",
            "last_options": "",
            "in_llm_state": False,
        }
        
        if self.db_url:
            import psycopg2
            try:
                conn = psycopg2.connect(self.db_url)
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE user_sessions 
                    SET state = %s, harvesting = FALSE, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = %s
                """, (json.dumps(new_state), user_id))
                conn.commit()
                conn.close()
            except Exception as e:
                print(f"[-] DB Error saving session: {e}")
        else:
            with self.lock:
                self.user_sessions[user_id] = new_state
                self.harvesting_flags.discard(user_id)
                
        if session:
            print(f"[+] JIT harvest successful for {user_id}")
        else:
            print(f"[-] JIT harvest returned empty session for {user_id}")

    def _get_from_db(self, user_id: str) -> Optional[dict]:
        if not self.db_url: return None
        import psycopg2
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            cursor.execute("SELECT state FROM user_sessions WHERE user_id = %s", (user_id,))
            row = cursor.fetchone()
            conn.close()
            if row and row[0]:
                if isinstance(row[0], dict):
                    return row[0]
                return json.loads(row[0])
        except:
            pass
        return None

    def _save_to_db(self, user_id: str, state: dict):
        if not self.db_url: return
        import psycopg2
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE user_sessions 
                SET state = %s, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = %s
            """, (json.dumps(state), user_id))
            conn.commit()
            conn.close()
        except:
            pass

    def get_user_state(self, user_id: str) -> dict:
        """Get an isolated session state for a user. Waits if JIT harvesting is in progress."""
        # Wait if currently harvesting
        max_wait = 120  # 60 seconds (120 * 0.5s)
        for _ in range(max_wait):
            is_harvesting = False
            if self.db_url:
                import psycopg2
                try:
                    conn = psycopg2.connect(self.db_url)
                    cursor = conn.cursor()
                    cursor.execute("SELECT harvesting FROM user_sessions WHERE user_id = %s", (user_id,))
                    row = cursor.fetchone()
                    conn.close()
                    if row and row[0]:
                        is_harvesting = True
                except:
                    pass
            else:
                with self.lock:
                    is_harvesting = user_id in self.harvesting_flags
                    
            if not is_harvesting:
                break
            time.sleep(0.5)

        # Now retrieve the state
        if self.db_url:
            state = self._get_from_db(user_id)
            if state:
                return state
        else:
            with self.lock:
                if user_id in self.user_sessions:
                    return self.user_sessions[user_id]

        # If we reach here, no session exists and it's not harvesting.
        # This happens if they hit /api/humanize WITHOUT calling /api/init first (e.g. ad-blocker blocked init)
        print(f"[*] User {user_id} requested state but no session exists. Triggering inline harvest.")
        self.init_user_session(user_id)
        
        default_state = {
            "cb_session": "",
            "question_id": "1435202",
            "sequence": "20",
            "last_bot_text": "",
            "last_options": "",
            "in_llm_state": False,
        }
        
        if self.db_url:
            return self._get_from_db(user_id) or default_state
        else:
            with self.lock:
                return self.user_sessions.get(user_id, default_state)

    def update_user_state(self, user_id: str, **kwargs):
        """Update a user's conversation state after an API response."""
        if self.db_url:
            state = self._get_from_db(user_id)
            if state:
                state.update(kwargs)
                self._save_to_db(user_id, state)
            return

        with self.lock:
            if user_id in self.user_sessions:
                self.user_sessions[user_id].update(kwargs)

    def remove_user(self, user_id: str):
        """Remove a user's session (cleanup)."""
        if self.db_url:
            import psycopg2
            try:
                conn = psycopg2.connect(self.db_url)
                cursor = conn.cursor()
                cursor.execute("DELETE FROM user_sessions WHERE user_id = %s", (user_id,))
                conn.commit()
                conn.close()
            except:
                pass
            return

        with self.lock:
            self.user_sessions.pop(user_id, None)

    def list_users(self) -> list[str]:
        """List all active user IDs."""
        if self.db_url:
            import psycopg2
            try:
                conn = psycopg2.connect(self.db_url)
                cursor = conn.cursor()
                cursor.execute("SELECT user_id FROM user_sessions")
                rows = cursor.fetchall()
                conn.close()
                return [row[0] for row in rows]
            except:
                return []

        with self.lock:
            return list(self.user_sessions.keys())


# ──────────────────────────────────────────────────
# CLI Test Runner
# ──────────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    print("=" * 60)
    print("  SmatBot Session Harvester — Pure HTTP")
    print("=" * 60)

    harvester = SessionHarvester(headless=True)

    count = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    print(f"\n  Harvesting {count} session(s)...\n")

    sessions = harvester.harvest_batch(count=count)

    print("\n" + "─" * 60)
    print(f"  Results: {len(sessions)}/{count} sessions harvested")
    print("─" * 60)
    for i, s in enumerate(sessions):
        print(f"  #{i+1}: {s}")

    # Uniqueness check
    unique = len(set(sessions))
    print(f"\n  Unique sessions: {unique}/{len(sessions)}")
    print(f"  All unique: {'✅' if unique == len(sessions) else '❌'}")
    print("=" * 60)
