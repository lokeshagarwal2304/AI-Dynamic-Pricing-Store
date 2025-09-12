import React, { useState } from 'react';
import { ShoppingCart, BarChart3, Settings } from 'lucide-react';
import ProductListing from './components/ProductListing';
import AdminDashboard from './components/AdminDashboard';
import ModelPerformance from './components/ModelPerformance';

function App() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">AI Dynamic Pricing Store</h1>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'products'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="inline h-4 w-4 mr-1" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'performance'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart3 className="inline h-4 w-4 mr-1" />
                ML Performance
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' && <ProductListing />}
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'performance' && <ModelPerformance />}
      </main>
    </div>
  );
}

export default App;