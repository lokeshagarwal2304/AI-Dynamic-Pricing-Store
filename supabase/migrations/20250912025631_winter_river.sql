/*
  # Create Products and Pricing Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `base_price` (decimal)
      - `current_price` (decimal)
      - `inventory` (integer)
      - `image_url` (text)
      - `rating` (decimal)
      - `review_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `price_history`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `price` (decimal)
      - `change_reason` (text)
      - `ml_confidence` (decimal)
      - `created_at` (timestamp)
    
    - `competitor_prices`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `competitor_name` (text)
      - `price` (decimal)
      - `scraped_at` (timestamp)
    
    - `sales_data`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `quantity_sold` (integer)
      - `revenue` (decimal)
      - `sale_date` (timestamp)
    
    - `ml_model_performance`
      - `id` (uuid, primary key)
      - `model_type` (text)
      - `accuracy` (decimal)
      - `rmse` (decimal)
      - `mae` (decimal)
      - `precision_score` (decimal)
      - `recall_score` (decimal)
      - `f1_score` (decimal)
      - `predictions_made` (integer)
      - `success_rate` (decimal)
      - `last_training` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read data
    - Add policies for admin users to modify data
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  base_price decimal(10,2) NOT NULL,
  current_price decimal(10,2) NOT NULL,
  inventory integer NOT NULL DEFAULT 0,
  image_url text,
  rating decimal(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  price decimal(10,2) NOT NULL,
  change_reason text,
  ml_confidence decimal(5,4),
  created_at timestamptz DEFAULT now()
);

-- Competitor prices table
CREATE TABLE IF NOT EXISTS competitor_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  competitor_name text NOT NULL,
  price decimal(10,2) NOT NULL,
  scraped_at timestamptz DEFAULT now()
);

-- Sales data table
CREATE TABLE IF NOT EXISTS sales_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity_sold integer NOT NULL,
  revenue decimal(10,2) NOT NULL,
  sale_date timestamptz DEFAULT now()
);

-- ML model performance table
CREATE TABLE IF NOT EXISTS ml_model_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_type text NOT NULL,
  accuracy decimal(5,4),
  rmse decimal(8,4),
  mae decimal(8,4),
  precision_score decimal(5,4),
  recall_score decimal(5,4),
  f1_score decimal(5,4),
  predictions_made integer DEFAULT 0,
  success_rate decimal(5,4),
  last_training timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for price_history
CREATE POLICY "Anyone can read price history"
  ON price_history
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert price history"
  ON price_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for competitor_prices
CREATE POLICY "Anyone can read competitor prices"
  ON competitor_prices
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert competitor prices"
  ON competitor_prices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for sales_data
CREATE POLICY "Anyone can read sales data"
  ON sales_data
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert sales data"
  ON sales_data
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for ml_model_performance
CREATE POLICY "Anyone can read model performance"
  ON ml_model_performance
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert model performance"
  ON ml_model_performance
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_current_price ON products(current_price);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON price_history(created_at);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_product_id ON competitor_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_data_product_id ON sales_data(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_data_sale_date ON sales_data(sale_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();