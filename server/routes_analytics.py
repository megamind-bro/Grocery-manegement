from __future__ import annotations

import json
from flask import Blueprint, jsonify, session
from sqlalchemy.orm import Session

from db import Order, SessionLocal, User

bp_analytics = Blueprint("analytics", __name__, url_prefix="/api")


def _require_admin():
    """Check if current user is admin"""
    from flask import session as flask_session
    if not flask_session.get("is_admin"):
        return None
    uid = flask_session.get("user_id")
    if not uid:
        return None
    with SessionLocal() as db:
        user = db.query(User).get(uid)
        if user and user.is_admin:
            return user
    return None


@bp_analytics.get("/analytics")
def analytics():
    # Only admins can access analytics
    admin_user = _require_admin()
    if not admin_user:
        return jsonify({"message": "Unauthorized. Admin access required."}), 403
    with SessionLocal() as db:  # type: Session
        orders = db.query(Order).all()
        completed = [o for o in orders if o.payment_status == "completed"]
        total_revenue = sum(float(o.total) for o in completed)
        total_orders = len(orders)
        avg_order_value = (total_revenue / total_orders) if total_orders else 0.0
        active_customers = len({o.customer_phone for o in orders})

        product_sales = {}
        for o in completed:
            try:
                items = json.loads(o.items) if isinstance(o.items, str) else o.items
            except Exception:
                items = []
            for it in items:
                pid = str(it.get("id"))
                entry = product_sales.setdefault(pid, {"count": 0, "revenue": 0.0, "product": it})
                entry["count"] += int(it.get("quantity", 0))
                entry["revenue"] += float(it.get("quantity", 0)) * float(it.get("price", 0))

        top_products = [
            {
                "id": pid,
                "name": data["product"].get("name"),
                "image": data["product"].get("image"),
                "sales": data["count"],
                "revenue": data["revenue"],
            }
            for pid, data in product_sales.items()
        ]
        top_products.sort(key=lambda x: x["revenue"], reverse=True)
        top_products = top_products[:5]

        orders.sort(key=lambda o: o.created_at, reverse=True)
        recent = [
            {
                "id": o.id,
                "customerName": o.customer_name,
                "total": f"{o.total:.2f}",
                "paymentStatus": o.payment_status,
                "createdAt": o.created_at.isoformat(),
            }
            for o in orders[:10]
        ]

        return jsonify({
            "totalRevenue": total_revenue,
            "totalOrders": total_orders,
            "avgOrderValue": avg_order_value,
            "activeCustomers": active_customers,
            "topProducts": top_products,
            "recentOrders": recent,
        })

