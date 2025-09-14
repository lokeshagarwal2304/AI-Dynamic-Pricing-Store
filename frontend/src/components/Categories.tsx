import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  List, 
  Search, 
  Filter,
  Package,
  TrendingUp,
  Star,
  ArrowRight,
  Zap,
  Tag,
  ShoppingCart,
  Eye
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string;
  product_count: number;
  avg_price: number;
  trending: boolean;
  growth_percentage: number;
  image_url?: string;
  subcategories: string[];
  featured_products: {
    name: string;
    price: number;
    rating: number;
  }[];
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Mock data for demonstration
      const mockCategories: Category[] = [
        {
          id: 1,
          name: "Electronics",
          description: "Latest gadgets and electronic devices with smart pricing",
          product_count: 1247,
          avg_price: 299.99,
          trending: true,
          growth_percentage: 18.5,
          subcategories: ["Smartphones", "Laptops", "Audio", "Gaming", "Wearables"],
          featured_products: [
            { name: "Wireless Headphones", price: 199.99, rating: 4.8 },
            { name: "Smart Watch", price: 349.99, rating: 4.6 },
            { name: "Gaming Mouse", price: 79.99, rating: 4.7 }
          ]
        },
        {
          id: 2,
          name: "Fashion & Apparel",
          description: "Trendy clothing and accessories for every style",
          product_count: 2156,
          avg_price: 89.99,
          trending: false,
          growth_percentage: 7.2,
          subcategories: ["Men's Clothing", "Women's Clothing", "Shoes", "Accessories", "Bags"],
          featured_products: [
            { name: "Designer Jacket", price: 159.99, rating: 4.5 },
            { name: "Running Shoes", price: 129.99, rating: 4.4 },
            { name: "Leather Handbag", price: 199.99, rating: 4.6 }
          ]
        },
        {
          id: 3,
          name: "Home & Garden",
          description: "Everything for your home and outdoor spaces",
          product_count: 892,
          avg_price: 149.99,
          trending: true,
          growth_percentage: 22.1,
          subcategories: ["Furniture", "Kitchen", "Garden Tools", "Decor", "Storage"],
          featured_products: [
            { name: "Smart Thermostat", price: 249.99, rating: 4.7 },
            { name: "Garden Hose", price: 49.99, rating: 4.3 },
            { name: "Coffee Maker", price: 179.99, rating: 4.5 }
          ]
        },
        {
          id: 4,
          name: "Sports & Fitness",
          description: "Gear up for your active lifestyle",
          product_count: 634,
          avg_price: 79.99,
          trending: true,
          growth_percentage: 31.8,
          subcategories: ["Fitness Equipment", "Sports Gear", "Outdoor", "Nutrition", "Apparel"],
          featured_products: [
            { name: "Yoga Mat", price: 39.99, rating: 4.6 },
            { name: "Protein Powder", price: 59.99, rating: 4.4 },
            { name: "Resistance Bands", price: 24.99, rating: 4.5 }
          ]
        },
        {
          id: 5,
          name: "Books & Media",
          description: "Expand your knowledge and entertainment",
          product_count: 1543,
          avg_price: 24.99,
          trending: false,
          growth_percentage: 3.4,
          subcategories: ["Fiction", "Non-Fiction", "Educational", "Digital Media", "Audiobooks"],
          featured_products: [
            { name: "Bestseller Novel", price: 14.99, rating: 4.8 },
            { name: "Programming Guide", price: 49.99, rating: 4.7 },
            { name: "Audiobook Subscription", price: 19.99, rating: 4.5 }
          ]
        },
        {
          id: 6,
          name: "Health & Beauty",
          description: "Products for wellness and personal care",
          product_count: 1089,
          avg_price: 34.99,
          trending: true,
          growth_percentage: 15.7,
          subcategories: ["Skincare", "Makeup", "Health Supplements", "Personal Care", "Wellness"],
          featured_products: [
            { name: "Vitamin C Serum", price: 29.99, rating: 4.6 },
            { name: "Electric Toothbrush", price: 89.99, rating: 4.5 },
            { name: "Moisturizer", price: 24.99, rating: 4.4 }
          ]
        }
      ];
      
      setCategories(mockCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCategories = categories
    .filter(category => 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'products':
          return b.product_count - a.product_count;
        case 'price':
          return b.avg_price - a.avg_price;
        case 'trending':
          return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
        case 'growth':
          return b.growth_percentage - a.growth_percentage;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg float">
                <Tag className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gradient">Product Categories</h1>
                <p className="text-gray-600 mt-1">Explore our wide range of product categories</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                <Package className="h-5 w-5 mr-2" />
                <span className="font-medium text-sm">{categories.length} Categories</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Controls */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-enhanced pl-10"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="products">Sort by Product Count</option>
              <option value="price">Sort by Average Price</option>
              <option value="trending">Sort by Trending</option>
              <option value="growth">Sort by Growth</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCategories.map((category) => (
              <div key={category.id} className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover group">
                {/* Header */}
                <div className="relative p-6 bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                      <p className="text-purple-100 text-sm opacity-90">{category.description}</p>
                    </div>
                    {category.trending && (
                      <div className="flex items-center bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                        <Zap className="h-3 w-3 mr-1" />
                        Trending
                      </div>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-purple-100 text-xs">Products</p>
                      <p className="font-bold">{category.product_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-purple-100 text-xs">Avg Price</p>
                      <p className="font-bold">${category.avg_price.toFixed(0)}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Growth indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Growth Rate</span>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-semibold">{category.growth_percentage}%</span>
                    </div>
                  </div>

                  {/* Subcategories */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Popular Subcategories</p>
                    <div className="flex flex-wrap gap-1">
                      {category.subcategories.slice(0, 3).map((sub, index) => (
                        <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {sub}
                        </span>
                      ))}
                      {category.subcategories.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          +{category.subcategories.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Featured Products */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Featured Products</p>
                    <div className="space-y-2">
                      {category.featured_products.slice(0, 2).map((product, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 truncate">{product.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500 ml-1">{product.rating}</span>
                            </div>
                            <span className="font-semibold text-gray-900">${product.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 group">
                      <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      Browse
                    </button>
                    <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedCategories.map((category) => (
              <div key={category.id} className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6 card-hover-subtle">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Tag className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                          {category.trending && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Trending
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{category.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span>{category.product_count.toLocaleString()} products</span>
                          <span>Avg. ${category.avg_price.toFixed(0)}</span>
                          <div className="flex items-center text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {category.growth_percentage}% growth
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Browse
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAndSortedCategories.length === 0 && (
          <div className="text-center py-16">
            <Tag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
