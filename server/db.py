from __future__ import annotations

import os
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from config import config

engine = create_engine(config.database_url, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    loyalty_eligible: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    total_spent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    icon: Mapped[str] = mapped_column(String(255), nullable=False)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    image: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(255), nullable=False)
    size: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    delivery_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    discount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    in_stock: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(64), nullable=False)
    customer_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    delivery_address: Mapped[str] = mapped_column(Text, nullable=False)
    items: Mapped[str] = mapped_column(Text, nullable=False)  # JSON string
    subtotal: Mapped[float] = mapped_column(Float, nullable=False)
    delivery_fee: Mapped[float] = mapped_column(Float, nullable=False)
    discount: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total: Mapped[float] = mapped_column(Float, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(64), nullable=False)
    payment_status: Mapped[str] = mapped_column(String(64), nullable=False, default="pending")
    order_status: Mapped[str] = mapped_column(String(64), nullable=False, default="processing")
    mpesa_transaction_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DeliveryAddress(Base):
    __tablename__ = "delivery_addresses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str] = mapped_column(String(64), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    method: Mapped[str] = mapped_column(String(64), nullable=False)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Cart(Base):
    __tablename__ = "carts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    items: Mapped[str] = mapped_column(Text, default="[]", nullable=False)  # JSON string
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False, default="info")
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
