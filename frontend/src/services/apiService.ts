import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:8000';

// Auth interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  address?: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  profile_picture?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Product interfaces
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

export interface UploadResponse {
  message: string;
  upload_stats: {
    new_records: number;
    total_records: number;
    duplicates_removed: number;
    existing_records: number;
  };
  model_metrics?: ModelMetrics;
  retraining_status: string;
  retraining_error?: string;
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
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  predicted_price?: number;
  confidence?: number;
}

// Cart interfaces
export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  added_at: string;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  total_amount: number;
}

// Order interfaces
export interface Order {
  id: number;
  total_amount: number;
  status: string;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_time: number;
  product: Product;
}

// Filter interfaces
export interface ProductFilter {
  category?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  brand_tier?: string;
  season?: string;
  search?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = Cookies.get('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async fetchWithErrorHandling(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid - redirect to login
          Cookies.remove('auth_token');
          Cookies.remove('auth_user');
          window.location.href = '/login';
        }
        
        // Try to get detailed error message from response
        try {
          const errorData = await response.json();
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        } catch (jsonError) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ==========================================
  // AUTHENTICATION METHODS
  // ==========================================
  
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/auth/me`);
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // ==========================================
  // PRODUCT METHODS
  // ==========================================
  
  async getProducts(filters?: ProductFilter): Promise<{ products: Product[] }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = params.toString() ? `${API_BASE_URL}/products?${params}` : `${API_BASE_URL}/products`;
    return this.fetchWithErrorHandling(url);
  }

  async getProduct(id: number): Promise<Product> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/products/${id}`);
  }

  // ==========================================
  // CART METHODS
  // ==========================================
  
  async getCart(userId?: number): Promise<Cart> {
    if (userId) {
      return this.fetchWithErrorHandling(`${API_BASE_URL}/cart?user_id=${userId}`);
    } else {
      // Use the current authenticated user's cart
      return this.fetchWithErrorHandling(`${API_BASE_URL}/cart`);
    }
  }

  async addToCart(userId: number, productId: number, quantity: number): Promise<{ message: string; cart_item_id: number; new_quantity?: number }> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, product_id: productId, quantity }),
    });
  }

  async updateCartItem(itemId: number, quantity: number): Promise<CartItem> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: number): Promise<void> {
    await this.fetchWithErrorHandling(`${API_BASE_URL}/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<void> {
    await this.fetchWithErrorHandling(`${API_BASE_URL}/cart/clear`, {
      method: 'DELETE',
    });
  }

  async updateCartQuantity(itemId: number, newQuantity: number): Promise<{ message: string; item_id?: number; new_quantity?: number }> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/cart/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: newQuantity }),
    });
  }

  // ==========================================
  // ORDER METHODS
  // ==========================================
  
  async createOrder(orderData: { shipping_address: any; payment_method: string }): Promise<Order> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/orders/create`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/orders`);
  }

  async getUserOrders(): Promise<{ orders: Order[] }> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/orders`);
  }

  async getOrder(id: number): Promise<Order> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/orders/${id}`);
  }

  // ==========================================
  // WISHLIST METHODS
  // ==========================================
  
  async getWishlist(): Promise<Product[]> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/wishlist`);
  }

  async addToWishlist(productId: number): Promise<void> {
    await this.fetchWithErrorHandling(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'POST',
    });
  }

  async removeFromWishlist(productId: number): Promise<void> {
    await this.fetchWithErrorHandling(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // ML MODEL METHODS
  // ==========================================
  
  async predictPrice(product: ProductInput): Promise<PredictionResponse> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async getModelMetrics(): Promise<ModelMetrics> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/metrics`);
  }

  async retrainModel(): Promise<{ message: string; metrics: ModelMetrics }> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/train`, {
      method: 'POST',
    });
  }

  async uploadDataset(file: File): Promise<UploadResponse> {
    const token = Cookies.get('auth_token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload-data`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        Cookies.remove('auth_token');
        Cookies.remove('auth_user');
        window.location.href = '/login';
      }
      
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    return await response.json();
  }

  // ==========================================
  // ADMIN METHODS
  // ==========================================
  
  async getDashboardStats(): Promise<any> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/admin/dashboard`);
  }

  async getAllUsers(): Promise<User[]> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/admin/users`);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/admin/orders`);
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    await this.fetchWithErrorHandling(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================
  
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