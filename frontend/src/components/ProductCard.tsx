import React, { useState, useEffect } from 'react';
import { getProductImage } from '../utils/getProductImage';

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

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
  onViewDetails?: (product: Product) => void;
  showQuickView?: boolean;
  compactMode?: boolean;
  showRating?: boolean;
  showDiscount?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  showQuickView = true,
  compactMode = false,
  showRating = true,
  showDiscount = true,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [dynamicPrice, setDynamicPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const productImage = getProductImage(product.id);

  // Fetch dynamic pricing when component mounts or product changes
  useEffect(() => {
    const fetchDynamicPrice = async () => {
      if (!product.id) return;
      
      setLoadingPrice(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/predict-price`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity: 1,
            // Add any other features your model requires
            category: product.category || 'default',
            brand: product.brand || 'unknown'
          })
        });

        if (response.ok) {
          const data = await response.json();
          setDynamicPrice(data.predicted_price || data.price);
        } else {
          console.warn('Failed to fetch dynamic price, using static price');
        }
      } catch (error) {
        console.warn('Error fetching dynamic price:', error);
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchDynamicPrice();
  }, [product.id, product.category, product.brand]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleAddToCart = () => {
    if (onAddToCart && product.inStock !== false) {
      onAddToCart(product, quantity);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const displayPrice = dynamicPrice || product.price;
  const hasDiscount = product.originalPrice && product.originalPrice > displayPrice;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - displayPrice) / product.originalPrice!) * 100)
    : product.discount;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }

    return stars;
  };

  return (
    <div 
      className={`
        bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 
        border border-gray-200 overflow-hidden group
        ${compactMode ? 'max-w-sm' : 'max-w-md'}
        ${isHovered ? 'transform -translate-y-1' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        {!imageLoaded && (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        <img
          src={productImage}
          alt={product.name}
          className={`
            w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105
            ${imageLoaded ? 'block' : 'hidden'}
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Discount Badge */}
        {showDiscount && discountPercent && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            -{discountPercent}%
          </div>
        )}

        {/* Stock Status */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}

        {/* Quick View Button */}
        {showQuickView && (
          <div className={`
            absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 
            flex items-center justify-center transition-all duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}>
            <button
              onClick={handleViewDetails}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={`p-4 ${compactMode ? 'p-3' : 'p-4'}`}>
        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category}
          </p>
        )}

        {/* Product Name */}
        <h3 className={`font-semibold text-gray-800 mb-2 line-clamp-2 ${compactMode ? 'text-sm' : 'text-lg'}`}>
          {product.name}
        </h3>

        {/* Description */}
        {product.description && !compactMode && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Rating */}
        {showRating && product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex mr-2">
              {renderStars(product.rating)}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating} {product.reviews && `(${product.reviews})`}
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {loadingPrice ? (
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Getting best price...</span>
              </div>
            ) : (
              <>
                <span className="text-xl font-bold text-gray-800">
                  {formatPrice(displayPrice)}
                </span>
                {dynamicPrice && (
                  <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                    AI Price
                  </span>
                )}
              </>
            )}
          </div>
          
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
        </div>

        {/* Quantity Selector and Add to Cart */}
        {!compactMode && product.inStock !== false && (
          <div className="flex items-center space-x-2 mb-3">
            <label htmlFor={`quantity-${product.id}`} className="text-sm text-gray-600">
              Qty:
            </label>
            <select
              id={`quantity-${product.id}`}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex space-x-2 ${compactMode ? 'flex-col space-x-0 space-y-2' : ''}`}>
          <button
            onClick={handleAddToCart}
            disabled={product.inStock === false}
            className={`
              flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold 
              transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              ${compactMode ? 'text-sm py-1.5' : ''}
            `}
          >
            {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
          </button>
          
          {!compactMode && (
            <button
              onClick={handleViewDetails}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;