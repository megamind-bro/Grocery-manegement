from __future__ import annotations

import os
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from .config import config

engine = create_engine(config.database_url, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


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
    in_stock: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
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
