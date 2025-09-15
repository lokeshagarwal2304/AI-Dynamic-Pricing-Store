import React, { useState, useEffect } from 'react';
import { User, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import ProfileInfo from './ProfileInfo';
import OrderHistory from './OrderHistory';

interface Order {
  order_id: number;
  order_number: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

const Profile: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  
  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // In a real app, you'd fetch full profile data
      // const profile = await apiService.getUserProfile();

      // For summary, fetch a simplified orders list
      const response = await apiService.getUserOrders();
      setOrders(response.orders || []);
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600">Welcome back, {user?.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setSelectedTab('orders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setSelectedTab('addresses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'addresses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Addresses
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {selectedTab === 'profile' && (
          <ProfileInfo orders={orders} />
        )}

        {/* Orders Tab */}
        {selectedTab === 'orders' && (
          <OrderHistory isActive={selectedTab === 'orders'} />
        )}

        {/* Addresses Tab */}
        {selectedTab === 'addresses' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved addresses</h3>
              <p className="text-gray-600 mb-6">Save your addresses for faster checkout</p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Add New Address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;