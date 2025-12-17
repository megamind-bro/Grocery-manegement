from __future__ import annotations

from typing import Optional

from flask import Blueprint, jsonify, request, session

from db import SessionLocal, User, DeliveryAddress, PaymentMethod

bp_profile = Blueprint("profile", __name__, url_prefix="/api/profile")


def _current_user(db) -> Optional[User]:
    uid = session.get("user_id")
    if not uid:
        return None
    return db.query(User).get(uid)


@bp_profile.get("")
def get_profile():
    with SessionLocal() as db:
        user = _current_user(db)
        if not user:
            return jsonify({"message": "Unauthorized"}), 401
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.name,
            "isAdmin": bool(user.is_admin),
        })


@bp_profile.put("")
def update_profile():
    data = request.get_json(force=True) or {}
    with SessionLocal() as db:
        user = _current_user(db)
        if not user:
            return jsonify({"message": "Unauthorized"}), 401
        name = (data.get("name") or user.name).strip()
        email = (data.get("email") or None)
        user.name = name
        user.email = email
        db.commit()
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.name,
            "isAdmin": bool(user.is_admin),
        })


@bp_profile.get("/addresses")
def get_addresses():
    with SessionLocal() as db:
        user = _current_user(db)
        if not user:
            return jsonify({"message": "Unauthorized"}), 401
        addresses = db.query(DeliveryAddress).filter(DeliveryAddress.user_id == user.id).order_by(DeliveryAddress.is_default.desc(), DeliveryAddress.created_at.desc()).all()
        return jsonify([{
            "id": a.id,
            "address": a.address,
            "phone": a.phone,
            "isDefault": bool(a.is_default),
            "createdAt": a.created_at.isoformat(),
        } for a in addresses])


@bp_profile.get("/payment-methods")
def get_payment_methods():
    with SessionLocal() as db:
        user = _current_user(db)
        if not user:
            return jsonify({"message": "Unauthorized"}), 401
        methods = db.query(PaymentMethod).filter(PaymentMethod.user_id == user.id).order_by(PaymentMethod.is_default.desc(), PaymentMethod.created_at.desc()).all()
        return jsonify([{
            "id": m.id,
            "method": m.method,
            "details": m.details,
            "isDefault": bool(m.is_default),
            "createdAt": m.created_at.isoformat(),
        } for m in methods])


