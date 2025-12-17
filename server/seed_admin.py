from __future__ import annotations

import os
from getpass import getpass

from werkzeug.security import generate_password_hash

from db import Base, SessionLocal, User, engine


def main() -> None:
    Base.metadata.create_all(engine)
    import sys
    is_interactive = sys.stdin.isatty()
    
    username = os.getenv("ADMIN_USERNAME")
    if not username and is_interactive:
        username = input("Admin username: ").strip()
    elif not username:
        print("Error: ADMIN_USERNAME environment variable is required for non-interactive mode")
        sys.exit(1)
    
    email = os.getenv("ADMIN_EMAIL")
    if not email and is_interactive:
        email = input("Admin email (optional): ").strip() or None
    elif not email:
        email = None
    
    name = os.getenv("ADMIN_NAME")
    if not name and is_interactive:
        name = input("Admin name: ").strip()
    elif not name:
        name = username or "Admin"
    
    password = os.getenv("ADMIN_PASSWORD")
    if not password and is_interactive:
        password = getpass("Admin password: ")
    elif not password:
        print("Error: ADMIN_PASSWORD environment variable is required for non-interactive mode")
        sys.exit(1)

    with SessionLocal() as session:
        existing = session.query(User).filter(User.username == username).first()
        if existing:
            existing.name = name or existing.name
            existing.email = email
            if password:
                existing.password_hash = generate_password_hash(password)
            existing.is_admin = True
            session.commit()
            print(f"Updated existing admin: {username}")
            return

        user = User(
            username=username,
            email=email,
            name=name or "Admin",
            password_hash=generate_password_hash(password),
            is_admin=True,
        )
        session.add(user)
        session.commit()
        print(f"Created admin: {username}")


if __name__ == "__main__":
    main()


