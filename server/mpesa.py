from __future__ import annotations

import base64
import logging
from datetime import datetime
from typing import Any, Dict

import httpx
from config import config

logger = logging.getLogger(__name__)


async def get_access_token() -> str:
    """Get M-Pesa access token for API authentication"""
    try:
        logger.debug("Requesting M-Pesa access token")
        cred = base64.b64encode(f"{config.mpesa_consumer_key}:{config.mpesa_consumer_secret}".encode()).decode()
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{config.mpesa_base}/oauth/v1/generate?grant_type=client_credentials",
                headers={"Authorization": f"Basic {cred}"},
                timeout=15,
            )
            
            if r.status_code != 200:
                logger.error(f"Failed to get access token: {r.status_code} - {r.text}")
                r.raise_for_status()
            
            token = r.json()["access_token"]
            logger.debug("Access token obtained successfully")
            return token
    except Exception as e:
        logger.error(f"Error getting access token: {type(e).__name__} - {str(e)}")
        raise


async def initiate_stk_push(order_id: str, phone_number: str, amount: float) -> Dict[str, Any]:
    """
    Initiate M-Pesa STK push for payment
    
    Args:
        order_id: Order ID for reference
        phone_number: Customer phone number in format 254XXXXXXXXX
        amount: Amount to charge in KSh
    
    Returns:
        Response from M-Pesa API
    """
    try:
        logger.info(f"Initiating STK push for order {order_id}, phone: {phone_number}, amount: {amount}")
        
        # Validate phone number format
        if not phone_number.startswith("254") or len(phone_number) != 12:
            raise ValueError(f"Invalid phone number format: {phone_number}. Expected format: 254XXXXXXXXX")
        
        # Validate amount
        if amount <= 0:
            raise ValueError(f"Invalid amount: {amount}")
        
        access_token = await get_access_token()
        logger.info(f"Access token obtained for order {order_id}")
        
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
            "CallBackURL": "https://tricksy-servantless-divina.ngrok-free.dev/api/mpesa/callback",
            "AccountReference": str(order_id),
            "TransactionDesc": f"Payment for order {order_id}",
        }

        logger.debug(f"STK push payload for order {order_id}: {payload}")

        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{config.mpesa_base}/mpesa/stkpush/v1/processrequest",
                json=payload,
                headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
                timeout=30,
            )
            
            if r.status_code != 200:
                logger.error(f"STK push failed for order {order_id}: {r.status_code} - {r.text}")
                r.raise_for_status()
            
            response = r.json()
            logger.info(f"STK push successful for order {order_id}: {response}")
            return response
            
    except ValueError as ve:
        logger.error(f"Validation error for order {order_id}: {str(ve)}")
        raise
    except Exception as e:
        logger.error(f"STK push error for order {order_id}: {type(e).__name__} - {str(e)}")
        raise
