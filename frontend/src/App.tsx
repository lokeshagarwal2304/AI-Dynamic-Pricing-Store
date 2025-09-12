import React, { useState } from 'react';
import ProductListing from './components/ProductListing';
import AdminDashboard from './components/AdminDashboard';
import ModelPerformance from './components/ModelPerformance';
import { ShoppingCart, Settings, BarChart3 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AI Dynamic Pricing Store</span>
            </div>
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Products
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="h-4 w-4 mr-1" />
                Admin Dashboard
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'performance'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                ML Performance
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'products' && <ProductListing />}
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'performance' && <ModelPerformance />}
      </main>
    </div>
  );
}

export default App;