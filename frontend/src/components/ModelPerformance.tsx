import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react';

interface ModelMetrics {
  r2_score: number;
  rmse: number;
  mse: number;
  feature_importance: { [key: string]: number };
}

const ModelPerformance: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8000/metrics');
      if (!response.ok) {
        throw new Error('Backend server is not running');
      }
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError('Unable to connect to AI service. Please ensure the backend server is running.');
      // Mock data for demo purposes
      setMetrics({
        r2_score: 0.87,
        rmse: 2.34,
        mse: 5.48,
        feature_importance: {
          'base_price': 0.35,
          'inventory_level': 0.18,
          'competitor_avg_price': 0.15,
          'sales_last_30_days': 0.12,
          'rating': 0.08,
          'material_cost': 0.07,
          'review_count': 0.05
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load model metrics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Model Performance</h2>
        <p className="text-gray-600">
          Comprehensive metrics showing how well the AI pricing model is performing.
        </p>
        {error && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="h-8 w-8 text-blue-600" />
            <span className={`text-sm font-medium ${getPerformanceColor(metrics.r2_score)}`}>
              {getPerformanceLabel(metrics.r2_score)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">R² Score</h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {(metrics.r2_score * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            Explains {(metrics.r2_score * 100).toFixed(1)}% of price variations
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <span className="text-sm font-medium text-green-600">Low Error</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">RMSE</h3>
          <p className="text-3xl font-bold text-green-600 mb-2">
            ${metrics.rmse.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            Average prediction error
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <Zap className="h-8 w-8 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Optimized</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">MSE</h3>
          <p className="text-3xl font-bold text-purple-600 mb-2">
            {metrics.mse.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            Mean squared error
          </p>
        </div>
      </div>

      {/* Feature Importance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <BarChart3 className="h-6 w-6 text-gray-700 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Feature Importance</h3>
        </div>
        
        <div className="space-y-4">
          {Object.entries(metrics.feature_importance)
            .sort(([,a], [,b]) => b - a)
            .map(([feature, importance]) => (
              <div key={feature} className="flex items-center">
                <div className="w-32 text-sm text-gray-600 capitalize">
                  {feature.replace(/_/g, ' ')}
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${importance * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-900 text-right">
                  {(importance * 100).toFixed(1)}%
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Model Strengths</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• High R² score indicates strong predictive power</li>
              <li>• Low RMSE shows accurate price predictions</li>
              <li>• Base price is the most important feature</li>
              <li>• Inventory levels significantly impact pricing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Monitor competitor pricing more frequently</li>
              <li>• Consider seasonal demand patterns</li>
              <li>• Collect more customer behavior data</li>
              <li>• Regular model retraining recommended</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance;