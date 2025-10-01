from __future__ import annotations

import json
from typing import Any, Dict, List

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session

from .auth import require_firebase_auth
from .db import Order, SessionLocal
from .mpesa import initiate_stk_push

bp_orders = Blueprint("orders", __name__, url_prefix="/api")


@bp_orders.post("/orders")
def create_order():
    data = request.get_json(force=True) or {}
    try:
        o = Order(
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

    with SessionLocal() as session:  # type: Session
        session.add(o)
        session.commit()
        session.refresh(o)

    if data.get("paymentMethod") == "mpesa":
        try:
            # fire-and-forget; in real code, persist checkoutRequestID mapping
            import anyio
            anyio.run(initiate_stk_push, str(o.id), data["customerPhone"], float(data["total"]))
        except Exception:
            pass

    return jsonify(_serialize_order(o))


@bp_orders.get("/orders")
@require_firebase_auth
def list_orders():
    with SessionLocal() as session:  # type: Session
        orders = session.query(Order).all()
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

