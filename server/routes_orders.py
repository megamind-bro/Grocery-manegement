from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, Dict, List

from flask import Blueprint, jsonify, request, session
from sqlalchemy.orm import Session

from auth import require_firebase_auth
from db import Order, Product, DeliveryAddress, PaymentMethod, User, SessionLocal
from mpesa import initiate_stk_push

logger = logging.getLogger(__name__)

bp_orders = Blueprint("orders", __name__, url_prefix="/api")


@bp_orders.post("/orders")
def create_order():
    data = request.get_json(force=True) or {}
    user_id = session.get("user_id")
    
    try:
        o = Order(
            user_id=user_id,
            customer_name=data["customerName"],
            customer_phone=data["customerPhone"],
            customer_email=data.get("customerEmail"),
            delivery_address=data["deliveryAddress"],
            items=json.dumps(data["items"]) if isinstance(data.get("items"), list) else data["items"],
            subtotal=float(data["subtotal"]),
            delivery_fee=float(data["deliveryFee"]),
            discount=float(data.get("discount", 0)),
            total=float(data["total"]),
            payment_method=data["paymentMethod"],
            payment_status=data.get("paymentStatus", "pending"),
            order_status=data.get("orderStatus", "processing"),
            mpesa_transaction_id=data.get("mpesaTransactionId"),
        )
    except KeyError as e:
        return jsonify({"message": f"Missing field: {e.args[0]}"}), 400
    except ValueError:
        return jsonify({"message": "Invalid numeric value in order"}), 400

    with SessionLocal() as db:  # type: Session
        # Update product stock for each item in the order
        try:
            items = data.get("items", [])
            if isinstance(items, str):
                items = json.loads(items)
            
            for item in items:
                product = db.query(Product).get(item.get("id"))
                if product:
                    quantity = int(item.get("quantity", 0))
                    if product.stock_quantity >= quantity:
                        product.stock_quantity -= quantity
                        product.in_stock = product.stock_quantity > 0
                    else:
                        return jsonify({"message": f"Insufficient stock for {product.name}"}), 400
        except Exception as e:
            return jsonify({"message": f"Error updating stock: {str(e)}"}), 400
        
        db.add(o)
        db.commit()
        db.refresh(o)
        
        # Save delivery address if user is logged in
        if user_id:
            try:
                # Check if address already exists
                existing_addr = db.query(DeliveryAddress).filter(
                    DeliveryAddress.user_id == user_id,
                    DeliveryAddress.address == data.get("deliveryAddress")
                ).first()
                
                if not existing_addr:
                    addr = DeliveryAddress(
                        user_id=user_id,
                        address=data.get("deliveryAddress", ""),
                        phone=data.get("customerPhone", ""),
                        is_default=False
                    )
                    db.add(addr)
                    db.commit()
            except Exception as e:
                print(f"Error saving address: {str(e)}")
        
        # Save payment method if user is logged in
        if user_id:
            try:
                payment_method = data.get("paymentMethod", "")
                existing_pm = db.query(PaymentMethod).filter(
                    PaymentMethod.user_id == user_id,
                    PaymentMethod.method == payment_method
                ).first()
                
                if not existing_pm:
                    pm = PaymentMethod(
                        user_id=user_id,
                        method=payment_method,
                        details=json.dumps({"phone": data.get("customerPhone", "")}) if payment_method == "mpesa" else None,
                        is_default=False
                    )
                    db.add(pm)
                    db.commit()
            except Exception as e:
                print(f"Error saving payment method: {str(e)}")
        
        # Handle loyalty points deduction and award new points
        if user_id:
            try:
                user = db.query(User).get(user_id)
                if user:
                    # Deduct loyalty points if used
                    loyalty_points_used = int(data.get("loyaltyPointsAmount", 0))
                    if loyalty_points_used > 0:
                        user.loyalty_points = max(0, user.loyalty_points - loyalty_points_used)
                        logger.info(f"Deducted {loyalty_points_used} points from user {user_id}")
                    
                    # Award new loyalty points: 1000 KSh = 100 points
                    order_total = float(data.get("total", 0))
                    new_points = int(order_total / 1000 * 100)  # 100 points per 1000 KSh
                    
                    if new_points > 0:
                        user.loyalty_points += new_points
                        user.total_spent += order_total
                        logger.info(f"Awarded {new_points} points to user {user_id}. Total spent: {user.total_spent}")
                    
                    db.commit()
            except Exception as e:
                logger.error(f"Error updating loyalty points for user {user_id}: {str(e)}")
        
        # Serialize order while still in session context
        order_data = _serialize_order(o)

    if data.get("paymentMethod") == "mpesa":
        try:
            # Format phone number to M-Pesa format (254XXXXXXXXX)
            phone = data["customerPhone"].strip()
            # Remove leading 0 if present and add country code
            if phone.startswith("0"):
                phone = "254" + phone[1:]
            elif not phone.startswith("254"):
                phone = "254" + phone
            
            # Trigger STK push asynchronously
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                result = loop.run_until_complete(
                    initiate_stk_push(str(o.id), phone, float(data["total"]))
                )
                logger.info(f"STK push initiated for order {o.id}: {result}")
            except Exception as stk_error:
                logger.error(f"STK push failed for order {o.id}: {str(stk_error)}")
            finally:
                loop.close()
        except Exception as e:
            logger.error(f"Error processing M-Pesa payment for order {o.id}: {str(e)}")

    return jsonify(order_data)


@bp_orders.get("/orders")
def list_orders():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    with SessionLocal() as db:  # type: Session
        orders = db.query(Order).filter(Order.user_id == user_id).all()
        return jsonify([_serialize_order(o) for o in orders])


@bp_orders.post("/mpesa/callback")
def mpesa_callback():
    body = request.get_json(force=True) or {}
    try:
        stk = body["Body"]["stkCallback"]
    except Exception:
        return jsonify({"message": "Bad callback"}), 400

    if stk.get("ResultCode") == 0:
        receipt = None
        for item in stk.get("CallbackMetadata", {}).get("Item", []):
            if item.get("Name") == "MpesaReceiptNumber":
                receipt = item.get("Value")
                break
        with SessionLocal() as session:  # type: Session
            o = session.query(Order).filter(Order.payment_status == "pending", Order.payment_method == "mpesa").order_by(Order.created_at.desc()).first()
            if o:
                o.payment_status = "completed"
                o.mpesa_transaction_id = receipt
                session.commit()
    return jsonify({"message": "Callback received"}), 200


def _serialize_order(o: Order) -> Dict[str, Any]:
    return {
        "id": o.id,
        "userId": o.user_id,
        "customerName": o.customer_name,
        "customerPhone": o.customer_phone,
        "customerEmail": o.customer_email,
        "deliveryAddress": o.delivery_address,
        "items": o.items,
        "subtotal": f"{o.subtotal:.2f}",
        "loyaltyPoints": user.loyalty_points or 0,
        "deliveryFee": f"{o.delivery_fee:.2f}",
        "discount": f"{o.discount:.2f}",
        "total": f"{o.total:.2f}",
        "paymentMethod": o.payment_method,
        "paymentStatus": o.payment_status,
        "orderStatus": o.order_status,
        "mpesaTransactionId": o.mpesa_transaction_id,
        "createdAt": o.created_at.isoformat(),
    }

