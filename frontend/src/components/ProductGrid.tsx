import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

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

interface ProductGridProps {
  products?: Product[];
  loading?: boolean;
  error?: string;
  columns?: 2 | 3 | 4 | 5;
  gap?: 'small' | 'medium' | 'large';
  compactMode?: boolean;
  showFilters?: boolean;
  title?: string;
  subtitle?: string;
  onProductsLoad?: (products: Product[]) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onViewDetails?: (product: Product) => void;
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products: initialProducts,
  loading = false,
  error,
  columns = 4,
  gap = 'medium',
  compactMode = false,
  showFilters = false,
  title,
  subtitle,
  onProductsLoad,
  onAddToCart,
  onViewDetails,
  className = ''
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(loading);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Grid column classes mapping
  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
  };

  const gapClass = {
    small: 'gap-3',
    medium: 'gap-6',
    large: 'gap-8'
  };

  // Load products if not provided
  useEffect(() => {
    const loadProducts = async () => {
      if (initialProducts?.length) {
        setProducts(initialProducts);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || data);
          onProductsLoad?.(data.products || data);
        } else {
          console.error('Failed to load products');
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!products.length) {
      loadProducts();
    }
  }, [initialProducts, onProductsLoad]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy, priceRange]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const handleAddToCart = (product: Product, quantity: number) => {
    onAddToCart?.(product, quantity);
    // You could add toast notification here
    console.log(`Added ${quantity} x ${product.name} to cart`);
  };

  const handleViewDetails = (product: Product) => {
    onViewDetails?.(product);
    // You could navigate to product detail page here
    console.log(`Viewing details for ${product.name}`);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 text-xl mb-4">⚠️ Error Loading Products</div>
        <p className="text-gray-600 text-center max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header Section */}
      {(title || subtitle) && (
        <div className="mb-8">
          {title && <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>}
          {subtitle && <p className="text-gray-600 text-lg">{subtitle}</p>}
        </div>
      )}

      {/* Filters Section */}
      {showFilters && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="rating">Rating (High to Low)</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="flex space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        {showFilters && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSortBy('name');
              setPriceRange([0, 1000]);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className={`grid ${gridColsClass[columns]} ${gapClass[gap]}`}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
              compactMode={compactMode}
              className="w-full"
            />
          ))}
        </div>
      )}

      {/* No Products Found */}
      {!isLoading && filteredProducts.length === 0 && products.length > 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
          <p className="text-gray-500 text-center max-w-md">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Available</h3>
          <p className="text-gray-500 text-center max-w-md">
            Check back later or contact support if you believe this is an error.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;