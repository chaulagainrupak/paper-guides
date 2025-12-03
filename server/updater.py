import requests
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv(".env")


def sendWebhook(item_type: str, data: dict) -> bool:
    """Send approval notification to Discord"""
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
    if not webhook_url:
        # logger.error("Discord webhook URL not found", extra={'http_request': True})
        return False

    if item_type == "question":
        embed = {
            "title": "✅ New Question Approved!",
            "color": 3066993,  # Green
            "fields": [
                {
                    "name": "Subject",
                    "value": data.get("subject", "N/A"),
                    "inline": True,
                },
                {"name": "Topic", "value": data.get("topic", "N/A"), "inline": True},
                {
                    "name": "Difficulty",
                    "value": f"{data.get('difficulty', 'N/A')}/5",
                    "inline": True,
                },
                {"name": "Board", "value": data.get("board", "N/A"), "inline": True},
                {"name": "Level", "value": data.get("level", "N/A"), "inline": True},
                {
                    "name": "Component",
                    "value": data.get("component", "N/A"),
                    "inline": True,
                },
                {
                    "name": "Submitted By",
                    "value": data.get("username", "N/A"),
                    "inline": True,
                },
            ],
            "timestamp": datetime.utcnow().isoformat(),
        }
    else:  # paper
        embed = {
            "title": "📝 New Past Paper Approved!",
            "color": 3447003,  # Blue
            "fields": [
                {
                    "name": "Subject",
                    "value": data.get("subject", "N/A"),
                    "inline": True,
                },
                {"name": "Year", "value": str(data.get("year", "N/A")), "inline": True},
                {"name": "Board", "value": data.get("board", "N/A"), "inline": True},
                {"name": "Level", "value": data.get("level", "N/A"), "inline": True},
                {
                    "name": "Component",
                    "value": data.get("component", "N/A"),
                    "inline": True,
                },
            ],
            "timestamp": datetime.utcnow().isoformat(),
        }

    try:
        response = requests.post(webhook_url, json={"embeds": [embed]})
        response.raise_for_status()
        # logger.info(f"Discord webhook sent successfully for {item_type} {data.get('uuid')}",extra={'http_request': True})
        return True
    except requests.exceptions.RequestException as e:
        # logger.error(f"Failed to send Discord webhook: {str(e)}",={'http_request': True})
        return False


# sendWebhook(
#     "question",
#     {
#         "subject": "test",
#         "year": 2020,
#         "board": "Test Board",
#         "level": "2",
#         "component": "someComp",
#     },
# )


# sendWebhook(
#     "question",
#     {
#         "subject": "subject",
#         "topic": "topic",
#         "difficulty": "difficulty",
#         "board": "board",
#         "level": "level",
#         "component": "component",
#         "username": "username",
#     },
# )
