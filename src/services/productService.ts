import { supabase, Product, PriceHistory, CompetitorPrice, SalesData } from '../lib/supabase';

export class ProductService {
  // Get all products with optional filtering
  static async getProducts(category?: string, searchTerm?: string): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .order('name');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return data || [];
  }

  // Get product by ID
  static async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    return data;
  }

  // Get price history for a product
  static async getPriceHistory(productId: string, limit: number = 50): Promise<PriceHistory[]> {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching price history:', error);
      throw error;
    }

    return data || [];
  }

  // Get competitor prices for a product
  static async getCompetitorPrices(productId: string): Promise<CompetitorPrice[]> {
    const { data, error } = await supabase
      .from('competitor_prices')
      .select('*')
      .eq('product_id', productId)
      .order('scraped_at', { ascending: false });

    if (error) {
      console.error('Error fetching competitor prices:', error);
      throw error;
    }

    return data || [];
  }

  // Get sales data for a product
  static async getSalesData(productId: string, days: number = 30): Promise<SalesData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('sales_data')
      .select('*')
      .eq('product_id', productId)
      .gte('sale_date', startDate.toISOString())
      .order('sale_date', { ascending: false });

    if (error) {
      console.error('Error fetching sales data:', error);
      throw error;
    }

    return data || [];
  }

  // Update product price
  static async updateProductPrice(
    productId: string, 
    newPrice: number, 
    reason: string, 
    confidence: number
  ): Promise<void> {
    // Start a transaction to update both product and price history
    const { error: productError } = await supabase
      .from('products')
      .update({ 
        current_price: newPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (productError) {
      console.error('Error updating product price:', productError);
      throw productError;
    }

    // Add to price history
    const { error: historyError } = await supabase
      .from('price_history')
      .insert({
        product_id: productId,
        price: newPrice,
        change_reason: reason,
        ml_confidence: confidence
      });

    if (historyError) {
      console.error('Error adding price history:', historyError);
      throw historyError;
    }
  }

  // Get dashboard metrics
  static async getDashboardMetrics() {
    // Get total revenue from sales data
    const { data: salesData, error: salesError } = await supabase
      .from('sales_data')
      .select('revenue, sale_date')
      .gte('sale_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (salesError) {
      console.error('Error fetching sales data:', salesError);
      throw salesError;
    }

    const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.revenue, 0) || 0;

    // Get product count
    const { count: productCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching product count:', countError);
      throw countError;
    }

    // Get low stock products
    const { data: lowStockProducts, error: stockError } = await supabase
      .from('products')
      .select('*')
      .lt('inventory', 20);

    if (stockError) {
      console.error('Error fetching low stock products:', stockError);
      throw stockError;
    }

    // Get recent price adjustments count
    const { count: priceAdjustments, error: adjustmentError } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (adjustmentError) {
      console.error('Error fetching price adjustments:', adjustmentError);
      throw adjustmentError;
    }

    return {
      totalRevenue,
      productCount: productCount || 0,
      lowStockCount: lowStockProducts?.length || 0,
      priceAdjustments: priceAdjustments || 0
    };
  }

  // Subscribe to real-time product updates
  static subscribeToProductUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('products')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'products' }, 
        callback
      )
      .subscribe();
  }

  // Subscribe to real-time price history updates
  static subscribeToPriceUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('price_history')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'price_history' }, 
        callback
      )
      .subscribe();
  }
}