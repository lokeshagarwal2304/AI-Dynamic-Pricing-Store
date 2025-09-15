import React, { useState } from 'react';
import ProductCard from './ProductCard';
import ProductGrid from './ProductGrid';
import { sampleProducts, getFeaturedProducts, getDiscountedProducts } from '../data/sampleProducts';
import { Package, Grid, Star, TrendingUp } from 'lucide-react';

const ProductDemo: React.FC = () => {
  const [demoMode, setDemoMode] = useState<'single' | 'grid' | 'featured' | 'deals'>('grid');
  
  const handleAddToCart = (product: any, quantity: number) => {
    alert(`Added ${quantity} x ${product.name} to cart!`);
  };

  const handleViewDetails = (product: any) => {
    alert(`Viewing details for: ${product.name}`);
  };

  const featuredProducts = getFeaturedProducts(4);
  const discountedProducts = getDiscountedProducts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ProductCard & ProductGrid Demo
                </h1>
                <p className="text-gray-600 mt-1">Showcase of AI-driven dynamic pricing components</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <Star className="h-5 w-5 mr-2" />
                <span className="font-medium text-sm">AI-Powered Pricing</span>
              </div>
              <div className="flex items-center text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                <TrendingUp className="h-5 w-5 mr-2" />
                <span className="font-medium text-sm">Dynamic Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Selector */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Demo Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setDemoMode('single')}
              className={`p-4 rounded-xl border-2 transition-all ${
                demoMode === 'single' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Package className="h-6 w-6 mx-auto mb-2" />
              <div className="font-medium">Single ProductCard</div>
              <div className="text-sm opacity-75">Individual card demo</div>
            </button>
            
            <button
              onClick={() => setDemoMode('grid')}
              className={`p-4 rounded-xl border-2 transition-all ${
                demoMode === 'grid' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Grid className="h-6 w-6 mx-auto mb-2" />
              <div className="font-medium">ProductGrid</div>
              <div className="text-sm opacity-75">All products with filters</div>
            </button>
            
            <button
              onClick={() => setDemoMode('featured')}
              className={`p-4 rounded-xl border-2 transition-all ${
                demoMode === 'featured' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Star className="h-6 w-6 mx-auto mb-2" />
              <div className="font-medium">Featured Products</div>
              <div className="text-sm opacity-75">Top rated products</div>
            </button>
            
            <button
              onClick={() => setDemoMode('deals')}
              className={`p-4 rounded-xl border-2 transition-all ${
                demoMode === 'deals' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <div className="font-medium">Discounted Products</div>
              <div className="text-sm opacity-75">Products on sale</div>
            </button>
          </div>
        </div>

        {/* Demo Content */}
        {demoMode === 'single' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Single ProductCard Examples</h3>
              <p className="text-gray-600 mb-6">Individual ProductCard components showcasing different features and states</p>
            </div>
            
            {/* Different card modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Regular Mode</h4>
                <ProductCard
                  product={sampleProducts[0]}
                  onAddToCart={handleAddToCart}
                  onViewDetails={handleViewDetails}
                />
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Compact Mode</h4>
                <ProductCard
                  product={sampleProducts[1]}
                  compactMode={true}
                  onAddToCart={handleAddToCart}
                  onViewDetails={handleViewDetails}
                />
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Out of Stock</h4>
                <ProductCard
                  product={{...sampleProducts[2], inStock: false}}
                  onAddToCart={handleAddToCart}
                  onViewDetails={handleViewDetails}
                />
              </div>
            </div>
          </div>
        )}

        {demoMode === 'grid' && (
          <ProductGrid
            products={sampleProducts}
            title="All Products"
            subtitle="Complete product catalog with filtering and search capabilities"
            columns={4}
            gap="medium"
            showFilters={true}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
          />
        )}

        {demoMode === 'featured' && (
          <ProductGrid
            products={featuredProducts}
            title="Featured Products"
            subtitle="Our top-rated products with the best customer reviews"
            columns={4}
            gap="large"
            showFilters={false}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
          />
        )}

        {demoMode === 'deals' && (
          <ProductGrid
            products={discountedProducts}
            title="Special Deals"
            subtitle="Products with special pricing and limited-time offers"
            columns={3}
            gap="medium"
            showFilters={true}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* Features Info */}
        <div className="mt-12 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Component Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600">ProductCard Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI-powered dynamic pricing</li>
                <li>• Real-time price updates</li>
                <li>• Interactive hover effects</li>
                <li>• Star rating system</li>
                <li>• Stock status indicators</li>
                <li>• Discount badges</li>
                <li>• Quick view functionality</li>
                <li>• Quantity selection</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-600">ProductGrid Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Advanced filtering system</li>
                <li>• Search functionality</li>
                <li>• Multiple sorting options</li>
                <li>• Price range filters</li>
                <li>• Category filtering</li>
                <li>• Responsive grid layouts</li>
                <li>• Loading states</li>
                <li>• Empty state handling</li>
                <li>• Configurable columns</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">Integration Benefits</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Backend API integration</li>
                <li>• Dynamic image loading</li>
                <li>• Error handling</li>
                <li>• Performance optimized</li>
                <li>• TypeScript support</li>
                <li>• Accessibility features</li>
                <li>• Mobile-first design</li>
                <li>• Tailwind CSS styling</li>
                <li>• Modular architecture</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDemo;