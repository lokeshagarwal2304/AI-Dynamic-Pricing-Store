import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';

interface OrderConfirmationProps {
  orderNumber?: string;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderNumber: propOrderNumber }) => {
  const { orderNumber: paramOrderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [orderNumber] = useState(propOrderNumber || paramOrderNumber || '');

  useEffect(() => {
    // If no order number is provided, redirect to products page
    if (!orderNumber) {
      navigate('/products');
    }
  }, [orderNumber, navigate]);

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleViewOrders = () => {
    navigate('/profile'); // Navigate to profile where orders can be viewed
  };

  if (!orderNumber) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed and will be processed shortly.
        </p>

        {/* Order Number */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Order Number</p>
          <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
        </div>

        {/* Order Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <Package className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">Processing</span>
          </div>
          <p className="text-blue-700 text-sm">
            We're preparing your order for shipment. You'll receive a tracking number soon.
          </p>
        </div>

        {/* Next Steps */}
        <div className="text-left mb-6">
          <h3 className="font-medium text-gray-900 mb-3">What happens next?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Order confirmation email sent to your registered email</span>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Your order will be processed within 1-2 business days</span>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Tracking information will be provided once shipped</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleViewOrders}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Package className="h-5 w-5" />
            View Your Orders
          </button>
          
          <button
            onClick={handleContinueShopping}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Continue Shopping
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;