const API_BASE_URL = 'http://localhost:8000';

export interface ProductInput {
  product_name: string;
  category: string;
  base_price: number;
  inventory_level: number;
  competitor_avg_price: number;
  sales_last_30_days: number;
  rating: number;
  review_count: number;
  season: string;
  brand_tier: string;
  material_cost: number;
}

export interface PredictionResponse {
  predicted_price: number;
  confidence_score: number;
  price_change_percentage: number;
  recommendation: string;
}

export interface ModelMetrics {
  mse: number;
  rmse: number;
  r2_score: number;
  model_type: string;
  training_samples: number;
  feature_importance: Record<string, number>;
}

export interface Product {
  product_id: number;
  product_name: string;
  category: string;
  base_price: number;
  inventory_level: number;
  competitor_avg_price: number;
  sales_last_30_days: number;
  rating: number;
  review_count: number;
  season: string;
  brand_tier: string;
  material_cost: number;
  target_price: number;
}

class ApiService {
  private async fetchWithErrorHandling(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async predictPrice(product: ProductInput): Promise<PredictionResponse> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async getModelMetrics(): Promise<ModelMetrics> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/metrics`);
  }

  async getProducts(): Promise<{ products: Product[] }> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/products`);
  }

  async retrainModel(): Promise<{ message: string; metrics: ModelMetrics }> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/train`, {
      method: 'POST',
    });
  }

  async uploadData(file: File): Promise<{ message: string; filename: string; metrics: ModelMetrics }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload-data`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async checkServerStatus(): Promise<boolean> {
    try {
      await this.fetchWithErrorHandling(`${API_BASE_URL}/`);
      return true;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();