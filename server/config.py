from __future__ import annotations

import os
from dataclasses import dataclass

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    # dotenv is optional; environment variables may already be set
    pass


@dataclass
class Config:
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./grocery.db")
    port: int = int(os.getenv("PORT", "5001"))
    base_url: str = os.getenv("BASE_URL", "http://localhost:5001")

    # Firebase (optional)
    firebase_credentials_json: str | None = os.getenv("FIREBASE_CREDENTIALS_JSON")

    # M-Pesa
    mpesa_base: str = os.getenv("MPESA_BASE", "https://sandbox.safaricom.co.ke")
    mpesa_consumer_key: str = os.getenv("MPESA_CONSUMER_KEY", "")
    mpesa_consumer_secret: str = os.getenv("MPESA_CONSUMER_SECRET", "")
    mpesa_shortcode: str = os.getenv("MPESA_SHORTCODE", "174379")
    mpesa_passkey: str = os.getenv("MPESA_PASSKEY", "")


config = Config()



