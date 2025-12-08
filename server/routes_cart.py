from __future__ import annotations

import json
from typing import Any, Dict, List

from flask import Blueprint, jsonify, request, session
from sqlalchemy.orm import Session

from db import Cart, Product, SessionLocal

bp_cart = Blueprint("cart", __name__, url_prefix="/api/cart")


def _get_user_cart(db: Session, user_id: int) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id, items="[]")
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


@bp_cart.get("")
def get_cart():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"items": [], "itemCount": 0, "subtotal": 0, "deliveryFee": 0, "discount": 0, "total": 0}), 200
    
    with SessionLocal() as db:
        cart = _get_user_cart(db, user_id)
        items = json.loads(cart.items) if cart.items else []
        
        # Validate items against current product stock and sync with latest product data
        valid_items = []
        for item in items:
            product = db.query(Product).get(item.get("id"))
            if product and product.stock_quantity > 0 and product.in_stock:
                # Limit quantity to available stock
                quantity = min(item.get("quantity", 1), product.stock_quantity)
                if quantity > 0:
                    valid_items.append({
                        "id": product.id,
                        "name": product.name,
                        "price": float(product.price) if product.price is not None else 0,
                        "image": product.image,
                        "quantity": quantity,
                        "availableStock": product.stock_quantity,
                        "inStock": product.in_stock,
                        "deliveryPrice": float(product.delivery_price) if product.delivery_price is not None else 0,
                        "discount": float(product.discount) if product.discount is not None else 0,
                    })
        
        # Update cart if items were modified
        if len(valid_items) != len(items):
            cart.items = json.dumps(valid_items)
            db.commit()
        
        # Calculate totals
        item_count = sum(item.get("quantity", 0) for item in valid_items)
        subtotal = sum(item.get("price", 0) * item.get("quantity", 0) for item in valid_items)
        delivery_fee = 50.0 if subtotal > 0 else 0.0
        # Per-product discount calculation
        discount = sum(item.get("discount", 0) * item.get("quantity", 0) for item in valid_items)
        total = subtotal + delivery_fee - discount
        
        return jsonify({
            "items": valid_items,
            "itemCount": item_count,
            "subtotal": subtotal,
            "deliveryFee": delivery_fee,
            "discount": discount,
            "total": total,
        })


@bp_cart.post("")
def add_to_cart():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    data = request.get_json(force=True) or {}
    product_id = data.get("productId") or data.get("id")
    quantity = int(data.get("quantity", 1))
    
    if not product_id:
        return jsonify({"message": "Product ID required"}), 400
    
    with SessionLocal() as db:
        product = db.query(Product).get(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404
        
        if not product.in_stock or product.stock_quantity <= 0:
            return jsonify({"message": "Product is out of stock"}), 400
        
        if quantity > product.stock_quantity:
            return jsonify({"message": f"Only {product.stock_quantity} items available"}), 400
        
        cart = _get_user_cart(db, user_id)
        items = json.loads(cart.items) if cart.items else []
        
        # Find existing item
        existing_idx = next((i for i, item in enumerate(items) if item.get("id") == product_id), None)
        
        if existing_idx is not None:
            new_quantity = items[existing_idx].get("quantity", 0) + quantity
            if new_quantity > product.stock_quantity:
                return jsonify({"message": f"Only {product.stock_quantity} items available"}), 400
            items[existing_idx]["quantity"] = new_quantity
        else:
            items.append({
                "id": product.id,
                "name": product.name,
                "price": float(product.price) if product.price is not None else 0,
                "image": product.image,
                "quantity": quantity,
                "availableStock": product.stock_quantity,
                "inStock": product.in_stock,
                "deliveryPrice": float(product.delivery_price) if product.delivery_price is not None else 0,
                "discount": float(product.discount) if product.discount is not None else 0,
            })
        
        cart.items = json.dumps(items)
        db.commit()
        
        return jsonify({"message": "Item added to cart", "items": items})


@bp_cart.put("")
def update_cart():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    data = request.get_json(force=True) or {}
    items = data.get("items", [])
    
    with SessionLocal() as db:
        cart = _get_user_cart(db, user_id)
        
        # Validate all items against stock
        valid_items = []
        for item in items:
            product_id = item.get("id")
            quantity = int(item.get("quantity", 0))
            
            if quantity <= 0:
                continue
            
            product = db.query(Product).get(product_id)
            if not product or not product.in_stock or product.stock_quantity <= 0:
                continue
            
            quantity = min(quantity, product.stock_quantity)
            valid_items.append({
                "id": product.id,
                "name": product.name,
                "price": float(product.price) if product.price is not None else 0,
                "image": product.image,
                "quantity": quantity,
                "availableStock": product.stock_quantity,
                "inStock": product.in_stock,
                "deliveryPrice": float(product.delivery_price) if product.delivery_price is not None else 0,
                "discount": float(product.discount) if product.discount is not None else 0,
            })
        
        cart.items = json.dumps(valid_items)
        db.commit()
        
        return jsonify({"message": "Cart updated", "items": valid_items})


@bp_cart.delete("/<int:product_id>")
def remove_from_cart(product_id: int):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    with SessionLocal() as db:
        cart = _get_user_cart(db, user_id)
        items = json.loads(cart.items) if cart.items else []
        items = [item for item in items if item.get("id") != product_id]
        cart.items = json.dumps(items)
        db.commit()
        
        return jsonify({"message": "Item removed from cart", "items": items})


@bp_cart.delete("")
def clear_cart():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    with SessionLocal() as db:
        cart = _get_user_cart(db, user_id)
        cart.items = "[]"
        db.commit()
        
        return jsonify({"message": "Cart cleared"})



