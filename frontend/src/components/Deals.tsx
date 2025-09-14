import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Clock, 
  Star, 
  ShoppingCart, 
  Heart,
  Zap,
  Gift,
  TrendingUp,
  Package,
  Timer,
  Tag,
  Percent
} from 'lucide-react';

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

const Deals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDealType, setSelectedDealType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      // Mock data for demonstration
      const mockDeals: Deal[] = [
        {
          id: 1,
          product_name: "Premium Wireless Headphones",
          category: "Electronics",
          original_price: 299.99,
          discounted_price: 179.99,
          discount_percentage: 40,
          deal_type: "flash",
          time_remaining: 8,
          stock_remaining: 23,
          rating: 4.8,
          review_count: 1247,
          description: "High-quality noise-canceling headphones with 30-hour battery life"
        },
        {
          id: 2,
          product_name: "Smart Fitness Tracker",
          category: "Sports & Fitness",
          original_price: 199.99,
          discounted_price: 149.99,
          discount_percentage: 25,
          deal_type: "daily",
          time_remaining: 18,
          stock_remaining: 67,
          rating: 4.6,
          review_count: 892,
          description: "Track your health with advanced sensors and AI insights"
        },
        {
          id: 3,
          product_name: "4K Smart TV 55\"",
          category: "Electronics",
          original_price: 799.99,
          discounted_price: 599.99,
          discount_percentage: 25,
          deal_type: "weekly",
          time_remaining: 120,
          stock_remaining: 12,
          rating: 4.7,
          review_count: 2156,
          description: "Ultra HD Smart TV with HDR and built-in streaming apps"
        },
        {
          id: 4,
          product_name: "Designer Backpack",
          category: "Fashion",
          original_price: 129.99,
          discounted_price: 64.99,
          discount_percentage: 50,
          deal_type: "clearance",
          time_remaining: 72,
          stock_remaining: 8,
          rating: 4.4,
          review_count: 543,
          description: "Stylish and functional backpack perfect for work or travel"
        },
        {
          id: 5,
          product_name: "Robot Vacuum Cleaner",
          category: "Home & Garden",
          original_price: 449.99,
          discounted_price: 299.99,
          discount_percentage: 33,
          deal_type: "flash",
          time_remaining: 4,
          stock_remaining: 15,
          rating: 4.5,
          review_count: 1089,
          description: "Smart navigation robot vacuum with app control"
        }
      ];
      
      setDeals(mockDeals);
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
                <h1 className="text-3xl font-bold text-gray-900">Hot Deals 🔥</h1>
                <p className="text-gray-600 mt-1">Limited time offers with AI-optimized pricing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <TrendingUp className="h-5 w-5 mr-2" />
                <span className="font-medium text-sm">Up to 50% OFF</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Deal Type</label>
              <select
                value={selectedDealType}
                onChange={(e) => setSelectedDealType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Deals</option>
                <option value="flash">Flash Deals</option>
                <option value="daily">Daily Deals</option>
                <option value="weekly">Weekly Deals</option>
                <option value="clearance">Clearance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <div key={deal.id} className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              {/* Deal Badge */}
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
                
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  -{deal.discount_percentage}%
                </div>
                
                {/* Deal Type Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium border ${getDealTypeColor(deal.deal_type)} shadow-sm`}>
                  <div className="flex items-center gap-1">
                    {getDealTypeIcon(deal.deal_type)}
                    {deal.deal_type.charAt(0).toUpperCase() + deal.deal_type.slice(1)}
                  </div>
                </div>

                {/* Wishlist Button */}
                <button className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                  <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">{deal.product_name}</h3>
                </div>
                
                <p className="text-sm text-gray-500 mb-2">{deal.category}</p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{deal.description}</p>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor(deal.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {deal.rating} ({deal.review_count})
                  </span>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ${deal.discounted_price.toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${deal.original_price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <Percent className="h-4 w-4 mr-1" />
                    You save ${(deal.original_price - deal.discounted_price).toFixed(2)}
                  </div>
                </div>

                {/* Time and Stock */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center text-orange-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTimeRemaining(deal.time_remaining)}
                  </div>
                  <div className={`flex items-center ${getUrgencyColor(deal.stock_remaining)}`}>
                    <Package className="h-4 w-4 mr-1" />
                    {deal.stock_remaining} left
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 group shadow-lg">
                  <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDeals.length === 0 && (
          <div className="text-center py-16">
            <Flame className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more deals</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deals;
