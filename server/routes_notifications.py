from __future__ import annotations

from typing import Optional

from flask import Blueprint, jsonify, request, session

from db import Notification, SessionLocal, User

bp_notifications = Blueprint("notifications", __name__, url_prefix="/api/notifications")


def _require_admin() -> Optional[User]:
    if not session.get("is_admin"):
        return None
    user_id = session.get("user_id")
    if not user_id:
        return None
    with SessionLocal() as db:
        user = db.query(User).get(user_id)
        if user and user.is_admin:
            return user
    return None


@bp_notifications.get("")
def get_notifications():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify([]), 200

    with SessionLocal() as db:
        notifications = db.query(Notification).filter(
            (Notification.user_id == user_id) | (Notification.user_id.is_(None))
        ).order_by(Notification.created_at.desc()).limit(50).all()

        return jsonify([{
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "read": bool(n.read),
            "createdAt": n.created_at.isoformat(),
        } for n in notifications])


@bp_notifications.post("/read/<int:notification_id>")
def mark_read(notification_id: int):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    with SessionLocal() as db:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            (Notification.user_id == user_id) | (Notification.user_id.is_(None))
        ).first()
        if not notification:
            return jsonify({"message": "Notification not found"}), 404
        notification.read = True
        db.commit()
        return jsonify({"message": "Notification marked as read"})


@bp_notifications.post("/read-all")
def mark_all_read():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    with SessionLocal() as db:
        db.query(Notification).filter(
            (Notification.user_id == user_id) | (Notification.user_id.is_(None)),
            Notification.read == False
        ).update({"read": True})
        db.commit()
        return jsonify({"message": "All notifications marked as read"})


@bp_notifications.post("/admin/send")
def admin_send_notification():
    admin = _require_admin()
    if not admin:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json(force=True) or {}
    title = (data.get("title") or "").strip()
    message = (data.get("message") or "").strip()
    notification_type = data.get("type", "info")
    user_id = data.get("userId")

    if not title or not message:
        return jsonify({"message": "Title and message are required"}), 400

    with SessionLocal() as db:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return jsonify({
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "type": notification.type,
            "userId": notification.user_id,
            "createdAt": notification.created_at.isoformat(),
        })


