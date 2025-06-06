import requests
import os
from dotenv import load_dotenv

load_dotenv('.env')

TURNSTILE_SECRET_KEY = os.getenv("TURNSTILE_SECRET_KEY")


def verifyTurnstileToken(token: str) -> bool:
    try:
        if TURNSTILE_SECRET_KEY == "DEV":
            return True
            
        payload = {
            "secret": TURNSTILE_SECRET_KEY,
            "response": token
        }
        
        response = requests.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data=payload,
                timeout=5
        )

        result = response.json()
        return (result.get('success'))

    except Exception as e:
        print("Turnstile verification failed:", e)
        return False


