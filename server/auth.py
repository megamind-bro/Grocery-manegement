from __future__ import annotations

import os
from functools import wraps
from typing import Callable, Optional

from flask import Request, jsonify, request
from .config import config

try:
    import firebase_admin
    from firebase_admin import auth as fb_auth
    from firebase_admin import credentials
except ImportError:  # optional dependency during local dev
    firebase_admin = None
    fb_auth = None
    credentials = None


_firebase_initialized = False


def _init_firebase() -> None:
    global _firebase_initialized
    if _firebase_initialized:
        return
    if firebase_admin is None:
        return
    cred_path = config.firebase_credentials_json
    if cred_path and not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True


def verify_firebase_token(id_token: str) -> Optional[dict]:
    _init_firebase()
    if fb_auth is None:
        return None
    try:
        decoded = fb_auth.verify_id_token(id_token)
        return decoded
    except Exception:
        return None


def require_firebase_auth(func: Callable):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"message": "Unauthorized"}), 401
        token = auth_header.split(" ", 1)[1]
        decoded = verify_firebase_token(token)
        if not decoded:
            return jsonify({"message": "Unauthorized"}), 401
        request.firebase_user = decoded  # type: ignore[attr-defined]
        return func(*args, **kwargs)
    return wrapper
