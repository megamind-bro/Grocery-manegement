from __future__ import annotations

import sqlite3
from pathlib import Path

from config import config
from db import Base, engine, DeliveryAddress, PaymentMethod, Cart, Notification

# Get database path
db_path = config.database_url.replace("sqlite:///", "")
if not db_path.startswith("/"):
    db_path = str(Path(__file__).parent / db_path)


def migrate():
    """Add missing columns and tables to existing database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if user_id column exists in orders table
        cursor.execute("PRAGMA table_info(orders)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if "user_id" not in columns:
            print("Adding user_id column to orders table...")
            cursor.execute("ALTER TABLE orders ADD COLUMN user_id INTEGER")
            conn.commit()
            print("✓ Added user_id column")
        else:
            print("✓ user_id column already exists")
        
        # Create new tables if they don't exist
        print("Creating delivery_addresses table...")
        Base.metadata.create_all(engine, tables=[DeliveryAddress.__table__])
        print("✓ delivery_addresses table ready")
        
        print("Creating payment_methods table...")
        Base.metadata.create_all(engine, tables=[PaymentMethod.__table__])
        print("✓ payment_methods table ready")
        
        # Add stock_quantity, delivery_price, discount to products
        cursor.execute("PRAGMA table_info(products)")
        product_columns = [col[1] for col in cursor.fetchall()]
        
        if "stock_quantity" not in product_columns:
            print("Adding stock_quantity column to products table...")
            cursor.execute("ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT 0")
            conn.commit()
            print("✓ Added stock_quantity column")
        else:
            print("✓ stock_quantity column already exists")
        
        if "delivery_price" not in product_columns:
            print("Adding delivery_price column to products table...")
            cursor.execute("ALTER TABLE products ADD COLUMN delivery_price REAL")
            conn.commit()
            print("✓ Added delivery_price column")
        else:
            print("✓ delivery_price column already exists")
        
        if "discount" not in product_columns:
            print("Adding discount column to products table...")
            cursor.execute("ALTER TABLE products ADD COLUMN discount REAL")
            conn.commit()
            print("✓ Added discount column")
        else:
            print("✓ discount column already exists")
        
        # Add loyalty fields to users
        cursor.execute("PRAGMA table_info(users)")
        user_columns = [col[1] for col in cursor.fetchall()]
        
        if "loyalty_points" not in user_columns:
            print("Adding loyalty_points column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN loyalty_points INTEGER DEFAULT 0")
            conn.commit()
            print("✓ Added loyalty_points column")
        else:
            print("✓ loyalty_points column already exists")
        
        if "loyalty_eligible" not in user_columns:
            print("Adding loyalty_eligible column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN loyalty_eligible BOOLEAN DEFAULT 0")
            conn.commit()
            print("✓ Added loyalty_eligible column")
        else:
            print("✓ loyalty_eligible column already exists")
        
        if "total_spent" not in user_columns:
            print("Adding total_spent column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN total_spent REAL DEFAULT 0.0")
            conn.commit()
            print("✓ Added total_spent column")
        else:
            print("✓ total_spent column already exists")
        
        # Create new tables
        print("Creating carts table...")
        Base.metadata.create_all(engine, tables=[Cart.__table__])
        print("✓ carts table ready")
        
        print("Creating notifications table...")
        Base.metadata.create_all(engine, tables=[Notification.__table__])
        print("✓ notifications table ready")
        
        print("\n✓ Database migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()

