import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Star, Package } from 'lucide-react';

interface Product {
  id: number;
  product_name: string;
  category: string;
  base_price: number;
  predicted_price: number;
  inventory_level: number;
  rating: number;
  review_count: number;
  confidence: number;
}

const ProductListing: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/products');
      if (!response.ok) {
        throw new Error('Backend server is not running');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Unable to connect to AI pricing service. Please ensure the backend server is running.');
      // Mock data for demo purposes
      setProducts([
        {
          id: 1,
          product_name: "Premium Cotton T-Shirt",
          category: "T-Shirts",
          base_price: 29.99,
          predicted_price: 27.45,
          inventory_level: 150,
          rating: 4.2,
          review_count: 128,
          confidence: 0.87
        },
        {
          id: 2,
          product_name: "Wireless Bluetooth Headphones",
          category: "Electronics",
          base_price: 89.99,
          predicted_price: 94.50,
          inventory_level: 45,
          rating: 4.5,
          review_count: 342,
          confidence: 0.92
        },
        {
          id: 3,
          product_name: "Organic Coffee Beans",
          category: "Food",
          base_price: 24.99,
          predicted_price: 23.75,
          inventory_level: 200,
          rating: 4.7,
          review_count: 89,
          confidence: 0.85
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPriceChangeIcon = (basePrice: number, predictedPrice: number) => {
    if (predictedPrice > basePrice) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (predictedPrice < basePrice) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  const getInventoryStatus = (level: number) => {
    if (level > 100) return { text: 'In Stock', color: 'text-green-600' };
    if (level > 20) return { text: 'Low Stock', color: 'text-yellow-600' };
    return { text: 'Very Low', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Dynamic Pricing</h2>
        <p className="text-gray-600">
          Prices are automatically optimized using machine learning based on inventory, demand, and market conditions.
        </p>
        {error && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const inventoryStatus = getInventoryStatus(product.inventory_level);
          const priceChange = ((product.predicted_price - product.base_price) / product.base_price * 100);
          
          return (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.product_name}</h3>
                <p className="text-sm text-gray-500 mb-4">{product.category}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">
                      {product.rating} ({product.review_count} reviews)
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${inventoryStatus.color}`}>
                    {inventoryStatus.text}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-gray-900">
                        ${product.predicted_price.toFixed(2)}
                      </span>
                      {getPriceChangeIcon(product.base_price, product.predicted_price)}
                    </div>
                    {product.base_price !== product.predicted_price && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="line-through mr-2">${product.base_price.toFixed(2)}</span>
                        <span className={priceChange > 0 ? 'text-red-600' : 'text-green-600'}>
                          {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>AI Confidence</span>
                    <span>{(product.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${product.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductListing;