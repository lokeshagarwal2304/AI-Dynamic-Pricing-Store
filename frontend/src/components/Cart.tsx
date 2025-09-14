import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

interface CartItem {
  cart_id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  category: string;
  base_price: number;
  target_price: number;
  predicted_price?: number;
  rating: number;
  review_count: number;
  inventory_level: number;
}

interface CartSummary {
  total_items: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const cartSummary: CartSummary = React.useMemo(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.predicted_price || item.target_price;
      return sum + (price * item.quantity);
    }, 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    return {
      total_items: totalItems,
      subtotal,
      tax,
      shipping,
      total
    };
  }, [cartItems]);

  useEffect(() => {
    fetchCartItems();
    // Listen for cart updates from other components
    const handleCartUpdate = () => fetchCartItems();
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  const fetchCartItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await apiService.getCart();
      setCartItems(response.items || []);
    } catch (err) {
      console.error('Failed to fetch cart items:', err);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(productId);
      return;
    }

    try {
      setUpdating(productId);
      await apiService.updateCartItem(productId, newQuantity);
      
      setCartItems(prev => prev.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: number) => {
    try {
      setUpdating(productId);
      await apiService.removeFromCart(productId);
      setCartItems(prev => prev.filter(item => item.product_id !== productId));
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await apiService.clearCart();
      setCartItems([]);
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const getInventoryStatus = (level: number) => {
    if (level > 100) return { text: 'In Stock', color: 'text-green-600' };
    if (level > 20) return { text: 'Low Stock', color: 'text-yellow-600' };
    return { text: 'Very Low', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/products')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Continue Shopping
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ShoppingBag className="h-6 w-6 mr-2" />
              Shopping Cart ({cartSummary.total_items} items)
            </h1>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
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

        {cartItems.length === 0 ? (
          // Empty Cart State
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Discover amazing products with AI-optimized pricing</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const price = item.predicted_price || item.target_price;
                const inventoryStatus = getInventoryStatus(item.inventory_level);
                const isUpdating = updating === item.product_id;

                return (
                  <div key={item.cart_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                      {/* Product Image Placeholder */}
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.product_name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-xl font-bold text-gray-900">
                            ${price.toFixed(2)}
                          </span>
                          {item.base_price !== price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${item.base_price.toFixed(2)}
                            </span>
                          )}
                          <span className={`text-sm font-medium ${inventoryStatus.color}`}>
                            {inventoryStatus.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>★ {item.rating}</span>
                          <span>({item.review_count} reviews)</span>
                        </div>
                      </div>

                      {/* Quantity and Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <button
                          onClick={() => removeItem(item.product_id)}
                          disabled={isUpdating}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            disabled={isUpdating}
                            className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                            {isUpdating ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            disabled={isUpdating || item.inventory_level <= item.quantity}
                            className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                    <span className="text-gray-600">Subtotal ({cartSummary.total_items} items)</span>
                    <span className="font-medium">${cartSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {cartSummary.shipping === 0 ? 'FREE' : `$${cartSummary.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${cartSummary.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">${cartSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {cartSummary.subtotal < 50 && (
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      Add ${(50 - cartSummary.subtotal).toFixed(2)} more for free shipping!
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

export default Cart;