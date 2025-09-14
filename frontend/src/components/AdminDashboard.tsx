import React, { useState, useEffect } from 'react';
import { 
  Upload, RefreshCw, AlertCircle, CheckCircle, Users, Package, ShoppingCart, 
  TrendingUp, DollarSign, Eye, Edit, Trash2, Plus, BarChart3, PieChart, 
  Settings, Database, Activity, Calendar, Filter, Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  avgOrderValue: number;
  conversionRate: number;
  topCategories: { category: string; count: number; revenue: number }[];
  recentOrders: any[];
  recentUsers: any[];
}

interface Product {
  product_id: number;
  product_name: string;
  category: string;
  base_price: number;
  target_price: number;
  inventory_level: number;
  rating: number;
  review_count: number;
  sales_last_30_days: number;
}

const AdminDashboard: React.FC = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'products' | 'users' | 'analytics' | 'system'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { user } = useAuth();

  useEffect(() => {
    checkServerStatus();
    fetchDashboardData();
    fetchProducts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, you'd have dashboard API endpoints
      // For now, we'll simulate with mock data
      const mockStats: DashboardStats = {
        totalUsers: 247,
        totalProducts: 65,
        totalOrders: 183,
        totalRevenue: 12450.75,
        activeUsers: 89,
        avgOrderValue: 68.03,
        conversionRate: 3.2,
        topCategories: [
          { category: 'Electronics', count: 25, revenue: 4500.00 },
          { category: 'Clothing', count: 18, revenue: 3200.50 },
          { category: 'Home & Garden', count: 12, revenue: 2100.25 },
          { category: 'Sports', count: 10, revenue: 2650.00 }
        ],
        recentOrders: [],
        recentUsers: []
      };
      setDashboardData(mockStats);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/');
      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch {
      setServerStatus('offline');
    }
  };

  const handleRetrain = async () => {
    setIsTraining(true);
    try {
      const response = await fetch('http://localhost:8000/train', {
        method: 'POST',
      });
      if (response.ok) {
        alert('Model retrained successfully!');
      } else {
        alert('Failed to retrain model. Please check the server.');
      }
    } catch (error) {
      alert('Error connecting to server. Please ensure the backend is running.');
    } finally {
      setIsTraining(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload-data', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        setUploadStatus('success');
        setTimeout(() => setUploadStatus(null), 3000);
      } else {
        setUploadStatus('error');
        setTimeout(() => setUploadStatus(null), 3000);
      }
    } catch (error) {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-14 w-14 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg float">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, <span className="font-semibold text-blue-600">{user?.username}</span> 👋</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {serverStatus === 'online' ? (
                <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-200 shadow-sm">
                  <CheckCircle className="h-5 w-5 mr-2 animate-pulse" />
                  <span className="font-medium">System Online</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-200 shadow-sm">
                  <AlertCircle className="h-5 w-5 mr-2 animate-pulse" />
                  <span className="font-medium">System Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 mb-8">
          <nav className="flex space-x-2 p-2">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3, emoji: '📊' },
              { id: 'products', name: 'Products', icon: Package, emoji: '📦' },
              { id: 'users', name: 'Users', icon: Users, emoji: '👥' },
              { id: 'analytics', name: 'Analytics', icon: PieChart, emoji: '📈' },
              { id: 'system', name: 'System', icon: Settings, emoji: '⚙️' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-3 px-4 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 group ${
                    selectedTab === tab.id
                      ? 'bg-blue-500 text-white shadow-md transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="group-hover:scale-110 transition-transform">
                    {tab.emoji}
                  </span>
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && dashboardData && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-6 card-hover-subtle group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">Total Revenue</p>
                    <p className="text-3xl font-bold text-gradient">${dashboardData.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">12.5%</span>
                  <span className="text-gray-600 ml-1">from last month</span>
                </div>
                <div className="mt-2 progress-bar">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-6 card-hover-subtle group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">Total Orders</p>
                    <p className="text-3xl font-bold text-gradient">{dashboardData.totalOrders}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">8.2%</span>
                  <span className="text-gray-600 ml-1">from last month</span>
                </div>
                <div className="mt-2 progress-bar">
                  <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-6 card-hover-subtle group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">Total Users</p>
                    <p className="text-3xl font-bold text-gradient">{dashboardData.totalUsers}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Activity className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-blue-600 font-medium">{dashboardData.activeUsers} active</span>
                </div>
                <div className="mt-2 progress-bar">
                  <div className="progress-fill" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-6 card-hover-subtle group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">Products</p>
                    <p className="text-3xl font-bold text-gradient">{dashboardData.totalProducts}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-600">Across <span className="font-semibold text-orange-600">{categories.length}</span> categories</span>
                </div>
                <div className="mt-2 progress-bar">
                  <div className="progress-fill" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Categories */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
                <div className="space-y-4">
                  {dashboardData.topCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                        }`}></div>
                        <span className="text-gray-700">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${category.revenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{category.count} products</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Model Performance */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Model Accuracy</span>
                    <span className="font-bold text-green-600">98.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.3%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-600">Prediction Speed</span>
                    <span className="font-bold text-blue-600">45ms avg</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Training</span>
                    <span className="text-gray-900">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {selectedTab === 'products' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Products ({filteredProducts.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Base Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inventory
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sales (30d)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.slice(0, 20).map((product) => (
                      <tr key={product.product_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
                            <div className="text-sm text-gray-500">★ {product.rating} ({product.review_count} reviews)</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${product.base_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${product.target_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            product.inventory_level > 50 ? 'bg-green-100 text-green-800' :
                            product.inventory_level > 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.inventory_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.sales_last_30_days}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {selectedTab === 'system' && (
          <div className="space-y-6">
            {/* Server Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                System Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {serverStatus === 'online' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">AI Service</p>
                      <p className="text-sm text-gray-600">
                        {serverStatus === 'online' ? 'Running on http://localhost:8000' : 'Offline - Start with: cd backend && python run.py'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    serverStatus === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {serverStatus === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Model Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Management</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Retrain Model</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Retrain the pricing model with the latest data to improve accuracy.
                  </p>
                  <button
                    onClick={handleRetrain}
                    disabled={isTraining || serverStatus !== 'online'}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isTraining ? 'animate-spin' : ''}`} />
                    {isTraining ? 'Training...' : 'Retrain Model'}
                  </button>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Upload Training Data</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a CSV file with new product data to expand the training dataset.
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500 font-medium">Choose CSV file</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={serverStatus !== 'online'}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      CSV format: product_name, category, base_price, inventory_level, etc.
                    </p>
                  </div>

                  {uploadStatus && (
                    <div className={`mt-4 p-3 rounded-md ${
                      uploadStatus === 'success' ? 'bg-green-50 text-green-800' :
                      uploadStatus === 'error' ? 'bg-red-50 text-red-800' :
                      'bg-blue-50 text-blue-800'
                    }`}>
                      {uploadStatus === 'success' && 'File uploaded successfully!'}
                      {uploadStatus === 'error' && 'Upload failed. Please try again.'}
                      {uploadStatus === 'uploading' && 'Uploading file...'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Model Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-2">Model Type</h4>
                <p className="text-2xl font-bold text-blue-600">Random Forest</p>
                <p className="text-sm text-gray-500">100 estimators, max depth 10</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-2">Training Data</h4>
                <p className="text-2xl font-bold text-green-600">{products.length}+ Products</p>
                <p className="text-sm text-gray-500">Across {categories.length} categories</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                <p className="text-2xl font-bold text-purple-600">10 Variables</p>
                <p className="text-sm text-gray-500">Price, inventory, ratings, etc.</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600 mb-6">User management features would be implemented here</p>
            <div className="text-sm text-gray-500">
              <p>• View all registered users</p>
              <p>• Manage user roles and permissions</p>
              <p>• Monitor user activity</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-gray-600 mb-6">Detailed analytics and reporting features would be implemented here</p>
            <div className="text-sm text-gray-500">
              <p>• Sales performance charts</p>
              <p>• Revenue analytics</p>
              <p>• Customer behavior insights</p>
              <p>• AI model performance metrics</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;