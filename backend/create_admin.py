#!/usr/bin/env python3
"""
Script to create an admin user for testing role-based access control.
Run this script to create an admin user in the database.
"""

from sqlalchemy.orm import Session
from database import get_db, User, create_tables
from passlib.context import CryptContext

# Initialize password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    """Create an admin user for testing"""
    
    # Create database tables if they don't exist
    create_tables()
    
    # Get database session
    db = next(get_db())
    
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "admin@example.com").first()
        if existing_admin:
            print("❌ Admin user already exists!")
            print(f"   Username: {existing_admin.username}")
            print(f"   Email: {existing_admin.email}")
            return
        
        # Create admin user
        admin_password = "admin123"  # Change this in production!
        hashed_password = pwd_context.hash(admin_password)
        
        admin_user = User(
            email="admin@example.com",
            username="admin",
            full_name="System Administrator",
            hashed_password=hashed_password,
            role="admin",
            is_active=True,
            phone="+1234567890",
            address="123 Admin Street, Admin City"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully!")
        print(f"   Username: {admin_user.username}")
        print(f"   Email: {admin_user.email}")
        print(f"   Password: {admin_password}")
        print(f"   Role: {admin_user.role}")
        print("\n🚨 IMPORTANT: Change the default password after first login!")
        
        # Also create a regular test user
        regular_password = "user123"
        regular_hashed_password = pwd_context.hash(regular_password)
        
        regular_user = User(
            email="user@example.com",
            username="testuser",
            full_name="Test User",
            hashed_password=regular_hashed_password,
            role="user",
            is_active=True,
            phone="+1234567891",
            address="456 User Avenue, User City"
        )
        
        db.add(regular_user)
        db.commit()
        db.refresh(regular_user)
        
        print("\n✅ Regular test user created successfully!")
        print(f"   Username: {regular_user.username}")
        print(f"   Email: {regular_user.email}")
        print(f"   Password: {regular_password}")
        print(f"   Role: {regular_user.role}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin user: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🔐 Creating admin user for role-based access control testing...\n")
    create_admin_user()