import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  current_price: number;
  inventory: number;
  image_url: string;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  change_reason: string;
  ml_confidence: number;
  created_at: string;
}

export interface CompetitorPrice {
  id: string;
  product_id: string;
  competitor_name: string;
  price: number;
  scraped_at: string;
}

export interface SalesData {
  id: string;
  product_id: string;
  quantity_sold: number;
  revenue: number;
  sale_date: string;
}

export interface MLModelPerformance {
  id: string;
  model_type: string;
  accuracy: number;
  rmse: number;
  mae: number;
  precision_score: number;
  recall_score: number;
  f1_score: number;
  predictions_made: number;
  success_rate: number;
  last_training: string;
  created_at: string;
}