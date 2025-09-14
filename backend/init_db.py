from database import create_tables
from migrate_data import migrate_csv_to_database

def initialize_database():
    """Initialize the database with tables and data"""
    print("Creating database tables...")
    create_tables()
    print("Database tables created successfully!")
    
    print("Migrating data from CSV to database...")
    migrate_csv_to_database()
    print("Database initialization complete!")

if __name__ == "__main__":
    initialize_database()