import React, { useState, useEffect } from 'react';
import { ShoppingCart, TrendingUp, TrendingDown, Star, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { apiService, Product, PredictionResponse } from '../services/apiService';

interface ProductWithPrediction extends Product {
  predicted_price?: number;
  confidence_score?: number;
  price_change_percentage?: number;
  recommendation?: string;
  loading?: boolean;
  error?: string;
}

export const ProductListing: React.FC = () => {
  const [products, setProducts] = useState<ProductWithPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const checkServerStatus = async () => {
    const status = await apiService.checkServerStatus();
    setServerOnline(status);
    return status;
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const isOnline = await checkServerStatus();
      
      if (!isOnline) {
        console.warn('Backend server is not available');
        return;
      }

      const response = await apiService.getProducts();
      const productsWithPredictions = response.products.map(product => ({
        ...product,
        loading: true
      }));
      
      setProducts(productsWithPredictions);
      
      // Get predictions for each product
      for (let i = 0; i < productsWithPredictions.length; i++) {
        const product = productsWithPredictions[i];
        try {
          const prediction = await apiService.predictPrice({
            product_name: product.product_name,
            category: product.category,
            base_price: product.base_price,
            inventory_level: product.inventory_level,
            competitor_avg_price: product.competitor_avg_price,
            sales_last_30_days: product.sales_last_30_days,
            rating: product.rating,
            review_count: product.review_count,
            season: product.season,
            brand_tier: product.brand_tier,
            material_cost: product.material_cost,
          });

          setProducts(prev => prev.map(p => 
            p.product_id === product.product_id 
              ? { 
                  ...p, 
                  ...prediction, 
                  loading: false,
                  error: undefined
                }
              : p
          ));
        } catch (error) {
          setProducts(prev => prev.map(p => 
            p.product_id === product.product_id 
              ? { 
                  ...p, 
                  loading: false,
                  error: 'Failed to get AI prediction'
                }
              : p
          ));
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPredictions = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const getPriceChangeIcon = (percentage?: number) => {
    if (!percentage) return null;
    return percentage > 0 ? 
      <TrendingUp className="w-4 h-4 text-red-500" /> : 
      <TrendingDown className="w-4 h-4 text-green-500" />;
  };

  const getPriceChangeColor = (percentage?: number) => {
    if (!percentage) return 'text-gray-500';
    return percentage > 0 ? 'text-red-500' : 'text-green-500';
  };

  const getImageUrl = (category: string) => {
    const imageMap: Record<string, string> = {
      'T-Shirts': 'https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Jeans': 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Dresses': 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Jackets': 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Shoes': 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Accessories': 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Sweaters': 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Shirts': 'https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Activewear': 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=400',
    };
    return imageMap[category] || 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products and AI predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Dynamic Pricing</h1>
          <p className="text-gray-600">Real-time ML predictions for optimal product pricing</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            serverOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {serverOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {serverOnline ? 'AI Model Online' : 'AI Model Offline'}
          </div>
          
          <button
            onClick={refreshPredictions}
            disabled={refreshing || !serverOnline}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh Prices'}
          </button>
        </div>
      </div>

      {!serverOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Backend Server Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please start the Python backend server to see AI predictions. Run: <code className="bg-yellow-100 px-1 rounded">cd backend && python run.py</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.product_id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="relative">
              <img
                src={getImageUrl(product.category)}
                alt={product.product_name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              {product.inventory_level < 50 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Low Stock
                </div>
              )}
              {product.brand_tier === 'Luxury' && (
                <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Premium
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">{product.product_name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{product.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3">{product.category} • {product.season}</p>

              {/* Pricing Section */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Base Price:</span>
                  <span className="text-sm text-gray-500 line-through">${product.base_price}</span>
                </div>
                
                {product.loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-500">Getting AI prediction...</span>
                  </div>
                ) : product.error ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{product.error}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">
                          ${product.predicted_price}
                        </span>
                        {getPriceChangeIcon(product.price_change_percentage)}
                        <span className={`text-xs font-medium ${getPriceChangeColor(product.price_change_percentage)}`}>
                          {product.price_change_percentage && Math.abs(product.price_change_percentage).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">AI Confidence:</span>
                        <span className="font-medium text-gray-900">
                          {product.confidence_score && (product.confidence_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(product.confidence_score || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                <span>Stock: {product.inventory_level}</span>
                <span>{product.review_count} reviews</span>
              </div>

              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>

              {product.recommendation && (
                <div className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  <strong>AI Insight:</strong> {product.recommendation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
          <p className="text-gray-500">Please check if the backend server is running</p>
        </div>
      )}
    </div>
  );
};

export default ProductListing;