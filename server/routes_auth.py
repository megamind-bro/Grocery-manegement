from __future__ import annotations

from typing import Optional

from flask import Blueprint, jsonify, request, session
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from db import SessionLocal, User

bp_auth = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp_auth.post("/login")
def login():
    data = request.get_json(force=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    with SessionLocal() as db:
        user: Optional[User] = db.query(User).filter(User.username == username).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"message": "Invalid credentials"}), 401
        # #clear and regenrate sesson
        # session.clear()
        # session.regenerate()

        session["user_id"] = user.id
        session["username"] = user.username
        session["is_admin"] = bool(user.is_admin)
        return jsonify({
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "isAdmin": bool(user.is_admin),
        })


@bp_auth.post("/register")
def register():
    data = request.get_json(force=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    email = (data.get("email") or "").strip() or None
    name = (data.get("name") or "").strip() or username
    
    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400
    
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters"}), 400
    
    with SessionLocal() as db:
        # Check if username already exists
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            return jsonify({"message": "Username already exists"}), 400
        
        # Create new user (normal user, not admin)
        user = User(
            username=username,
            email=email,
            name=name,
            password_hash=generate_password_hash(password),
            is_admin=False,
        )
        db.add(user)
        try:
            db.commit()
            db.refresh(user)
        except IntegrityError as e:
            db.rollback()
            # Handle unique constraint violation
            if "username" in str(e).lower() or "UNIQUE" in str(e):
                return jsonify({"message": "Username already exists"}), 400
            return jsonify({"message": "Failed to create account. Please try again."}), 500
        
        # Auto-login after registration
        session["user_id"] = user.id
        session["username"] = user.username
        session["is_admin"] = False
        
        return jsonify({
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "isAdmin": False,
        }), 201


@bp_auth.post("/logout")
def logout():
    session.clear()
    return jsonify({"message": "logout successful"})


@bp_auth.get("/me")
def me():
    uid = session.get("user_id")
    if not uid:
        return jsonify(None)
    with SessionLocal() as db:
        user = db.query(User).get(uid)
        if not user:
            return jsonify(None)
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.name,
            "isAdmin": bool(user.is_admin),
        })


