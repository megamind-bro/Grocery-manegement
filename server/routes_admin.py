from __future__ import annotations

import base64
from typing import Optional

from flask import Blueprint, jsonify, request, session

from db import Product, SessionLocal, User, Order
import json

bp_admin = Blueprint("admin", __name__, url_prefix="/api/admin")


def _parse_basic_auth(header: str) -> Optional[tuple[str, str]]:
    if not header.startswith("Basic "):
        return None
    try:
        raw = header.split(" ", 1)[1]
        decoded = base64.b64decode(raw).decode("utf-8")
        username, password = decoded.split(":", 1)
        return username, password
    except Exception:
        return None


def _require_admin() -> Optional[User]:
    # Session-based admin
    if session.get("is_admin"):
        uid = session.get("user_id")
        if uid:
            with SessionLocal() as s:
                u = s.query(User).get(uid)
                if u and u.is_admin:
                    return u
    auth = request.headers.get("Authorization", "")
    creds = _parse_basic_auth(auth)
    if not creds:
        return None
    email, password = creds
    from werkzeug.security import check_password_hash
    with SessionLocal() as session:
        user = session.query(User).filter(User.email == email, User.is_admin.is_(True)).first()
        if not user or not check_password_hash(user.password_hash, password):
            return None
        return user


@bp_admin.post("/products")
def admin_add_product():
    user = _require_admin()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    data = request.get_json(force=True) or {}
    required = ["name", "price", "image", "category"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400
    
    with SessionLocal() as db:
        p = Product(
            name=data["name"],
            description=data.get("description"),
            price=float(data["price"]),
            image=data["image"],
            category=data["category"],
            size=data.get("size"),
            stock_quantity=int(data.get("stockQuantity", 0)),
            in_stock=bool(data.get("inStock", True)) and int(data.get("stockQuantity", 0)) > 0,
            delivery_price=float(data["deliveryPrice"]) if data.get("deliveryPrice") else None,
            discount=float(data["discount"]) if data.get("discount") else None,
        )
        db.add(p)
        db.commit()
        db.refresh(p)
        return jsonify({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "image": p.image,
            "category": p.category,
            "size": p.size,
            "stockQuantity": p.stock_quantity,
            "inStock": bool(p.in_stock) and p.stock_quantity > 0,
            "deliveryPrice": p.delivery_price,
            "discount": p.discount,
            "createdAt": p.created_at.isoformat(),
        })


@bp_admin.put("/products/<int:product_id>")
def admin_update_product(product_id: int):
    user = _require_admin()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    
    data = request.get_json(force=True) or {}
    with SessionLocal() as db:
        product = db.query(Product).get(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404
        
        if "name" in data:
            product.name = data["name"]
        if "description" in data:
            product.description = data.get("description")
        if "price" in data:
            product.price = float(data["price"])
        if "image" in data:
            product.image = data["image"]
        if "category" in data:
            product.category = data["category"]
        if "size" in data:
            product.size = data.get("size")
        if "stockQuantity" in data:
            product.stock_quantity = int(data["stockQuantity"])
            product.in_stock = product.stock_quantity > 0
        if "deliveryPrice" in data:
            product.delivery_price = float(data["deliveryPrice"]) if data["deliveryPrice"] else None
        if "discount" in data:
            product.discount = float(data["discount"]) if data["discount"] else None
        
        db.commit()
        db.refresh(product)
        
        return jsonify({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "image": product.image,
            "category": product.category,
            "size": product.size,
            "stockQuantity": product.stock_quantity,
            "inStock": bool(product.in_stock) and product.stock_quantity > 0,
            "deliveryPrice": product.delivery_price,
            "discount": product.discount,
            "createdAt": product.created_at.isoformat(),
        })


@bp_admin.delete("/products/<int:product_id>")
def admin_delete_product(product_id: int):
    user = _require_admin()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    
    with SessionLocal() as db:
        product = db.query(Product).get(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404
        
        db.delete(product)
        db.commit()
        
        return jsonify({"message": "Product deleted"})


@bp_admin.post("/products/<int:product_id>/restock")
def admin_restock_product(product_id: int):
    user = _require_admin()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    
    data = request.get_json(force=True) or {}
    quantity = int(data.get("quantity", 0))
    
    if quantity <= 0:
        return jsonify({"message": "Quantity must be greater than 0"}), 400
    
    with SessionLocal() as db:
        product = db.query(Product).get(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404
        
        product.stock_quantity += quantity
        product.in_stock = True
        db.commit()
        db.refresh(product)
        
        return jsonify({
            "id": product.id,
            "stockQuantity": product.stock_quantity,
            "inStock": product.in_stock,
        })


@bp_admin.get("/customers")
def admin_list_customers():
    user = _require_admin()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    # Derive customers from orders (no separate customer table yet)
    from db import Order
    with SessionLocal() as session:
        orders = session.query(Order).all()
        customers = {}
        for o in orders:
            key = (o.customer_phone, o.customer_email or "")
            customers[key] = {
                "name": o.customer_name,
                "phone": o.customer_phone,
                "email": o.customer_email,
                "lastOrderAt": o.created_at.isoformat(),
            }
        return jsonify(list(customers.values()))


@bp_admin.get("/analytics")
def admin_analytics_passthrough():
    user = _require_admin()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    # Reuse analytics blueprint handler
    from routes_analytics import analytics as analytics_handler
    return analytics_handler()  # returns a Flask response


@bp_admin.get("/orders")
def admin_list_orders():
    user = _require_admin()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    
    with SessionLocal() as db:
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
        orders_data = []
        for o in orders:
            items = []
            try:
                items = json.loads(o.items) if isinstance(o.items, str) else o.items
            except:
                pass
            
            user_info = None
            if o.user_id:
                u = db.query(User).get(o.user_id)
                if u:
                    user_info = {
                        "id": u.id,
                        "username": u.username,
                        "name": u.name,
                        "email": u.email,
                    }
            
            orders_data.append({
                "id": o.id,
                "userId": o.user_id,
                "user": user_info,
                "customerName": o.customer_name,
                "customerPhone": o.customer_phone,
                "customerEmail": o.customer_email,
                "deliveryAddress": o.delivery_address,
                "items": items,
                "subtotal": f"{o.subtotal:.2f}",
                "deliveryFee": f"{o.delivery_fee:.2f}",
                "discount": f"{o.discount:.2f}",
                "total": f"{o.total:.2f}",
                "paymentMethod": o.payment_method,
                "paymentStatus": o.payment_status,
                "orderStatus": o.order_status,
                "mpesaTransactionId": o.mpesa_transaction_id,
                "createdAt": o.created_at.isoformat(),
            })
        
        return jsonify(orders_data)


@bp_admin.get("/orders/<int:order_id>")
def admin_get_order(order_id: int):
    user = _require_admin()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    
    with SessionLocal() as db:
        order = db.query(Order).get(order_id)
        if not order:
            return jsonify({"message": "Order not found"}), 404
        
        items = []
        try:
            items = json.loads(order.items) if isinstance(order.items, str) else order.items
        except:
            pass
        
        user_info = None
        if order.user_id:
            u = db.query(User).get(order.user_id)
            if u:
                user_info = {
                    "id": u.id,
                    "username": u.username,
                    "name": u.name,
                    "email": u.email,
                    "loyaltyPoints": u.loyalty_points,
                    "totalSpent": u.total_spent,
                }
        
        return jsonify({
            "id": order.id,
            "userId": order.user_id,
            "user": user_info,
            "customerName": order.customer_name,
            "customerPhone": order.customer_phone,
            "customerEmail": order.customer_email,
            "deliveryAddress": order.delivery_address,
            "items": items,
            "subtotal": f"{order.subtotal:.2f}",
            "deliveryFee": f"{order.delivery_fee:.2f}",
            "discount": f"{order.discount:.2f}",
            "total": f"{order.total:.2f}",
            "paymentMethod": order.payment_method,
            "paymentStatus": order.payment_status,
            "orderStatus": order.order_status,
            "mpesaTransactionId": order.mpesa_transaction_id,
            "createdAt": order.created_at.isoformat(),
        })


@bp_admin.get("/users")
def admin_list_users():
    user = _require_admin()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    
    with SessionLocal() as db:
        users = db.query(User).filter(User.is_admin == False).all()
        return jsonify([{
            "id": u.id,
            "username": u.username,
            "name": u.name,
            "email": u.email,
            "loyaltyPoints": u.loyalty_points,
            "loyaltyEligible": u.loyalty_eligible,
            "totalSpent": u.total_spent,
            "createdAt": u.created_at.isoformat(),
        } for u in users])


@bp_admin.put("/users/<int:user_id>/loyalty")
def admin_update_loyalty(user_id: int):
    user = _require_admin()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    
    data = request.get_json(force=True) or {}
    with SessionLocal() as db:
        target_user = db.query(User).get(user_id)
        if not target_user:
            return jsonify({"message": "User not found"}), 404
        
        if "loyaltyEligible" in data:
            target_user.loyalty_eligible = bool(data["loyaltyEligible"])
        if "loyaltyPoints" in data:
            target_user.loyalty_points = int(data["loyaltyPoints"])
        
        db.commit()
        db.refresh(target_user)
        
        return jsonify({
            "id": target_user.id,
            "loyaltyPoints": target_user.loyalty_points,
            "loyaltyEligible": target_user.loyalty_eligible,
        })


