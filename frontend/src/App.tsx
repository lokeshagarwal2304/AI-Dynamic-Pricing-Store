import React, { useState } from 'react';
import ProductListing from './components/ProductListing';
import AdminDashboard from './components/AdminDashboard';
import ModelPerformance from './components/ModelPerformance';
import { ShoppingBag, BarChart3, Brain } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState<'products' | 'admin' | 'performance'>('products');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Dynamic Pricing Store</h1>
            </div>
            
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveView('products')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'products'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ShoppingBag className="w-4 h-4 inline mr-2" />
                Products
              </button>
              <button
                onClick={() => setActiveView('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'admin'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('performance')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'performance'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                ML Performance
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {activeView === 'products' && <ProductListing />}
        {activeView === 'admin' && <AdminDashboard />}
        {activeView === 'performance' && <ModelPerformance />}
      </main>
    </div>
  );
}

export default App;