import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, Cart, CartItem } from '../services/apiService';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string;
  cartItemCount: number;
  cartTotal: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  // Computed properties
  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart?.total_amount || 0;

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const cartData = await apiService.getCart();
      setCart(cartData);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('Failed to load cart items');
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    if (!user) {
      throw new Error('User must be logged in to add items to cart');
    }

    try {
      setError('');
      await apiService.addToCart(user.id, productId, quantity);
      // Refresh cart after adding item
      await fetchCart();
      
      // Dispatch custom event for components that need to know about cart updates
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      setError('Failed to add item to cart');
      throw err;
    }
  };

  const updateCartQuantity = async (itemId: number, quantity: number) => {
    try {
      setError('');
      
      // Optimistic update - immediately update local state
      if (cart) {
        if (quantity <= 0) {
          // Remove item from local state
          setCart({
            ...cart,
            items: cart.items.filter(item => item.id !== itemId),
            total_amount: cart.items
              .filter(item => item.id !== itemId)
              .reduce((sum, item) => {
                const price = item.product.predicted_price || item.product.target_price || item.product.base_price;
                return sum + (price * item.quantity);
              }, 0)
          });
        } else {
          // Update item quantity in local state
          setCart({
            ...cart,
            items: cart.items.map(item => 
              item.id === itemId 
                ? { ...item, quantity }
                : item
            ),
            total_amount: cart.items
              .map(item => item.id === itemId ? { ...item, quantity } : item)
              .reduce((sum, item) => {
                const price = item.product.predicted_price || item.product.target_price || item.product.base_price;
                return sum + (price * item.quantity);
              }, 0)
          });
        }
      }

      // Make API call
      await apiService.updateCartQuantity(itemId, quantity);
      
      // Refresh cart to ensure consistency
      await fetchCart();
      
      // Dispatch custom event for components that need to know about cart updates
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (err) {
      console.error('Failed to update cart quantity:', err);
      setError('Failed to update quantity');
      // If API call fails, refresh cart to get the correct state
      await fetchCart();
      throw err;
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      setError('');
      await apiService.removeFromCart(itemId);
      await fetchCart();
      
      // Dispatch custom event for components that need to know about cart updates
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
      setError('Failed to remove item from cart');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError('');
      await apiService.clearCart();
      setCart({ items: [], total_amount: 0 });
      
      // Dispatch custom event for components that need to know about cart updates
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError('Failed to clear cart');
      throw err;
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  // Fetch cart when user changes or when component mounts
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const contextValue: CartContextType = {
    cart,
    loading,
    error,
    cartItemCount,
    cartTotal,
    fetchCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};