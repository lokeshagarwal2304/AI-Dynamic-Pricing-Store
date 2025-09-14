import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  BarChart3, 
  PieChart, 
  Clock,
  DollarSign,
  Package,
  Users,
  Activity,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface PricingInsight {
  product_name: string;
  current_price: number;
  suggested_price: number;
  confidence: number;
  reason: string;
  potential_revenue_impact: number;
}

interface MarketTrend {
  category: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  description: string;
}

interface AIInsightsData {
  pricing_insights: PricingInsight[];
  market_trends: MarketTrend[];
  performance_metrics: {
    total_optimizations: number;
    revenue_increase: number;
    accuracy_rate: number;
    response_time: number;
  };
  recommendations: string[];
}

const AIInsights: React.FC = () => {
  const [data, setData] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'insights' | 'trends' | 'recommendations'>('insights');

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const fetchAIInsights = async () => {
    try {
      // Mock data for now - in real app, this would come from your AI service
      const mockData: AIInsightsData = {
        pricing_insights: [
          {
            product_name: "Wireless Bluetooth Headphones",
            current_price: 89.99,
            suggested_price: 94.99,
            confidence: 0.92,
            reason: "High demand, low inventory, competitor pricing analysis",
            potential_revenue_impact: 1250.50
          },
          {
            product_name: "Smart Home Security Camera",
            current_price: 149.99,
            suggested_price: 139.99,
            confidence: 0.87,
            reason: "Market saturation, seasonal decline, inventory surplus",
            potential_revenue_impact: -890.25
          },
          {
            product_name: "Fitness Tracker Pro",
            current_price: 199.99,
            suggested_price: 219.99,
            confidence: 0.95,
            reason: "Premium features, brand loyalty, limited availability",
            potential_revenue_impact: 2100.75
          }
        ],
        market_trends: [
          {
            category: "Electronics",
            trend: "up",
            percentage: 12.5,
            description: "Strong holiday season demand driving prices up"
          },
          {
            category: "Home & Garden",
            trend: "down",
            percentage: -8.2,
            description: "End of season clearance affecting pricing"
          },
          {
            category: "Sports & Fitness",
            trend: "up",
            percentage: 15.8,
            description: "New Year fitness resolutions boosting demand"
          },
          {
            category: "Clothing",
            trend: "stable",
            percentage: 2.1,
            description: "Steady demand with minimal price fluctuation"
          }
        ],
        performance_metrics: {
          total_optimizations: 1247,
          revenue_increase: 18.7,
          accuracy_rate: 94.3,
          response_time: 45
        },
        recommendations: [
          "Increase inventory for high-demand electronics before holiday peak",
          "Consider dynamic pricing for seasonal items in Home & Garden category",
          "Implement surge pricing for fitness products during January-March",
          "Monitor competitor pricing more frequently for premium products",
          "Adjust pricing algorithms to account for brand loyalty metrics"
        ]
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Analyzing market data with AI...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Unable to load AI insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
                <p className="text-gray-600 mt-1">Intelligent pricing recommendations powered by machine learning</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium text-sm">AI Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Optimizations</p>
                <p className="text-3xl font-bold text-gray-900">{data.performance_metrics.total_optimizations.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+23%</span>
              <span className="text-gray-600 ml-1">this month</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Increase</p>
                <p className="text-3xl font-bold text-gray-900">{data.performance_metrics.revenue_increase}%</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+5.2%</span>
              <span className="text-gray-600 ml-1">vs last quarter</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                <p className="text-3xl font-bold text-gray-900">{data.performance_metrics.accuracy_rate}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">Excellent</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-3xl font-bold text-gray-900">{data.performance_metrics.response_time}ms</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Activity className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-blue-600 font-medium">Real-time</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 bg-white/80 backdrop-blur-md rounded-t-xl">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'insights', name: 'Pricing Insights', icon: Target },
                { id: 'trends', name: 'Market Trends', icon: BarChart3 },
                { id: 'recommendations', name: 'Recommendations', icon: Lightbulb }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-md rounded-b-xl shadow-sm border border-gray-100 border-t-0">
          {selectedTab === 'insights' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">AI-Powered Pricing Insights</h3>
              <div className="space-y-4">
                {data.pricing_insights.map((insight, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">{insight.product_name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{insight.reason}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500">Current: </span>
                            <span className="ml-1 font-semibold text-gray-900">${insight.current_price}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500">Suggested: </span>
                            <span className="ml-1 font-semibold text-blue-600">${insight.suggested_price}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center mb-2">
                          <span className="text-sm text-gray-500">Confidence:</span>
                          <span className="ml-2 font-semibold text-green-600">{(insight.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500">Impact:</span>
                          <span className={`ml-2 font-semibold ${insight.potential_revenue_impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {insight.potential_revenue_impact > 0 ? '+' : ''}${insight.potential_revenue_impact.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'trends' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Market Trends Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.market_trends.map((trend, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getTrendColor(trend.trend)} hover:shadow-md transition-all duration-200`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{trend.category}</h4>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trend.trend)}
                        <span className="font-semibold">
                          {trend.percentage > 0 ? '+' : ''}{trend.percentage}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{trend.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'recommendations' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Recommendations</h3>
              <div className="space-y-4">
                {data.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition-all duration-200">
                    <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
