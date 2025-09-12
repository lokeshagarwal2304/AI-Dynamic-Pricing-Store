import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Package, Users, 
  ShoppingCart, AlertTriangle, Activity, BarChart3, 
  Calendar, RefreshCw, Eye, Settings 
} from 'lucide-react';

interface DashboardMetrics {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  averageOrderValue: number;
  aovChange: number;
  conversionRate: number;
  conversionChange: number;
  totalProducts: number;
  lowStockProducts: number;
  priceAdjustments: number;
  averagePriceChange: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface ProductPerformance {
  id: number;
  name: string;
  category: string;
  originalPrice: number;
  currentPrice: number;
  priceChange: number;
  salesVolume: number;
  revenue: number;
  profitMargin: number;
  lastAdjustment: string;
}

interface CompetitorData {
  productId: number;
  productName: string;
  ourPrice: number;
  competitors: {
    name: string;
    price: number;
    difference: number;
  }[];
}

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    averageOrderValue: 0,
    aovChange: 0,
    conversionRate: 0,
    conversionChange: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    priceAdjustments: 0,
    averagePriceChange: 0
  });

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [competitorData, setCompetitorData] = useState<CompetitorData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = () => {
      // Simulate API call
      setTimeout(() => {
        setMetrics({
          totalRevenue: 125430.50,
          revenueChange: 12.5,
          totalOrders: 1247,
          ordersChange: 8.3,
          averageOrderValue: 100.58,
          aovChange: 3.7,
          conversionRate: 3.2,
          conversionChange: -0.5,
          totalProducts: 156,
          lowStockProducts: 12,
          priceAdjustments: 89,
          averagePriceChange: 2.3
        });

        setRevenueData([
          { date: '2024-01-08', revenue: 15420, orders: 145 },
          { date: '2024-01-09', revenue: 18230, orders: 167 },
          { date: '2024-01-10', revenue: 16890, orders: 156 },
          { date: '2024-01-11', revenue: 19450, orders: 189 },
          { date: '2024-01-12', revenue: 21340, orders: 203 },
          { date: '2024-01-13', revenue: 17680, orders: 178 },
          { date: '2024-01-14', revenue: 16420, orders: 162 }
        ]);

        setProductPerformance([
          {
            id: 1,
            name: "Premium Cotton T-Shirt",
            category: "Shirts",
            originalPrice: 29.99,
            currentPrice: 27.99,
            priceChange: -6.7,
            salesVolume: 145,
            revenue: 4058.55,
            profitMargin: 45.2,
            lastAdjustment: "2024-01-14 09:30:00"
          },
          {
            id: 2,
            name: "Slim Fit Jeans",
            category: "Pants",
            originalPrice: 79.99,
            currentPrice: 84.99,
            priceChange: 6.3,
            salesVolume: 89,
            revenue: 7564.11,
            profitMargin: 52.8,
            lastAdjustment: "2024-01-14 11:15:00"
          },
          {
            id: 3,
            name: "Leather Jacket",
            category: "Jackets",
            originalPrice: 199.99,
            currentPrice: 219.99,
            priceChange: 10.0,
            salesVolume: 23,
            revenue: 5059.77,
            profitMargin: 38.5,
            lastAdjustment: "2024-01-14 14:22:00"
          }
        ]);

        setCompetitorData([
          {
            productId: 1,
            productName: "Premium Cotton T-Shirt",
            ourPrice: 27.99,
            competitors: [
              { name: "Competitor A", price: 29.99, difference: 7.1 },
              { name: "Competitor B", price: 25.99, difference: -7.1 },
              { name: "Competitor C", price: 31.99, difference: 14.3 }
            ]
          },
          {
            productId: 2,
            productName: "Slim Fit Jeans",
            ourPrice: 84.99,
            competitors: [
              { name: "Competitor A", price: 89.99, difference: 5.9 },
              { name: "Competitor B", price: 79.99, difference: -5.9 },
              { name: "Competitor C", price: 92.99, difference: 9.4 }
            ]
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchDashboardData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + Math.random() * 100,
        totalOrders: prev.totalOrders + Math.floor(Math.random() * 3),
        priceAdjustments: prev.priceAdjustments + Math.floor(Math.random() * 2)
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getChangeColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600">Monitor your dynamic pricing performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 flex items-center">
            {React.createElement(getChangeIcon(metrics.revenueChange), { 
              className: `w-4 h-4 ${getChangeColor(metrics.revenueChange)}` 
            })}
            <span className={`ml-1 text-sm font-medium ${getChangeColor(metrics.revenueChange)}`}>
              {formatPercentage(metrics.revenueChange)}
            </span>
            <span className="ml-1 text-sm text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders.toLocaleString()}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center">
            {React.createElement(getChangeIcon(metrics.ordersChange), { 
              className: `w-4 h-4 ${getChangeColor(metrics.ordersChange)}` 
            })}
            <span className={`ml-1 text-sm font-medium ${getChangeColor(metrics.ordersChange)}`}>
              {formatPercentage(metrics.ordersChange)}
            </span>
            <span className="ml-1 text-sm text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.averageOrderValue)}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2 flex items-center">
            {React.createElement(getChangeIcon(metrics.aovChange), { 
              className: `w-4 h-4 ${getChangeColor(metrics.aovChange)}` 
            })}
            <span className={`ml-1 text-sm font-medium ${getChangeColor(metrics.aovChange)}`}>
              {formatPercentage(metrics.aovChange)}
            </span>
            <span className="ml-1 text-sm text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Price Adjustments</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.priceAdjustments}</p>
            </div>
            <Settings className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-sm text-gray-500">
              Avg change: {formatPercentage(metrics.averagePriceChange)}
            </span>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue trend visualization</p>
              <p className="text-sm text-gray-400">Chart integration available</p>
            </div>
          </div>
        </div>

        {/* Product Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-3">
            {productPerformance.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(product.currentPrice)} 
                    <span className={`ml-2 ${getChangeColor(product.priceChange)}`}>
                      ({formatPercentage(product.priceChange)})
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                  <p className="text-sm text-gray-600">{product.salesVolume} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Competitor Price Analysis</h3>
          <Eye className="w-5 h-5 text-purple-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Our Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Competitor A</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Competitor B</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Competitor C</th>
              </tr>
            </thead>
            <tbody>
              {competitorData.map((item) => (
                <tr key={item.productId} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{item.productName}</td>
                  <td className="py-3 px-4 font-bold text-blue-600">{formatCurrency(item.ourPrice)}</td>
                  {item.competitors.map((competitor, index) => (
                    <td key={index} className="py-3 px-4">
                      <div>
                        <span className="font-medium">{formatCurrency(competitor.price)}</span>
                        <span className={`ml-2 text-sm ${getChangeColor(competitor.difference)}`}>
                          ({formatPercentage(competitor.difference)})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-900">Low Stock Alert</p>
                <p className="text-sm text-gray-600">{metrics.lowStockProducts} products are running low on inventory</p>
              </div>
            </div>
            <button className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">
              View Details
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Price Optimization Success</p>
                <p className="text-sm text-gray-600">Recent price adjustments increased revenue by 12.5%</p>
              </div>
            </div>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm">
              View Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard