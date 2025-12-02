from __future__ import annotations

from flask import Blueprint, jsonify
from sqlalchemy import select
from sqlalchemy.orm import Session

from db import Category, SessionLocal

bp_categories = Blueprint("categories", __name__, url_prefix="/api")


@bp_categories.get("/categories")
def list_categories():
    with SessionLocal() as session:  # type: Session
        rows = list(session.scalars(select(Category)))
        return jsonify([{"id": c.id, "name": c.name, "icon": c.icon} for c in rows])

