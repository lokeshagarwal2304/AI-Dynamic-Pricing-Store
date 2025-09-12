import React, { useState, useEffect } from 'react';
import { 
  Activity, Target, TrendingUp, AlertTriangle, CheckCircle, 
  RefreshCw, BarChart3, Brain, Database, Zap 
} from 'lucide-react';
import { apiService, ModelMetrics } from '../services/apiService';

export const ModelPerformance: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const isOnline = await apiService.checkServerStatus();
      setServerOnline(isOnline);
      
      if (isOnline) {
        const metricsData = await apiService.getModelMetrics();
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const getPerformanceLevel = (r2Score: number) => {
    if (r2Score >= 0.9) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (r2Score >= 0.8) return { level: 'Very Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (r2Score >= 0.7) return { level: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (r2Score >= 0.6) return { level: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { level: 'Poor', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const getAccuracyPercentage = (r2Score: number) => {
    return Math.max(0, Math.min(100, r2Score * 100));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading model performance data...</p>
        </div>
      </div>
    );
  }

  if (!serverOnline) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Model Performance</h2>
          <p className="text-gray-600">Real-time AI model evaluation and metrics</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Backend Server Required</h3>
          <p className="text-red-700 mb-4">
            The AI model performance data is not available because the backend server is not running.
          </p>
          <div className="bg-red-100 rounded-lg p-4 text-left">
            <p className="text-sm text-red-800 font-medium mb-2">To start the backend server:</p>
            <code className="text-sm bg-red-200 px-2 py-1 rounded">cd backend && python run.py</code>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Model Data Available</h3>
        <p className="text-gray-500">Unable to load model performance metrics</p>
      </div>
    );
  }

  const performance = getPerformanceLevel(metrics.r2_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Model Performance</h2>
          <p className="text-gray-600">Real-time AI model evaluation and metrics</p>
        </div>
        <button
          onClick={loadMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Overall Performance Card */}
      <div className={`${performance.bgColor} border rounded-lg p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Model Performance</h3>
            <p className={`text-3xl font-bold ${performance.color}`}>{performance.level}</p>
            <p className="text-sm text-gray-600 mt-1">
              Model accuracy: {getAccuracyPercentage(metrics.r2_score).toFixed(1)}%
            </p>
          </div>
          <div className="text-right">
            <Brain className={`w-16 h-16 ${performance.color}`} />
            <p className="text-sm text-gray-600 mt-2">{metrics.model_type}</p>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">R² Score</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.r2_score.toFixed(4)}</p>
            </div>
            <Target className="w-8 h-8 text-blue-600" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getAccuracyPercentage(metrics.r2_score)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Explains {getAccuracyPercentage(metrics.r2_score).toFixed(1)}% of price variations
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">RMSE</p>
              <p className="text-2xl font-bold text-green-600">${metrics.rmse.toFixed(2)}</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(10, 100 - (metrics.rmse * 5))}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Average prediction error
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">MSE</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.mse.toFixed(2)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(10, 100 - (metrics.mse / 2))}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Mean squared error
          </p>
        </div>
      </div>

      {/* Training Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Training Information</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Model Type</span>
              <span className="text-gray-900">{metrics.model_type}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Training Samples</span>
              <span className="text-gray-900">{metrics.training_samples.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-700">Model Status</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Model Accuracy</p>
                <p className="text-sm text-blue-700">
                  R² score of {metrics.r2_score.toFixed(3)} indicates {performance.level.toLowerCase()} predictive performance
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Prediction Error</p>
                <p className="text-sm text-green-700">
                  RMSE of ${metrics.rmse.toFixed(2)} means predictions are typically within this range
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-purple-900">Model Complexity</p>
                <p className="text-sm text-purple-700">
                  {metrics.model_type} trained on {metrics.training_samples} samples for robust predictions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Feature Importance Analysis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(metrics.feature_importance)
            .sort(([,a], [,b]) => b - a)
            .map(([feature, importance]) => (
              <div key={feature} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {feature.replace('_', ' ').replace(' encoded', '')}
                  </span>
                  <span className="text-sm text-gray-600">
                    {(importance * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(importance * 100)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Feature Importance</strong> shows which factors most influence price predictions. 
            Higher percentages indicate features that have more impact on the model's pricing decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance;