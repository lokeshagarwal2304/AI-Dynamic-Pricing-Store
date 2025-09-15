import React from 'react';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartView: React.FC = () => {
  const { cart, loading, error, updateCartQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    try {
      await updateCartQuantity(itemId, newQuantity);
    } catch (err) {
      // Error handling is done in the context
      console.error('Failed to update quantity:', err);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (err) {
      // Error handling is done in the context
      console.error('Failed to clear cart:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-brand-dark-bg flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-brand-dark-accent"></div>
      </div>
    );
  }

  const totalPrice = cart?.items.reduce((total, item) => {
    const price = item.product.predicted_price || item.product.target_price || item.product.base_price;
    return total + (price * item.quantity);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-dark-bg transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-brand-dark-surface shadow-sm border-b border-gray-200 dark:border-brand-dark-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Continue Shopping
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ShoppingBag className="h-6 w-6 mr-2" />
              Shopping Cart ({cart?.items.length || 0} items)
            </h1>
            {cart && cart.items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          // Empty Cart State
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Discover amazing products with AI-optimized pricing</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const price = item.product.predicted_price || item.product.target_price || item.product.base_price;

                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.product_name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-gray-400" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.product.product_name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">{item.product.category}</p>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-xl font-bold text-gray-900">
                            ${price.toFixed(2)}
                          </span>
                          {item.product.base_price !== price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${item.product.base_price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>★ {item.product.rating}</span>
                          <span>({item.product.review_count} reviews)</span>
                        </div>
                      </div>

                      {/* Quantity and Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, 0)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${(price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cart.items.length} items)</span>
                    <span className="font-medium">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-medium">${(totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {totalPrice > 50 ? 'FREE' : '$9.99'}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${(totalPrice + (totalPrice * 0.08) + (totalPrice > 50 ? 0 : 9.99)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {totalPrice < 50 && (
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      Add ${(50 - totalPrice).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  Proceed to Checkout
                </button>

                <p className="mt-4 text-xs text-gray-500 text-center">
                  Secure checkout powered by AI-optimized pricing
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartView;