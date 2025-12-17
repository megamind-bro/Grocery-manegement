from __future__ import annotations

import base64
from datetime import datetime
from typing import Any, Dict

import httpx
from config import config


async def get_access_token() -> str:
    cred = base64.b64encode(f"{config.mpesa_consumer_key}:{config.mpesa_consumer_secret}".encode()).decode()
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{config.mpesa_base}/oauth/v1/generate?grant_type=client_credentials",
            headers={"Authorization": f"Basic {cred}"},
            timeout=15,
        )
        r.raise_for_status()
        return r.json()["access_token"]


async def initiate_stk_push(order_id: str, phone_number: str, amount: float) -> Dict[str, Any]:
    access_token = await get_access_token()
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(f"{config.mpesa_shortcode}{config.mpesa_passkey}{timestamp}".encode()).decode()

    payload = {
        "BusinessShortCode": config.mpesa_shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(round(amount)),
        "PartyA": phone_number,
        "PartyB": config.mpesa_shortcode,
        "PhoneNumber": phone_number,
        "CallBackURL": f"{config.base_url}/api/mpesa/callback",
        "AccountReference": str(order_id),
        "TransactionDesc": f"Payment for order {order_id}",
    }

    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{config.mpesa_base}/mpesa/stkpush/v1/processrequest",
            json=payload,
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            timeout=30,
        )
        r.raise_for_status()
        return r.json()
