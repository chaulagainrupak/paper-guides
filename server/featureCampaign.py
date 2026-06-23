import sqlite3
import os
import uuid
from datetime import datetime, timedelta
import random


DB = os.path.join("./instance", "paper-guides-ads.db")


class AdManager:
    def __init__(self):
        self.active_sessions = {}

    def db(self):
        conn = sqlite3.connect(DB)
        conn.row_factory = sqlite3.Row
        return conn

    def create_session(self):
        session_id = str(uuid.uuid4())

        self.active_sessions[session_id] = {
            "seen_ads": set(),
            "expires_at": datetime.utcnow() + timedelta(minutes=30),
        }

        return session_id

    def cleanup(self):
        now = datetime.utcnow()

        expired = [
            sid
            for sid, session in self.active_sessions.items()
            if session["expires_at"] <= now
        ]

        for sid in expired:
            del self.active_sessions[sid]

    def get_campaign(self, session_id: str | None):
        self.cleanup()
        

        # create session if missing
        if not session_id or session_id not in self.active_sessions:
            session_id = self.create_session()

        session = self.active_sessions[session_id]
        seen = session["seen_ads"]

        conn = self.db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                ads.id,
                ads.campaign_name,
                ads.square_image,
                ads.horizontal_image,
                ads.vertical_image,
                ads.click_url,
                ads.weight,
                sponsors.name AS sponsor_name,
                sponsors.brand_logo AS sponsor_logo
            FROM ads
            LEFT JOIN sponsors ON ads.sponsor_id = sponsors.id
            WHERE ads.active = 1
              AND ads.archived = 0
        """)

        rows = cursor.fetchall()
        conn.close()

        ads = [dict(row) for row in rows if row["id"] not in seen]

        # reset cycle if all seen
        if not ads:
            session["seen_ads"].clear()
            ads = [dict(row) for row in rows]

        if not ads:
            return {
                "session": session_id,
                "expires_in": 0,
                "campaign": None
            }

        # simple selection (replace later with weighted logic)
        # will i ? IDK 
        weights = [ad["weight"] for ad in ads]
        ad = random.choices(ads, weights=weights, k=1)[0]

        seen.add(ad["id"])

        expires_in = int(
            (session["expires_at"] - datetime.utcnow()).total_seconds()
        )

        return {
            "session": session_id,
            "expires_in": expires_in,
            "campaign": {
                "id": ad["id"],
                "name": ad["campaign_name"],
                "images": {
                    "square": ad["square_image"],
                    "horizontal": ad["horizontal_image"],
                    "vertical": ad["vertical_image"],
                },
                "click_url": ad["click_url"],
                "weight": ad["weight"],
                "sponsor": {
                    "name": ad["sponsor_name"],
                    "logo": ad["sponsor_logo"],
                },
            },
        }