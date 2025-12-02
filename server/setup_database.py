#!/usr/bin/env python3

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the server directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.db import Base, engine, User, Product, Order, Category
from server.config import config
from server.create_admin import create_admin_user

def reset_database():
    # Drop all tables
    print("Dropping all tables...")
    Base.metadata.drop_all(engine)
    
    # Create all tables
    print("Creating all tables...")
    Base.metadata.create_all(engine)
    
    print("Database reset complete!")

def setup_admin():
    # Create admin user
    print("\nSetting up admin user...")
    create_admin_user()

def main():
    reset_database()
    setup_admin()
    
    print("\nDatabase setup complete!")
    print("You can now start the server with: python3 app.py")

if __name__ == "__main__":
    main()
