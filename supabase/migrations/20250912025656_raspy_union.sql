/*
  # Seed Initial Data

  1. Sample Products
    - Insert clothing products with realistic data
  
  2. Sample Price History
    - Insert historical price changes
  
  3. Sample Competitor Data
    - Insert competitor pricing information
  
  4. Sample ML Performance Data
    - Insert model performance metrics
*/

-- Insert sample products
INSERT INTO products (name, description, category, base_price, current_price, inventory, image_url, rating, review_count) VALUES
('Classic Cotton T-Shirt', 'Soft, comfortable cotton tee perfect for everyday wear', 'T-Shirts', 29.99, 27.99, 150, 'https://images.pexels.com/photos/1000000/pexels-photo-1000000.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', 4.2, 128),
('Premium Denim Jeans', 'High-quality denim with perfect fit and durability', 'Jeans', 89.99, 94.99, 75, 'https://images.pexels.com/photos/1100000/pexels-photo-1100000.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', 4.5, 203),
('Elegant Summer Dress', 'Flowing summer dress ideal for warm weather occasions', 'Dresses', 79.99, 74.99, 45, 'https://images.pexels.com/photos/1200000/pexels-photo-1200000.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', 4.7, 89),
('Urban Bomber Jacket', 'Stylish bomber jacket with modern urban appeal', 'Jackets', 129.99, 139.99, 32, 'https://images.pexels.com/photos/1300000/pexels-photo-1300000.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', 4.3, 156),
('Running Sneakers', 'Lightweight athletic shoes with superior comfort', 'Shoes', 119.99, 109.99, 88, 'https://images.pexels.com/photos/1400000/pexels-photo-1400000.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', 4.6, 274),
('Leather Crossbody Bag', 'Premium leather bag with spacious compartments', 'Accessories', 149.99, 159.99, 23, 'https://images.pexels.com/photos/1500000/pexels-photo-1500000.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', 4.8, 92),
('Wool Blend Sweater', 'Cozy wool blend perfect for cooler days', 'Sweaters', 69.99, 64.99, 67, 'https://images.pexels.com/photos/1600000/pexels-photo-1600000.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', 4.1, 145),
('Casual Button-Down Shirt', 'Versatile shirt suitable for work or weekend', 'Shirts', 49.99, 52.99, 112, 'https://images.pexels.com/photos/1700000/pexels-photo-1700000.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', 4.4, 187),
('High-Waisted Leggings', 'Stretchy, comfortable leggings for active lifestyle', 'Activewear', 39.99, 34.99, 198, 'https://images.pexels.com/photos/1800000/pexels-photo-1800000.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', 4.3, 312),
('Canvas Sneakers', 'Classic canvas shoes with timeless style', 'Shoes', 59.99, 57.99, 143, 'https://images.pexels.com/photos/1900000/pexels-photo-1900000.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', 4.0, 98),
('Silk Scarf', 'Luxurious silk scarf to elevate any outfit', 'Accessories', 89.99, 94.99, 34, 'https://images.pexels.com/photos/2000000/pexels-photo-2000000.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', 4.6, 67),
('Denim Jacket', 'Classic denim jacket with vintage wash finish', 'Jackets', 99.99, 89.99, 56, 'https://images.pexels.com/photos/2100000/pexels-photo-2100000.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', 4.2, 134);

-- Insert sample price history (using product IDs from the inserted products)
DO $$
DECLARE
    product_record RECORD;
    i INTEGER;
    price_change DECIMAL;
    base_price DECIMAL;
BEGIN
    FOR product_record IN SELECT id, base_price FROM products LOOP
        base_price := product_record.base_price;
        
        -- Insert 10 historical price points for each product
        FOR i IN 1..10 LOOP
            price_change := base_price * (0.8 + (random() * 0.4)); -- Price varies ±20%
            
            INSERT INTO price_history (product_id, price, change_reason, ml_confidence, created_at)
            VALUES (
                product_record.id,
                price_change,
                CASE 
                    WHEN random() < 0.3 THEN 'Competitor price adjustment'
                    WHEN random() < 0.6 THEN 'Inventory optimization'
                    WHEN random() < 0.8 THEN 'Demand forecasting'
                    ELSE 'Market trend analysis'
                END,
                0.75 + (random() * 0.2), -- Confidence between 75-95%
                now() - (i || ' days')::interval
            );
        END LOOP;
    END LOOP;
END $$;

-- Insert sample competitor prices
DO $$
DECLARE
    product_record RECORD;
    competitors TEXT[] := ARRAY['Amazon Fashion', 'Zara Online', 'H&M Store', 'ASOS', 'Target Style'];
    competitor TEXT;
    competitor_price DECIMAL;
BEGIN
    FOR product_record IN SELECT id, current_price FROM products LOOP
        FOREACH competitor IN ARRAY competitors LOOP
            -- Generate competitor prices within ±15% of current price
            competitor_price := product_record.current_price * (0.85 + (random() * 0.3));
            
            INSERT INTO competitor_prices (product_id, competitor_name, price, scraped_at)
            VALUES (
                product_record.id,
                competitor,
                competitor_price,
                now() - (random() * 24 || ' hours')::interval
            );
        END LOOP;
    END LOOP;
END $$;

-- Insert sample sales data
DO $$
DECLARE
    product_record RECORD;
    i INTEGER;
    daily_sales INTEGER;
    daily_revenue DECIMAL;
BEGIN
    FOR product_record IN SELECT id, current_price FROM products LOOP
        -- Insert 30 days of sales data for each product
        FOR i IN 1..30 LOOP
            daily_sales := floor(random() * 20) + 1; -- 1-20 sales per day
            daily_revenue := daily_sales * product_record.current_price;
            
            INSERT INTO sales_data (product_id, quantity_sold, revenue, sale_date)
            VALUES (
                product_record.id,
                daily_sales,
                daily_revenue,
                now() - (i || ' days')::interval
            );
        END LOOP;
    END LOOP;
END $$;

-- Insert sample ML model performance data
INSERT INTO ml_model_performance (
    model_type, accuracy, rmse, mae, precision_score, recall_score, f1_score, 
    predictions_made, success_rate, last_training
) VALUES
('Regression Model', 0.8745, 2.34, 1.89, 0.8234, 0.7891, 0.8056, 2847, 0.8923, now() - '2 days'::interval),
('Classification Model', 0.8912, 1.98, 1.45, 0.8567, 0.8234, 0.8398, 1923, 0.9012, now() - '1 day'::interval),
('Time Series Model', 0.8634, 2.67, 2.12, 0.8123, 0.7945, 0.8033, 3156, 0.8756, now() - '3 days'::interval);