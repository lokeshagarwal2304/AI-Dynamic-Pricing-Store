import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Clock, 
  Star, 
  ShoppingCart, 
  Heart,
  Zap,
  Gift,
  Package,
  Timer,
  Tag,
  Percent
} from 'lucide-react';

import ProductGrid from './ProductGrid';
import { getDiscountedProducts } from '../data/sampleProducts';

interface Deal {
  id: number;
  product_name: string;
  category: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  deal_type: 'flash' | 'daily' | 'weekly' | 'clearance';
  time_remaining: number; // in hours
  stock_remaining: number;
  rating: number;
  review_count: number;
  image_url?: string;
  description: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category?: string;
  brand?: string;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
  discount?: number;
}

const DealsWithProductCards: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDealType, setSelectedDealType] = useState('all');
  const [viewMode, setViewMode] = useState<'deals' | 'products'>('deals');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // Initialize deals data
      const mockDeals: Deal[] = [
        {
          id: 1,
          product_name: "Wireless Bluetooth Headphones",
          category: "Electronics",
          original_price: 249.99,
          discounted_price: 199.99,
          discount_percentage: 20,
          deal_type: "flash",
          time_remaining: 8,
          stock_remaining: 23,
          rating: 4.5,
          review_count: 1247,
          description: "Premium quality wireless headphones with active noise cancellation and 30-hour battery life"
        },
        {
          id: 2,
          product_name: "Smart Fitness Tracker",
          category: "Fitness",
          original_price: 119.99,
          discounted_price: 89.99,
          discount_percentage: 25,
          deal_type: "daily",
          time_remaining: 18,
          stock_remaining: 67,
          rating: 4.2,
          review_count: 834,
          description: "Advanced fitness tracker with heart rate monitoring, sleep tracking, and waterproof design"
        },
        {
          id: 4,
          product_name: "Gaming Mechanical Keyboard",
          category: "Gaming",
          original_price: 179.99,
          discounted_price: 149.99,
          discount_percentage: 17,
          deal_type: "weekly",
          time_remaining: 120,
          stock_remaining: 12,
          rating: 4.6,
          review_count: 1156,
          description: "RGB backlit mechanical gaming keyboard with tactile switches and programmable keys"
        },
        {
          id: 6,
          product_name: "Wireless Phone Charger",
          category: "Electronics",
          original_price: 59.99,
          discounted_price: 39.99,
          discount_percentage: 33,
          deal_type: "clearance",
          time_remaining: 72,
          stock_remaining: 8,
          rating: 4.1,
          review_count: 278,
          description: "Fast wireless charging pad compatible with all Qi-enabled devices"
        },
        {
          id: 8,
          product_name: "Smart Home Security Camera",
          category: "Home Security",
          original_price: 169.99,
          discounted_price: 129.99,
          discount_percentage: 24,
          deal_type: "flash",
          time_remaining: 4,
          stock_remaining: 15,
          rating: 4.5,
          review_count: 756,
          description: "HD security camera with night vision, motion detection, and smartphone app integration"
        }
      ];

      setDeals(mockDeals);

      // Get discounted products from sample data
      const discountedProducts = getDiscountedProducts();
      setProducts(discountedProducts);

    } catch (error) {
      console.error('Failed to fetch deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (hours: number) => {
    if (hours < 24) {
      return `${hours}h remaining`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h remaining`;
    }
  };

  const getDealTypeIcon = (type: string) => {
    switch (type) {
      case 'flash':
        return <Zap className="h-4 w-4" />;
      case 'daily':
        return <Clock className="h-4 w-4" />;
      case 'weekly':
        return <Timer className="h-4 w-4" />;
      case 'clearance':
        return <Tag className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  const getDealTypeColor = (type: string) => {
    switch (type) {
      case 'flash':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'daily':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'weekly':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'clearance':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (stock: number) => {
    if (stock <= 10) return 'text-red-600';
    if (stock <= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredDeals = deals.filter(deal => {
    const matchesCategory = selectedCategory === 'all' || deal.category === selectedCategory;
    const matchesDealType = selectedDealType === 'all' || deal.deal_type === selectedDealType;
    return matchesCategory && matchesDealType;
  });

  const categories = [...new Set(deals.map(deal => deal.category))];

  const handleAddToCart = (product: Product, quantity: number) => {
    console.log(`Added ${quantity} x ${product.name} to cart`);
    // Here you would integrate with your cart management system
  };

  const handleViewDetails = (product: Product) => {
    console.log(`Viewing details for ${product.name}`);
    // Here you would navigate to product detail page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Flame className="h-7 w-7 text-white animate-pulse" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Hot Deals & Discounts
                </h1>
                <p className="text-gray-600 mt-1">Save big on top-rated products with AI-powered dynamic pricing</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <Percent className="h-5 w-5 mr-2" />
                <span className="font-medium text-sm">Up to 50% Off</span>
              </div>
              <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                <Package className="h-5 w-5 mr-2" />
                <span className="font-medium text-sm">{deals.length} Active Deals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Mode Toggle & Filters */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('deals')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'deals' 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Flame className="h-4 w-4 mr-2 inline" />
                Deal Cards
              </button>
              <button
                onClick={() => setViewMode('products')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'products' 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Package className="h-4 w-4 mr-2 inline" />
                Product Grid
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedDealType}
                onChange={(e) => setSelectedDealType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Deal Types</option>
                <option value="flash">Flash Deals</option>
                <option value="daily">Daily Deals</option>
                <option value="weekly">Weekly Deals</option>
                <option value="clearance">Clearance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'deals' ? (
          /* Deal Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => (
              <div key={deal.id} className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
                {/* Deal Header */}
                <div className="relative bg-gradient-to-br from-red-500 to-orange-500 text-white p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDealTypeColor(deal.deal_type)} bg-white/90 text-gray-800 flex items-center gap-1`}>
                      {getDealTypeIcon(deal.deal_type)}
                      {deal.deal_type.charAt(0).toUpperCase() + deal.deal_type.slice(1)} Deal
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold">-{deal.discount_percentage}%</div>
                      <div className="text-xs opacity-90">OFF</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{deal.product_name}</h3>
                  <p className="text-red-100 text-sm opacity-90">{deal.description}</p>
                </div>

                {/* Deal Content */}
                <div className="p-6">
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">${deal.discounted_price}</div>
                      <div className="text-gray-500 line-through text-sm">${deal.original_price}</div>
                    </div>
                    <div className="text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-lg">
                      Save ${(deal.original_price - deal.discounted_price).toFixed(2)}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(deal.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{deal.rating} ({deal.review_count} reviews)</span>
                  </div>

                  {/* Stock & Time */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stock remaining</span>
                      <span className={`font-semibold ${getUrgencyColor(deal.stock_remaining)}`}>
                        {deal.stock_remaining} left
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Time remaining</span>
                      <span className="text-red-600 font-semibold">{formatTimeRemaining(deal.time_remaining)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 group">
                      <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      Add to Cart
                    </button>
                    <button className="bg-gray-100 text-gray-600 p-3 rounded-xl hover:bg-gray-200 transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Product Grid View */
          <ProductGrid
            products={products}
            title="Discounted Products"
            subtitle="All products with special pricing and AI-optimized deals"
            columns={4}
            gap="medium"
            showFilters={true}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* No Deals Found */}
        {filteredDeals.length === 0 && viewMode === 'deals' && (
          <div className="text-center py-16">
            <Flame className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-600">Try adjusting your filters to see available deals</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsWithProductCards;