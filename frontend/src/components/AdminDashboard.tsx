import React, { useState, useEffect } from 'react';
import { 
  Upload, RefreshCw, AlertCircle, CheckCircle, Users, Package, ShoppingCart, 
  TrendingUp, DollarSign, Eye, Edit, Trash2, Plus, BarChart3, PieChart, 
  Settings, Database, Activity, Calendar, Filter, Search, FileSpreadsheet,
  X, Info, Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, UploadResponse } from '../services/apiService';

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
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  const [isTraining, setIsTraining] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [uploadDetails, setUploadDetails] = useState<UploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'products' | 'users' | 'analytics' | 'system'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { user } = useAuth();

  // Required CSV columns as specified in the backend
  const requiredColumns = [
    'product_id', 'product_name', 'category', 'base_price', 'inventory_level',
    'competitor_avg_price', 'sales_last_30_days', 'rating', 'review_count',
    'season', 'brand_tier', 'material_cost', 'target_price'
  ];

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
      const response = await fetch(`${API_BASE_URL}/products`);
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
      const response = await fetch(`${API_BASE_URL}/`);
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
      const response = await fetch(`${API_BASE_URL}/train`, {
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
      setUploadMessage('');
      setUploadDetails(null);
      setUploadError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a CSV file first.');
      return;
    }

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setUploadMessage('Please select a valid CSV file.');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Uploading and validating CSV file...');
    setUploadDetails(null);
    setUploadError(null);

    try {
      const response = await apiService.uploadDataset(selectedFile);
      
      setUploadStatus('success');
      setUploadDetails(response);
      setUploadMessage(response.message);
      
      // Refresh products list after successful upload
      fetchProducts();
      
      // Clear file selection after successful upload
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      setUploadStatus('error');
      
      try {
        // Try to parse the error message as JSON for detailed feedback
        const errorData = JSON.parse(error.message);
        setUploadError(errorData);
        
        if (errorData.detail && typeof errorData.detail === 'object') {
          // Handle validation errors with missing columns
          if (errorData.detail.error === 'Missing required columns') {
            setUploadMessage(
              `Missing required columns: ${errorData.detail.missing_columns.join(', ')}`
            );
          } else if (errorData.detail.error === 'Data validation failed') {
            setUploadMessage(
              `Data validation failed: ${errorData.detail.validation_errors.join('; ')}`
            );
          } else {
            setUploadMessage(errorData.detail.error || 'Upload failed');
          }
        } else {
          setUploadMessage(errorData.detail || 'Upload failed. Please check your file format.');
        }
      } catch {
        // If error message is not JSON, show generic message
        setUploadMessage('Upload failed. Please check your file format and try again.');
      }
    }
  };

  const resetUploadState = () => {
    setUploadStatus('idle');
    setUploadMessage('');
    setUploadDetails(null);
    setUploadError(null);
    setSelectedFile(null);
    const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
                        {serverStatus === 'online' ? `Running on ${API_BASE_URL}` : 'Offline - Start the backend server'}
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
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Upload Training Data</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Upload a CSV file with new product data to expand the training dataset and automatically retrain the model.
                      </p>
                    </div>
                    {uploadStatus !== 'idle' && (
                      <button
                        onClick={resetUploadState}
                        className="text-gray-400 hover:text-gray-600"
                        title="Reset upload"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  {/* Required Columns Information */}
                  <div className="bg-blue-50 dark:bg-night-header p-4 rounded-lg mb-4">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 dark:text-night-accent mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-blue-900 dark:text-night-text-primary mb-2">Required CSV Columns (13 total):</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-blue-800 dark:text-night-text-secondary">
                          {requiredColumns.map((column, index) => (
                            <div key={column} className="flex items-center">
                              <span className="w-2 h-2 bg-blue-400 dark:bg-night-accent rounded-full mr-2"></span>
                              <code className="text-xs bg-white dark:bg-night-surface px-1 rounded">{column}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* File Selection */}
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                    uploadStatus === 'uploading' ? 'border-blue-300 bg-blue-50' :
                    uploadStatus === 'success' ? 'border-green-300 bg-green-50' :
                    uploadStatus === 'error' ? 'border-red-300 bg-red-50' :
                    'border-gray-300 hover:border-gray-400'
                  }`}>
                    {uploadStatus === 'uploading' ? (
                      <div className="flex flex-col items-center">
                        <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-2 animate-spin" />
                        <span className="text-blue-700 font-medium">Processing...</span>
                        <span className="text-blue-600 text-sm mt-1">{uploadMessage}</span>
                      </div>
                    ) : uploadStatus === 'success' ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <span className="text-green-700 font-medium">Upload Successful!</span>
                        <span className="text-green-600 text-sm mt-1">{uploadMessage}</span>
                      </div>
                    ) : uploadStatus === 'error' ? (
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <span className="text-red-700 font-medium">Upload Failed</span>
                        <span className="text-red-600 text-sm mt-1">{uploadMessage}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileSpreadsheet className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-500 font-medium">
                            {selectedFile ? selectedFile.name : 'Choose CSV file'}
                          </span>
                          <input
                            id="csv-file-input"
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={serverStatus !== 'online' || uploadStatus === 'uploading'}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          Must contain all {requiredColumns.length} required columns listed above
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  {selectedFile && uploadStatus !== 'uploading' && uploadStatus !== 'success' && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Selected: <span className="font-medium">{selectedFile.name}</span>
                        <span className="ml-2 text-gray-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        onClick={handleFileUpload}
                        disabled={serverStatus !== 'online'}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload & Retrain
                      </button>
                    </div>
                  )}

                  {/* Success Details */}
                  {uploadStatus === 'success' && uploadDetails && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-green-900">Upload Summary</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          uploadDetails.retraining_status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          Model {uploadDetails.retraining_status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-700 font-medium">New Records:</span>
                          <span className="ml-2 text-green-800">{uploadDetails.upload_stats.new_records}</span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">Total Records:</span>
                          <span className="ml-2 text-green-800">{uploadDetails.upload_stats.total_records}</span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">Existing Records:</span>
                          <span className="ml-2 text-green-800">{uploadDetails.upload_stats.existing_records}</span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">Duplicates Removed:</span>
                          <span className="ml-2 text-green-800">{uploadDetails.upload_stats.duplicates_removed}</span>
                        </div>
                      </div>
                      {uploadDetails.model_metrics && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <span className="text-green-700 font-medium text-sm">Model Performance:</span>
                          <span className="ml-2 text-green-800 text-sm">
                            R² Score: {(uploadDetails.model_metrics.r2_score * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Details */}
                  {uploadStatus === 'error' && uploadError && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-medium text-red-900 mb-3">Upload Error Details</h5>
                      {uploadError.detail && typeof uploadError.detail === 'object' && (
                        <div className="space-y-2 text-sm">
                          {uploadError.detail.missing_columns && (
                            <div>
                              <span className="text-red-700 font-medium">Missing Columns:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {uploadError.detail.missing_columns.map((col: string) => (
                                  <code key={col} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                    {col}
                                  </code>
                                ))}
                              </div>
                            </div>
                          )}
                          {uploadError.detail.validation_errors && (
                            <div>
                              <span className="text-red-700 font-medium">Validation Errors:</span>
                              <ul className="mt-1 list-disc list-inside text-red-800">
                                {uploadError.detail.validation_errors.map((error: string, index: number) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
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