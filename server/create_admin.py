#!/usr/bin/env python3
"""
Script to create or update an admin account.
This script can be run from the command line to create admin accounts.

Usage:
    python create_admin.py
    ADMIN_USERNAME=admin ADMIN_EMAIL=admin@example.com ADMIN_NAME="Admin User" ADMIN_PASSWORD=password python create_admin.py
"""

from __future__ import annotations

import os
import sys
from getpass import getpass

from werkzeug.security import generate_password_hash

# Add parent directory to path to import db
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db import Base, SessionLocal, User, engine


def create_admin_user(username=None, email=None, name=None, password=None):
    """Create or update an admin account"""
    with SessionLocal() as db:
        # Check if admin user already exists
        admin = db.query(User).filter(User.username == username).first()
        
        if admin:
            # Update existing admin
            admin.email = email or admin.email
            admin.name = name or admin.name
            if password:
                admin.password_hash = generate_password_hash(password)
            admin.is_admin = True
            message = "updated"
        else:
            # Create new admin
            if not all([username, password, name]):
                raise ValueError("Username, password, and name are required to create a new admin user")
                
            admin = User(
                username=username,
                email=email,
                name=name,
                password_hash=generate_password_hash(password),
                is_admin=True
            )
            db.add(admin)
            message = "created"
        
        db.commit()
        print(f"Admin user '{username}' {message} successfully!")
        return admin

def main() -> None:
    """Command-line interface for creating an admin account"""
    Base.metadata.create_all(engine)
    
    print("=" * 50)
    print("Admin Account Creation")
    print("=" * 50)
    print()
    
    # Get admin credentials from environment or prompt
    username = os.getenv("ADMIN_USERNAME") or input("Admin username: ").strip()
    if not username:
        print("Error: Username is required")
        sys.exit(1)
    
    email = os.getenv("ADMIN_EMAIL") or input("Admin email (optional): ").strip() or None
    name = os.getenv("ADMIN_NAME") or input("Admin full name: ").strip() or username
    
    # Get password
    password = os.getenv("ADMIN_PASSWORD")
    if not password:
        password = getpass("Admin password: ")
        if not password:
            print("Error: Password is required")
            sys.exit(1)
        password_confirm = getpass("Confirm password: ")
        if password != password_confirm:
            print("Error: Passwords do not match")
            sys.exit(1)
    
    if len(password) < 6:
        print("Error: Password must be at least 6 characters")
        sys.exit(1)
    
    with SessionLocal() as session:
        # Check if user already exists
        existing = session.query(User).filter(User.username == username).first()
        
        if existing:
            print(f"\nUser '{username}' already exists.")
            response = input("Do you want to update this user to admin? (y/n): ").strip().lower()
            if response != "y":
                print("Cancelled.")
                sys.exit(0)
            
            # Update existing user to admin
            existing.name = name or existing.name
            existing.email = email or existing.email
            existing.password_hash = generate_password_hash(password)
            existing.is_admin = True
            session.commit()
            print(f"✓ Updated user '{username}' to admin")
            print(f"  Name: {existing.name}")
            print(f"  Email: {existing.email or 'Not set'}")
            print(f"  Is Admin: {existing.is_admin}")
        else:
            # Create new admin user
            user = User(
                username=username,
                email=email,
                name=name or "Admin",
                password_hash=generate_password_hash(password),
                is_admin=True,
            )
            session.add(user)
            session.commit()
            print(f"✓ Created admin account: {username}")
            print(f"  Name: {user.name}")
            print(f"  Email: {user.email or 'Not set'}")
            print(f"  Is Admin: {user.is_admin}")
    
    print("\n" + "=" * 50)
    print("Admin account setup complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()

