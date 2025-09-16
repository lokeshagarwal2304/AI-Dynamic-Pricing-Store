import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Star, Package, Search, Filter, SortAsc, SortDesc, Grid, List, ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

interface Product {
  product_id: number;
  product_name: string;
  category: string;
  base_price: number;
  target_price: number;
  inventory_level: number;
  rating: number;
  review_count: number;
  competitor_avg_price: number;
  sales_last_30_days: number;
  season: string;
  brand_tier: string;
  material_cost: number;
  predicted_price?: number;
  confidence?: number;
  image_url?: string;
}

const ProductListing: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [addingToWishlist, setAddingToWishlist] = useState<number | null>(null);
  useEffect(() => {
    // Fetch wishlist on mount
    apiService.getWishlist().then((items) => {
      setWishlist(items.map((item: any) => item.product_id));
    });
  }, []);
  const handleAddToWishlist = async (productId: number) => {
    setAddingToWishlist(productId);
    try {
      await apiService.addToWishlist(productId);
      setWishlist((prev) => [...prev, productId]);
      // Optionally show a toast here
    } catch (e) {
      // Optionally show error toast
    } finally {
      setAddingToWishlist(null);
    }
  };
  const { user } = useAuth();
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortBy, setSortBy] = useState('name'); // name, price-low, price-high, rating, newest
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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
      
      // Get AI predictions for each product
      const productsWithPredictions = await Promise.all(
        data.products.map(async (product: Product) => {
          try {
            const predictionResponse = await fetch('http://localhost:8000/predict', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
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
              }),
            });
            
            if (predictionResponse.ok) {
              const prediction = await predictionResponse.json();
              return {
                ...product,
                predicted_price: prediction.predicted_price,
                confidence: prediction.confidence_score,
              };
            }
          } catch (error) {
            console.error('Prediction error for product:', product.product_name, error);
          }
          
          // Fallback to target price if prediction fails
          return {
            ...product,
            predicted_price: product.target_price,
            confidence: 0.85,
          };
        })
      );
      
      setProducts(productsWithPredictions);
    } catch (err) {
      setError('Unable to connect to AI pricing service. Please ensure the backend server is running.');
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const price = product.predicted_price || product.target_price;
      const matchesPrice = price >= priceRange.min && price <= priceRange.max;
      const matchesRating = product.rating >= ratingFilter;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });

    // Sort products
    filtered.sort((a, b) => {
      const aPrice = a.predicted_price || a.target_price;
      const bPrice = b.predicted_price || b.target_price;
      
      switch (sortBy) {
        case 'price-low':
          return aPrice - bPrice;
        case 'price-high':
          return bPrice - aPrice;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.sales_last_30_days - a.sales_last_30_days; // Using sales as proxy for popularity/newness
        case 'name':
        default:
          return a.product_name.localeCompare(b.product_name);
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, priceRange, ratingFilter, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, ratingFilter, sortBy]);

  const addToCart = async (productId: number) => {
    const userId = 1; // Hardcoded user_id as requested
    
    try {
      setAddingToCart(productId);
      await apiService.addToCart(userId, productId, 1);
      // Notify other components (like Cart) to refresh
      window.dispatchEvent(new Event('cart-updated'));
      alert('Item added to cart successfully!');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add item to cart');
    } finally {
      setAddingToCart(null);
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
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">AI-Powered Smart Shopping</h1>
          <p className="text-blue-100 text-lg">
            Discover amazing products with AI-optimized pricing based on real-time market data
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-300 rounded-md">
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products, categories, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Price Range */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Price:</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min || ''}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max || ''}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 1000 }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value={0}>All Ratings</option>
                <option value={4}>4+ Stars</option>
                <option value={3}>3+ Stars</option>
                <option value={2}>2+ Stars</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Most Popular</option>
              </select>
            </div>

            {/* View Mode and Results Info */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredAndSortedProducts.length} products found
              </span>
              
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {paginatedProducts.map((product) => {
                const inventoryStatus = getInventoryStatus(product.inventory_level);
                const predicted = product.predicted_price || product.target_price;
                const priceChange = ((predicted - product.base_price) / product.base_price * 100);
                
                if (viewMode === 'list') {
                  return (
                    <div key={product.product_id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex p-4 gap-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img
                            src={product.image_url || `/assets/${product.product_id}.jpg`}
                            alt={product.product_name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"></path></svg></div>';
                              }
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">{product.product_name}</h3>
                              <p className="text-sm text-gray-500">{product.category}</p>
                              
                              <div className="flex items-center mt-2">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="ml-1 text-sm text-gray-600">
                                    {product.rating} ({product.review_count})
                                  </span>
                                </div>
                                <span className={`ml-4 text-sm font-medium ${inventoryStatus.color}`}>
                                  {inventoryStatus.text}
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-right ml-4">
                              <div className="flex items-center justify-end">
                                <span className="text-2xl font-bold text-gray-900">
                                  ${predicted.toFixed(2)}
                                </span>
                                {getPriceChangeIcon(product.base_price, predicted)}
                              </div>
                              {product.base_price !== predicted && (
                                <div className="text-sm text-gray-500">
                                  <span className="line-through">${product.base_price.toFixed(2)}</span>
                                  <span className={`ml-2 ${priceChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 mt-3">
                                <button
                                  className={`bg-gray-100 p-2 rounded-lg transition-colors ${wishlist.includes(product.product_id) ? 'text-red-500' : 'text-gray-700'} ${addingToWishlist === product.product_id ? 'opacity-50' : ''}`}
                                  onClick={() => handleAddToWishlist(product.product_id)}
                                  disabled={addingToWishlist === product.product_id || wishlist.includes(product.product_id)}
                                  title={wishlist.includes(product.product_id) ? 'Added to Wishlist' : 'Add to Wishlist'}
                                >
                                  <Heart className={`h-4 w-4 ${wishlist.includes(product.product_id) ? 'fill-red-500 text-red-500' : ''}`} />
                                </button>
                                <button 
                                  onClick={() => addToCart(product.product_id)}
                                  disabled={addingToCart === product.product_id}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                  {addingToCart === product.product_id ? 'Adding...' : 'Add to Cart'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Grid view
                return (
                  <div key={product.product_id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="relative">
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-xl flex items-center justify-center overflow-hidden">
                        <img
                          src={product.image_url || `/assets/${product.product_id}.jpg`}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"></path></svg></div>';
                            }
                          }}
                        />
                      </div>
                      
                      {/* Wishlist button overlay */}
                      <button
                        className={`absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md transition-colors opacity-0 group-hover:opacity-100 ${wishlist.includes(product.product_id) ? 'text-red-500' : 'text-gray-600'}`}
                        onClick={() => handleAddToWishlist(product.product_id)}
                        disabled={addingToWishlist === product.product_id || wishlist.includes(product.product_id)}
                        title={wishlist.includes(product.product_id) ? 'Added to Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart className={`h-4 w-4 ${wishlist.includes(product.product_id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                      
                      {/* Discount badge */}
                      {product.base_price !== predicted && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                          {priceChange > 0 ? `+${priceChange.toFixed(0)}%` : `${priceChange.toFixed(0)}%`}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{product.product_name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            ({product.review_count})
                          </span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          inventoryStatus.color === 'text-green-600' ? 'bg-green-100 text-green-600' :
                          inventoryStatus.color === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {inventoryStatus.text}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-gray-900">
                            ${predicted.toFixed(2)}
                          </span>
                          {getPriceChangeIcon(product.base_price, predicted)}
                        </div>
                        {product.base_price !== predicted && (
                          <div className="text-sm text-gray-500">
                            <span className="line-through">${product.base_price.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* AI Confidence Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>AI Confidence</span>
                          <span>{((product.confidence || 0.85) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${(product.confidence || 0.85) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => addToCart(product.product_id)}
                        disabled={addingToCart === product.product_id}
                        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 group disabled:opacity-50"
                      >
                        <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        {addingToCart === product.product_id ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 mb-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrentPage = pageNum === currentPage;
                  
                  // Show first, last, current, and adjacent pages
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 2
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium border ${
                          isCurrentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 3 ||
                    pageNum === currentPage + 3
                  ) {
                    return (
                      <span key={pageNum} className="px-2 py-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              
              <div className="ml-6 text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
