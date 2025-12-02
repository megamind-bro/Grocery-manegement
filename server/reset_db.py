#!/usr/bin/env python3

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the server directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.db import Base, engine, User
from server.config import config

def reset_database():
    # Drop all tables
    print("Dropping all tables...")
    Base.metadata.drop_all(engine)
    
    # Create all tables
    print("Creating all tables...")
    Base.metadata.create_all(engine)
    
    print("Database reset complete!")

if __name__ == "__main__":
    reset_database()
