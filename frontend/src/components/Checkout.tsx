import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail, Lock, CheckCircle, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
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

interface CheckoutFormData {
  // Shipping Address
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Payment Method
  paymentMethod: 'credit' | 'debit' | 'paypal';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

const Checkout: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  
  const { user } = useAuth();
  const { cart, loading, clearCart } = useCart();
  const navigate = useNavigate();
  
  const cartItems = cart?.items || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<CheckoutFormData>({
    defaultValues: {
      country: 'United States',
      paymentMethod: 'credit'
    }
  });

  const cartSummary = React.useMemo(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.predicted_price || item.target_price;
      return sum + (price * item.quantity);
    }, 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    return {
      totalItems,
      subtotal,
      tax,
      shipping,
      total
    };
  }, [cartItems]);

  useEffect(() => {
    // Redirect to cart if no items
    if (!loading && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, loading, navigate]);

  useEffect(() => {
    // Populate user information if available
    if (user) {
      setValue('email', user.email || '');
      setValue('firstName', user.username.split(' ')[0] || '');
      setValue('lastName', user.username.split(' ')[1] || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setSubmitting(true);
      setError('');

      // Create order data
      const orderData = {
        shipping_address: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          apartment: data.apartment,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          country: data.country
        },
        payment_method: data.paymentMethod
      };

      // Create order via API
      const orderResponse = await apiService.createOrder(orderData);
      const generatedOrderNumber = `ORD-${orderResponse.id.toString().padStart(6, '0')}`;
      
      // Clear cart after successful order (handled by backend, but refresh context)
      await clearCart();
      
      // Redirect to order confirmation page
      navigate(`/order-confirmation/${generatedOrderNumber}`);
      
    } catch (err) {
      console.error('Failed to create order:', err);
      setError('Failed to process your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 'shipping') setCurrentStep('payment');
    else if (currentStep === 'payment') setCurrentStep('review');
  };

  const prevStep = () => {
    if (currentStep === 'payment') setCurrentStep('shipping');
    else if (currentStep === 'review') setCurrentStep('payment');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/cart')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Cart
              </button>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Secure Checkout</h1>
            <div className="w-24"></div> {/* Spacer for center alignment */}
          </div>
          
          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center ${currentStep === 'shipping' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="font-medium">Shipping</span>
                </div>
                <div className="h-0.5 w-16 bg-gray-200"></div>
                <div className={`flex items-center ${currentStep === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <CreditCard className="h-5 w-5 mr-2" />
                  <span className="font-medium">Payment</span>
                </div>
                <div className="h-0.5 w-16 bg-gray-200"></div>
                <div className={`flex items-center ${currentStep === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {currentStep === 'shipping' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        {...register('firstName', { required: 'First name is required' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        {...register('lastName', { required: 'Last name is required' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                        })}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        {...register('phone', { required: 'Phone number is required' })}
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      {...register('address', { required: 'Address is required' })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apartment, suite, etc. (optional)</label>
                    <input
                      {...register('apartment')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        {...register('city', { required: 'City is required' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        {...register('state', { required: 'State is required' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        {...register('zipCode', { required: 'ZIP code is required' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'payment' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Method
                  </h2>
                  
                  <div className="mb-6">
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          {...register('paymentMethod')}
                          type="radio"
                          value="credit"
                          className="mr-3 text-blue-600"
                        />
                        <span className="text-gray-700">Credit Card</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          {...register('paymentMethod')}
                          type="radio"
                          value="debit"
                          className="mr-3 text-blue-600"
                        />
                        <span className="text-gray-700">Debit Card</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          {...register('paymentMethod')}
                          type="radio"
                          value="paypal"
                          className="mr-3 text-blue-600"
                        />
                        <span className="text-gray-700">PayPal</span>
                      </label>
                    </div>
                  </div>

                  {watch('paymentMethod') !== 'paypal' && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                        <input
                          {...register('cardName', { required: 'Name on card is required' })}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.cardName && <p className="mt-1 text-sm text-red-600">{errors.cardName.message}</p>}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <input
                          {...register('cardNumber', { 
                            required: 'Card number is required',
                            pattern: { value: /^\d{16}$/, message: 'Please enter a valid 16-digit card number' }
                          })}
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                          <input
                            {...register('expiryDate', { 
                              required: 'Expiry date is required',
                              pattern: { value: /^\d{2}\/\d{2}$/, message: 'Please enter MM/YY format' }
                            })}
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                          <input
                            {...register('cvv', { 
                              required: 'CVV is required',
                              pattern: { value: /^\d{3,4}$/, message: 'Please enter a valid CVV' }
                            })}
                            type="text"
                            placeholder="123"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="mt-6 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Back to Shipping
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'review' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Review Your Order
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => {
                      const price = item.predicted_price || item.target_price;
                      return (
                        <div key={item.cart_id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                            <p className="text-sm text-gray-500">{item.category}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">${(price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Back to Payment
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Place Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cartSummary.totalItems} items)</span>
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

                <div className="text-center text-sm text-gray-500">
                  <Lock className="inline h-4 w-4 mr-1" />
                  Your payment information is secure and encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;