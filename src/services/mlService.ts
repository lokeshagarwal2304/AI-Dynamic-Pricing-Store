import { supabase, MLModelPerformance } from '../lib/supabase';
import { ProductService } from './productService';

export class MLService {
  // Get ML model performance metrics
  static async getModelPerformance(): Promise<MLModelPerformance[]> {
    const { data, error } = await supabase
      .from('ml_model_performance')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ML performance:', error);
      throw error;
    }

    return data || [];
  }

  // Simulate ML price prediction
  static async predictOptimalPrice(productId: string): Promise<{
    predictedPrice: number;
    confidence: number;
    reasoning: string;
  }> {
    try {
      // Get product data
      const product = await ProductService.getProduct(productId);
      if (!product) throw new Error('Product not found');

      // Get recent sales data
      const salesData = await ProductService.getSalesData(productId, 7);
      
      // Get competitor prices
      const competitorPrices = await ProductService.getCompetitorPrices(productId);

      // Simulate ML prediction logic
      const avgCompetitorPrice = competitorPrices.length > 0 
        ? competitorPrices.reduce((sum, comp) => sum + comp.price, 0) / competitorPrices.length
        : product.current_price;

      const recentSalesVolume = salesData.reduce((sum, sale) => sum + sale.quantity_sold, 0);
      const inventoryRatio = product.inventory / 100; // Normalize inventory

      // Simple pricing algorithm simulation
      let priceFactor = 1.0;
      let reasoning = 'Base price maintained';

      // Inventory-based adjustments
      if (product.inventory < 20) {
        priceFactor += 0.1; // Increase price for low inventory
        reasoning = 'Low inventory detected - price increased';
      } else if (product.inventory > 100) {
        priceFactor -= 0.05; // Decrease price for high inventory
        reasoning = 'High inventory detected - price decreased';
      }

      // Competitor-based adjustments
      if (product.current_price > avgCompetitorPrice * 1.1) {
        priceFactor -= 0.08; // Decrease if significantly higher than competitors
        reasoning = 'Competitor analysis - price decreased for competitiveness';
      } else if (product.current_price < avgCompetitorPrice * 0.9) {
        priceFactor += 0.05; // Increase if significantly lower
        reasoning = 'Market positioning - price increased';
      }

      // Sales volume adjustments
      if (recentSalesVolume > 50) {
        priceFactor += 0.03; // Increase for high demand
        reasoning = 'High demand detected - price optimized upward';
      } else if (recentSalesVolume < 10) {
        priceFactor -= 0.07; // Decrease for low demand
        reasoning = 'Low demand detected - price reduced to stimulate sales';
      }

      const predictedPrice = Math.max(
        product.base_price * 0.7, // Minimum 30% discount
        Math.min(
          product.base_price * 1.5, // Maximum 50% markup
          product.current_price * priceFactor
        )
      );

      const confidence = 0.75 + Math.random() * 0.2; // 75-95% confidence

      return {
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        confidence,
        reasoning
      };
    } catch (error) {
      console.error('Error predicting price:', error);
      throw error;
    }
  }

  // Apply ML-driven price updates
  static async applyPriceUpdates(): Promise<void> {
    try {
      const products = await ProductService.getProducts();
      
      for (const product of products) {
        // Only update prices occasionally (simulate real-world behavior)
        if (Math.random() < 0.1) { // 10% chance per product
          const prediction = await this.predictOptimalPrice(product.id);
          
          // Only update if price change is significant (>2%)
          const priceChangePercent = Math.abs(prediction.predictedPrice - product.current_price) / product.current_price;
          
          if (priceChangePercent > 0.02) {
            await ProductService.updateProductPrice(
              product.id,
              prediction.predictedPrice,
              prediction.reasoning,
              prediction.confidence
            );
          }
        }
      }
    } catch (error) {
      console.error('Error applying price updates:', error);
      throw error;
    }
  }

  // Update ML model performance metrics
  static async updateModelPerformance(
    modelType: string,
    metrics: Partial<MLModelPerformance>
  ): Promise<void> {
    const { error } = await supabase
      .from('ml_model_performance')
      .insert({
        model_type: modelType,
        ...metrics,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating model performance:', error);
      throw error;
    }
  }

  // Start real-time price optimization
  static startPriceOptimization(): NodeJS.Timeout {
    // Run price updates every 30 seconds
    return setInterval(async () => {
      try {
        await this.applyPriceUpdates();
      } catch (error) {
        console.error('Error in price optimization cycle:', error);
      }
    }, 30000);
  }
}