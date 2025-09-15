#!/usr/bin/env python3
"""
Script to initialize an admin user in the database.
Run this script to create the initial admin user.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import SessionLocal, User, create_tables
from passlib.context import CryptContext

# Initialize password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    """Create the initial admin user"""
    # Ensure tables exist
    create_tables()
    
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if existing_admin:
            print("Admin user already exists!")
            return
        
        # Create admin user
        hashed_password = pwd_context.hash("admin123")
        admin_user = User(
            email="admin@example.com",
            username="admin",
            full_name="Administrator",
            hashed_password=hashed_password,
            role="admin",
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully!")
        print(f"   Username: admin")
        print(f"   Password: admin123")
        print(f"   Email: admin@example.com")
        print(f"   User ID: {admin_user.id}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin user: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()