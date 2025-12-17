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
                "description": p.description,
                "price": p.price,
                "image": p.image,
                "category": p.category,
                "size": p.size,
                "stockQuantity": p.stock_quantity,
                "inStock": bool(p.in_stock) and p.stock_quantity > 0,
                "createdAt": p.created_at.isoformat(),
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
            "description": product.description,
            "price": product.price,
            "image": product.image,
            "category": product.category,
            "size": product.size,
            "stockQuantity": product.stock_quantity,
            "inStock": bool(product.in_stock) and product.stock_quantity > 0,
            "createdAt": product.created_at.isoformat(),
        })

