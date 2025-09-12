import React, { useState, useEffect } from 'react';
import { ShoppingCart, TrendingUp, TrendingDown, Package, Star, Filter, Search } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  originalPrice: number;
  currentPrice: number;
  priceChange: number;
  priceDirection: 'up' | 'down' | 'stable';
  category: string;
  rating: number;
  reviews: number;
  inStock: number;
  lastPriceUpdate: string;
}

export const ProductListing: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  // Simulate fetching products with dynamic pricing
  useEffect(() => {
    const fetchProducts = () => {
      const mockProducts: Product[] = [
        {
          id: 1,
          name: "Premium Cotton T-Shirt",
          description: "Soft, breathable cotton t-shirt perfect for everyday wear",
          image: "https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=400",
          originalPrice: 29.99,
          currentPrice: 27.99,
          priceChange: -6.7,
          priceDirection: 'down',
          category: 'shirts',
          rating: 4.5,
          reviews: 128,
          inStock: 45,
          lastPriceUpdate: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        },
        {
          id: 2,
          name: "Slim Fit Jeans",
          description: "Classic blue denim jeans with a modern slim fit",
          image: "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400",
          originalPrice: 79.99,
          currentPrice: 84.99,
          priceChange: 6.3,
          priceDirection: 'up',
          category: 'pants',
          rating: 4.2,
          reviews: 89,
          inStock: 23,
          lastPriceUpdate: new Date(Date.now() - 1000 * 60 * 8).toISOString()
        },
        {
          id: 3,
          name: "Wool Blend Sweater",
          description: "Cozy wool blend sweater for chilly days",
          image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
          originalPrice: 89.99,
          currentPrice: 89.99,
          priceChange: 0,
          priceDirection: 'stable',
          category: 'sweaters',
          rating: 4.7,
          reviews: 156,
          inStock: 67,
          lastPriceUpdate: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: 4,
          name: "Athletic Shorts",
          description: "Lightweight shorts perfect for workouts and casual wear",
          image: "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=400",
          originalPrice: 34.99,
          currentPrice: 31.99,
          priceChange: -8.6,
          priceDirection: 'down',
          category: 'shorts',
          rating: 4.3,
          reviews: 94,
          inStock: 78,
          lastPriceUpdate: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
          id: 5,
          name: "Leather Jacket",
          description: "Genuine leather jacket with classic styling",
          image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
          originalPrice: 199.99,
          currentPrice: 219.99,
          priceChange: 10.0,
          priceDirection: 'up',
          category: 'jackets',
          rating: 4.8,
          reviews: 203,
          inStock: 12,
          lastPriceUpdate: new Date(Date.now() - 1000 * 60 * 2).toISOString()
        },
        {
          id: 6,
          name: "Summer Dress",
          description: "Light and airy dress perfect for warm weather",
          image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
          originalPrice: 59.99,
          currentPrice: 54.99,
          priceChange: -8.3,
          priceDirection: 'down',
          category: 'dresses',
          rating: 4.4,
          reviews: 167,
          inStock: 34,
          lastPriceUpdate: new Date(Date.now() - 1000 * 60 * 12).toISOString()
        }
      ];

      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    };

    fetchProducts();

    // Simulate real-time price updates
    const interval = setInterval(() => {
      setProducts(prevProducts => 
        prevProducts.map(product => {
          // Randomly update some products
          if (Math.random() < 0.1) { // 10% chance of price update
            const priceChange = (Math.random() - 0.5) * 0.1; // ±5% change
            const newPrice = Math.max(product.currentPrice * (1 + priceChange), 1);
            const changePercent = ((newPrice - product.originalPrice) / product.originalPrice) * 100;
            
            return {
              ...product,
              currentPrice: Math.round(newPrice * 100) / 100,
              priceChange: Math.round(changePercent * 10) / 10,
              priceDirection: changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable',
              lastPriceUpdate: new Date().toISOString()
            };
          }
          return product;
        })
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter and search products
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.currentPrice - b.currentPrice;
        case 'price-high':
          return b.currentPrice - a.currentPrice;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  const categories = ['all', 'shirts', 'pants', 'sweaters', 'shorts', 'jackets', 'dresses'];

  const getPriceChangeIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getPriceChangeColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-red-500';
      case 'down':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Collection</h1>
        <p className="text-gray-600">Discover our latest fashion with AI-optimized pricing</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              {product.inStock < 20 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Low Stock
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{product.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3">{product.description}</p>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.currentPrice}
                  </span>
                  {product.priceDirection !== 'stable' && (
                    <div className="flex items-center gap-1">
                      {getPriceChangeIcon(product.priceDirection)}
                      <span className={`text-xs font-medium ${getPriceChangeColor(product.priceDirection)}`}>
                        {Math.abs(product.priceChange).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                {product.originalPrice !== product.currentPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Package className="w-4 h-4" />
                  <span>{product.inStock} in stock</span>
                </div>
                <span className="text-xs text-gray-400">
                  Updated {new Date(product.lastPriceUpdate).toLocaleTimeString()}
                </span>
              </div>

              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>

              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500">
                  {product.reviews} reviews
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ProductListing