from __future__ import annotations

import json
from typing import Any, Dict, List

from flask import Blueprint, jsonify, request, session
from sqlalchemy.orm import Session

from auth import require_firebase_auth
from db import Order, SessionLocal, DeliveryAddress, PaymentMethod, Product, User, Cart
from mpesa import initiate_stk_push

bp_orders = Blueprint("orders", __name__, url_prefix="/api")


@bp_orders.post("/orders")
def create_order():
    # Disallow admins from placing orders
    from flask import session as flask_session
    if flask_session.get("is_admin"):
        return jsonify({"message": "Admins cannot place orders"}), 403
    
    # Get current user info to associate order with user
    user_id = flask_session.get("user_id")
    username = flask_session.get("username")
    
    data = request.get_json(force=True) or {}
    
    # If user is logged in, get their info from the database to associate order
    customer_email = data.get("customerEmail")
    customer_name = data.get("customerName")
    
    if user_id:
        with SessionLocal() as db:
            from db import User
            user = db.query(User).get(user_id)
            if user:
                # Use user's email if not provided in form
                if not customer_email and user.email:
                    customer_email = user.email
                # Always use user's name from database for consistency in order matching
                if user.name:
                    customer_name = user.name
    
    try:
        # Ensure we have required fields
        if not customer_name:
            customer_name = data["customerName"]
        
        o = Order(
            user_id=user_id,
            customer_name=customer_name,
            customer_phone=data["customerPhone"],
            customer_email=customer_email,
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
        db.add(o)
        db.commit()
        db.refresh(o)
        
        # Save delivery address if user is logged in
        if user_id and data.get("deliveryAddress"):
            # Check if address already exists for this user
            existing_addr = db.query(DeliveryAddress).filter(
                DeliveryAddress.user_id == user_id,
                DeliveryAddress.address == data["deliveryAddress"]
            ).first()
            if not existing_addr:
                addr = DeliveryAddress(
                    user_id=user_id,
                    address=data["deliveryAddress"],
                    phone=data["customerPhone"],
                    is_default=False
                )
                db.add(addr)
        
        # Save payment method if user is logged in
        if user_id and data.get("paymentMethod"):
            # Check if payment method already exists for this user
            existing_pm = db.query(PaymentMethod).filter(
                PaymentMethod.user_id == user_id,
                PaymentMethod.method == data["paymentMethod"]
            ).first()
            if not existing_pm:
                pm = PaymentMethod(
                    user_id=user_id,
                    method=data["paymentMethod"],
                    details=json.dumps({"phone": data.get("customerPhone")}) if data["paymentMethod"] == "mpesa" else None,
                    is_default=False
                )
                db.add(pm)
        
        # Reduce stock quantities and calculate loyalty points
        items_list = json.loads(data["items"]) if isinstance(data.get("items"), str) else data.get("items", [])
        total_spent = float(data["total"])
        
        for item in items_list:
            product_id = item.get("id")
            quantity = int(item.get("quantity", 0))
            if product_id and quantity > 0:
                product = db.query(Product).get(product_id)
                if product:
                    # Reduce stock
                    product.stock_quantity = max(0, product.stock_quantity - quantity)
                    if product.stock_quantity == 0:
                        product.in_stock = False
                    db.add(product)
        
        # Calculate and update loyalty points for logged-in users
        if user_id:
            user = db.query(User).get(user_id)
            if user:
                user.total_spent += total_spent
                
                # Check eligibility (spent over 1000 KES)
                if user.total_spent >= 1000.0:
                    user.loyalty_eligible = True
                    # Calculate points: 10 points per 100 KES spent
                    # Points earned from this order
                    points_earned = int((total_spent / 100.0) * 10)
                    user.loyalty_points += points_earned
                
                db.add(user)
        
        # Clear user's cart after successful order
        if user_id:
            cart = db.query(Cart).filter(Cart.user_id == user_id).first()
            if cart:
                cart.items = "[]"
                db.add(cart)
        
        db.commit()
        
        # Serialize order while still in session context
        order_data = _serialize_order(o)
        order_id = o.id

    if data.get("paymentMethod") == "mpesa":
        try:
            # fire-and-forget; in real code, persist checkoutRequestID mapping
            import anyio
            anyio.run(initiate_stk_push, str(order_id), data["customerPhone"], float(data["total"]))
        except Exception:
            pass

    return jsonify(order_data)


@bp_orders.get("/orders")
@require_firebase_auth
def list_orders():
    with SessionLocal() as db:  # type: Session
        orders = db.query(Order).all()
        return jsonify([_serialize_order(o) for o in orders])


@bp_orders.get("/orders/user")
def list_user_orders():
    """Get orders for the current logged-in user"""
    from flask import session as flask_session
    user_id = flask_session.get("user_id")
    
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    with SessionLocal() as db:  # type: Session
        # Get orders by user_id (most reliable)
        orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
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
        with SessionLocal() as db:  # type: Session
            o = db.query(Order).filter(Order.payment_status == "pending", Order.payment_method == "mpesa").order_by(Order.created_at.desc()).first()
            if o:
                o.payment_status = "completed"
                o.mpesa_transaction_id = receipt
                db.commit()
    return jsonify({"message": "Callback received"}), 200


def _serialize_order(o: Order) -> Dict[str, Any]:
    return {
        "id": o.id,
        "customerName": o.customer_name,
        "customerPhone": o.customer_phone,
        "customerEmail": o.customer_email,
        "deliveryAddress": o.delivery_address,
        "items": o.items,
        "subtotal": f"{o.subtotal:.2f}",
        "deliveryFee": f"{o.delivery_fee:.2f}",
        "discount": f"{o.discount:.2f}",
        "total": f"{o.total:.2f}",
        "paymentMethod": o.payment_method,
        "paymentStatus": o.payment_status,
        "orderStatus": o.order_status,
        "mpesaTransactionId": o.mpesa_transaction_id,
        "createdAt": o.created_at.isoformat(),
    }

