#!/usr/bin/env python3
"""
Admin Credentials Update Script
This script will update the admin username and password in the system.
"""

import sys
import os
import getpass
from pathlib import Path

def update_main_py_credentials(new_username, new_password):
    """Update credentials in main.py file"""
    main_py_path = Path("backend/main.py")
    
    if not main_py_path.exists():
        print("❌ Error: backend/main.py not found!")
        return False
    
    try:
        # Read the current file
        with open(main_py_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Find and replace the fake_users_db section
        lines = content.split('\n')
        new_lines = []
        in_fake_users_section = False
        brace_count = 0
        
        for line in lines:
            if 'fake_users_db = {' in line:
                in_fake_users_section = True
                brace_count = 1
                # Replace with new admin credentials
                new_lines.append('fake_users_db = {')
                new_lines.append('    "' + new_username + '": {')
                new_lines.append('        "id": 1,')
                new_lines.append('        "username": "' + new_username + '",')
                new_lines.append('        "email": "admin@example.com",')
                new_lines.append('        "full_name": "Administrator",')
                new_lines.append('        "password": "' + new_password + '",  # Updated password')
                new_lines.append('        "role": "admin",')
                new_lines.append('        "is_active": True')
                new_lines.append('    }')
                new_lines.append('}')
                continue
            
            if in_fake_users_section:
                if '{' in line:
                    brace_count += line.count('{')
                if '}' in line:
                    brace_count -= line.count('}')
                    if brace_count <= 0:
                        in_fake_users_section = False
                continue
            
            new_lines.append(line)
        
        # Write the updated content back
        with open(main_py_path, 'w', encoding='utf-8') as file:
            file.write('\n'.join(new_lines))
        
        print("✅ Successfully updated main.py with new credentials")
        return True
        
    except Exception as e:
        print(f"❌ Error updating main.py: {str(e)}")
        return False

def update_test_file_credentials(new_username, new_password):
    """Update credentials in test_upload.py file"""
    test_py_path = Path("test_upload.py")
    
    if not test_py_path.exists():
        print("⚠️  Warning: test_upload.py not found, skipping...")
        return True
    
    try:
        # Read the current file
        with open(test_py_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace the login credentials in the test file
        old_login_line = "json={'username': 'admin', 'password': 'admin123'}"
        new_login_line = f"json={{'username': '{new_username}', 'password': '{new_password}'}}"
        
        updated_content = content.replace(old_login_line, new_login_line)
        
        # Also update any other hardcoded references
        updated_content = updated_content.replace("'username': 'admin'", f"'username': '{new_username}'")
        updated_content = updated_content.replace("'password': 'admin123'", f"'password': '{new_password}'")
        
        # Write the updated content back
        with open(test_py_path, 'w', encoding='utf-8') as file:
            file.write(updated_content)
        
        print("✅ Successfully updated test_upload.py with new credentials")
        return True
        
    except Exception as e:
        print(f"❌ Error updating test_upload.py: {str(e)}")
        return False

def main():
    print("🔐 Admin Credentials Update Tool")
    print("=" * 40)
    
    # Get new credentials from user
    print("\nEnter new admin credentials:")
    new_username = input("New admin username: ").strip()
    
    if not new_username:
        print("❌ Username cannot be empty!")
        sys.exit(1)
    
    # Get password securely
    try:
        new_password = getpass.getpass("New admin password: ")
        confirm_password = getpass.getpass("Confirm password: ")
    except KeyboardInterrupt:
        print("\n❌ Operation cancelled by user")
        sys.exit(1)
    
    if not new_password:
        print("❌ Password cannot be empty!")
        sys.exit(1)
    
    if new_password != confirm_password:
        print("❌ Passwords do not match!")
        sys.exit(1)
    
    # Confirm the update
    print(f"\n📝 Summary:")
    print(f"   Username: {new_username}")
    print(f"   Password: {'*' * len(new_password)}")
    
    confirm = input("\nProceed with credential update? (y/N): ").strip().lower()
    if confirm != 'y':
        print("❌ Operation cancelled")
        sys.exit(1)
    
    print("\n🔄 Updating credentials...")
    
    # Update main.py
    success1 = update_main_py_credentials(new_username, new_password)
    
    # Update test file
    success2 = update_test_file_credentials(new_username, new_password)
    
    if success1 and success2:
        print("\n" + "=" * 40)
        print("🎉 Credentials updated successfully!")
        print("\n📋 Next steps:")
        print("1. Restart your backend server")
        print("2. Use the new credentials to log in:")
        print(f"   Username: {new_username}")
        print(f"   Password: {new_password}")
        print("=" * 40)
        
        # Save credentials to a file for reference
        with open("admin_credentials.txt", "w") as f:
            f.write(f"Admin Username: {new_username}\n")
            f.write(f"Admin Password: {new_password}\n")
            f.write(f"Updated on: {os.getcwd()}\n")
            f.write(f"Date: {Path(__file__).stat().st_mtime}\n")
        print("📄 Credentials saved to admin_credentials.txt")
        
    else:
        print("\n❌ Some updates failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()