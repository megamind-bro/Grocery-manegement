#!/usr/bin/env python3
"""
Migration script to fix the users table schema.
This script will:
1. Check if users table exists
2. If it exists but is missing columns, add them
3. If it doesn't exist, create it
"""

from __future__ import annotations

import sqlite3
from pathlib import Path
from config import config

def get_db_path() -> str:
    """Get the database file path from the database URL"""
    db_url = config.database_url
    if db_url.startswith("sqlite:///"):
        # Remove sqlite:/// prefix
        path = db_url.replace("sqlite:///", "")
        # Handle relative paths
        if not Path(path).is_absolute():
            # Assume it's relative to the server directory
            server_dir = Path(__file__).parent
            path = str(server_dir / path)
        return path
    raise ValueError(f"Unsupported database URL: {db_url}")

def migrate_users_table():
    """Migrate the users table to have the correct schema"""
    db_path = get_db_path()
    print(f"Connecting to database: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if users table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='users'
        """)
        table_exists = cursor.fetchone() is not None
        
        if not table_exists:
            print("Users table does not exist. Creating it...")
            cursor.execute("""
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(64) NOT NULL UNIQUE,
                    email VARCHAR(255),
                    name VARCHAR(255) NOT NULL,
                    password_hash TEXT NOT NULL,
                    is_admin BOOLEAN NOT NULL DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
            print("Users table created successfully!")
            return
        
        # Check existing columns
        cursor.execute("PRAGMA table_info(users)")
        columns = {row[1]: row[2] for row in cursor.fetchall()}
        print(f"Existing columns: {list(columns.keys())}")
        
        # Add missing columns
        if "username" not in columns:
            print("Adding username column...")
            cursor.execute("ALTER TABLE users ADD COLUMN username VARCHAR(64)")
            conn.commit()
            # Try to set a default username for existing rows
            cursor.execute("SELECT id FROM users WHERE username IS NULL")
            null_users = cursor.fetchall()
            if null_users:
                print(f"Found {len(null_users)} users with NULL username. Setting default usernames...")
                for (user_id,) in null_users:
                    cursor.execute("UPDATE users SET username = ? WHERE id = ?", (f"user{user_id}", user_id))
                conn.commit()
            print("Username column added!")
        
        if "email" not in columns:
            print("Adding email column...")
            cursor.execute("ALTER TABLE users ADD COLUMN email VARCHAR(255)")
            conn.commit()
            print("Email column added!")
        
        if "name" not in columns:
            print("Adding name column...")
            cursor.execute("ALTER TABLE users ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'User'")
            conn.commit()
            print("Name column added!")
        
        if "password_hash" not in columns:
            print("Adding password_hash column...")
            cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''")
            conn.commit()
            print("Password_hash column added!")
        
        if "is_admin" not in columns:
            print("Adding is_admin column...")
            cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0")
            conn.commit()
            print("Is_admin column added!")
        
        if "created_at" not in columns:
            print("Adding created_at column...")
            cursor.execute("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
            conn.commit()
            print("Created_at column added!")
        
        # Make username unique if it's not already
        try:
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)")
            conn.commit()
            print("Username unique constraint ensured!")
        except Exception as e:
            print(f"Note: Could not create unique index (may already exist): {e}")
        
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_users_table()

