import httpx  
import os
from dotenv import load_dotenv

load_dotenv('.env')

TURNSTILE_SECRET = os.getenv("TURNSTILE_SECRET_KEY")


async def verifyTurnstileToken(token: str) -> bool:
    try:
        data = {
            "secret": TURNSTILE_SECRET,
            "response": token,
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data=data
            )
            result = response.json()
            return result.get("success", False)
    except Exception as e:
        print("Turnstile verification failed:", e)
        return False
