from __future__ import annotations

from flask import Blueprint, jsonify, request
from sqlalchemy import select
from sqlalchemy.orm import Session

from db import Product, SessionLocal

bp_products = Blueprint("products", __name__, url_prefix="/api")


@bp_products.get("/products")
def list_products():
    category = request.args.get("category")
    search = request.args.get("search")
    with SessionLocal() as session:  # type: Session
        products = list(session.scalars(select(Product)))
        if category and category != "all":
            products = [p for p in products if p.category == category]
        if search:
            s = search.lower()
            products = [
                p for p in products
                if s in p.name.lower() or (p.description or "").lower().find(s) >= 0
            ]
        return jsonify([
            {
                "id": p.id,
                "name": p.name,
                "description": p.description or "",
                "price": float(p.price) if p.price is not None else 0,
                "image": p.image or "",
                "category": p.category or "",
                "size": p.size or "",
                "stockQuantity": int(p.stock_quantity) if p.stock_quantity is not None else 0,
                "inStock": bool(p.in_stock) if p.in_stock is not None else False,
                "deliveryPrice": float(p.delivery_price) if p.delivery_price is not None else 0,
                "discount": float(p.discount) if p.discount is not None else 0,
                "createdAt": p.created_at.isoformat() if p.created_at else "",
                "updatedAt": p.updated_at.isoformat() if p.updated_at else ""
            }
            for p in products
        ])


@bp_products.get("/products/<int:pid>")
def get_product(pid: int):
    with SessionLocal() as session:  # type: Session
        product = session.get(Product, pid)
        if not product:
            return jsonify({"message": "Product not found"}), 404
        return jsonify({
            "id": product.id,
            "name": product.name,
            "description": product.description or "",
            "price": float(product.price) if product.price is not None else 0,
            "image": product.image or "",
            "category": product.category or "",
            "size": product.size or "",
            "stockQuantity": int(product.stock_quantity) if product.stock_quantity is not None else 0,
            "inStock": bool(product.in_stock) if product.in_stock is not None else False,
            "deliveryPrice": float(product.delivery_price) if product.delivery_price is not None else 0,
            "discount": float(product.discount) if product.discount is not None else 0,
            "createdAt": product.created_at.isoformat() if product.created_at else "",
            "updatedAt": product.updated_at.isoformat() if product.updated_at else ""
        })

