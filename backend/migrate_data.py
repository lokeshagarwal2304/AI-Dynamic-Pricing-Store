import pandas as pd
from database import SessionLocal, Product
from sqlalchemy.orm import Session

def migrate_csv_to_database():
    """Migrate existing CSV data to the database"""
    db = SessionLocal()
    
    try:
        # Check if products already exist
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print(f"Database already contains {existing_products} products. Skipping migration.")
            return
        
        # Read CSV data
        df = pd.read_csv('dataset.csv')
        print(f"Found {len(df)} products in CSV file")
        
        # Migrate each product
        for _, row in df.iterrows():
            product = Product(
                product_id=row['product_id'],
                product_name=row['product_name'],
                category=row['category'],
                base_price=row['base_price'],
                inventory_level=row['inventory_level'],
                competitor_avg_price=row['competitor_avg_price'],
                sales_last_30_days=row['sales_last_30_days'],
                rating=row['rating'],
                review_count=row['review_count'],
                season=row['season'],
                brand_tier=row['brand_tier'],
                material_cost=row['material_cost'],
                target_price=row['target_price'],
                description=f"High-quality {row['product_name']} in {row['category']} category",
                image_url=None,  # Will add later
                is_active=True
            )
            db.add(product)
        
        db.commit()
        print(f"Successfully migrated {len(df)} products to database!")
        
    except Exception as e:
        print(f"Migration failed: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_csv_to_database()