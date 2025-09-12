import React, { useState, useEffect } from 'react';
import { 
  Upload, RefreshCw, BarChart3, TrendingUp, AlertCircle, 
  CheckCircle, Database, Brain, Target, Activity 
} from 'lucide-react';
import { apiService, ModelMetrics } from '../services/apiService';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

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

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      const response = await apiService.retrainModel();
      setMetrics(response.metrics);
      setUploadMessage('Model retrained successfully!');
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (error) {
      console.error('Error retraining model:', error);
      setUploadMessage('Error retraining model');
      setTimeout(() => setUploadMessage(''), 3000);
    } finally {
      setRetraining(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await apiService.uploadData(file);
      setMetrics(response.metrics);
      setUploadMessage(`${response.message} - ${response.filename}`);
      setTimeout(() => setUploadMessage(''), 5000);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadMessage('Error uploading file');
      setTimeout(() => setUploadMessage(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const getMetricColor = (value: number, type: 'r2' | 'rmse' | 'mse') => {
    switch (type) {
      case 'r2':
        return value >= 0.8 ? 'text-green-600' : value >= 0.6 ? 'text-yellow-600' : 'text-red-600';
      case 'rmse':
        return value <= 5 ? 'text-green-600' : value <= 10 ? 'text-yellow-600' : 'text-red-600';
      case 'mse':
        return value <= 25 ? 'text-green-600' : value <= 100 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMetricStatus = (value: number, type: 'r2' | 'rmse' | 'mse') => {
    switch (type) {
      case 'r2':
        return value >= 0.8 ? 'Excellent' : value >= 0.6 ? 'Good' : 'Needs Improvement';
      case 'rmse':
        return value <= 5 ? 'Excellent' : value <= 10 ? 'Good' : 'Needs Improvement';
      case 'mse':
        return value <= 25 ? 'Excellent' : value <= 100 ? 'Good' : 'Needs Improvement';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading model metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600">Monitor and manage your AI pricing model</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleRetrain}
            disabled={retraining || !serverOnline}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Brain className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
            {retraining ? 'Retraining...' : 'Retrain Model'}
          </button>
        </div>
      </div>

      {!serverOnline && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Backend Server Offline</h3>
              <p className="text-sm text-red-700 mt-1">
                Please start the Python backend server to access model metrics and admin features.
              </p>
            </div>
          </div>
        </div>
      )}

      {uploadMessage && (
        <div className={`p-4 rounded-lg ${
          uploadMessage.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          <div className="flex items-center gap-2">
            {uploadMessage.includes('Error') ? 
              <AlertCircle className="w-5 h-5" /> : 
              <CheckCircle className="w-5 h-5" />
            }
            <span>{uploadMessage}</span>
          </div>
        </div>
      )}

      {/* Model Performance Metrics */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">R² Score</p>
                  <p className={`text-2xl font-bold ${getMetricColor(metrics.r2_score, 'r2')}`}>
                    {metrics.r2_score.toFixed(3)}
                  </p>
                </div>
                <Target className={`w-8 h-8 ${getMetricColor(metrics.r2_score, 'r2')}`} />
              </div>
              <p className="text-sm text-gray-500 mt-2">{getMetricStatus(metrics.r2_score, 'r2')}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">RMSE</p>
                  <p className={`text-2xl font-bold ${getMetricColor(metrics.rmse, 'rmse')}`}>
                    {metrics.rmse.toFixed(2)}
                  </p>
                </div>
                <Activity className={`w-8 h-8 ${getMetricColor(metrics.rmse, 'rmse')}`} />
              </div>
              <p className="text-sm text-gray-500 mt-2">{getMetricStatus(metrics.rmse, 'rmse')}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">MSE</p>
                  <p className={`text-2xl font-bold ${getMetricColor(metrics.mse, 'mse')}`}>
                    {metrics.mse.toFixed(2)}
                  </p>
                </div>
                <BarChart3 className={`w-8 h-8 ${getMetricColor(metrics.mse, 'mse')}`} />
              </div>
              <p className="text-sm text-gray-500 mt-2">{getMetricStatus(metrics.mse, 'mse')}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Training Samples</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.training_samples.toLocaleString()}
                  </p>
                </div>
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500 mt-2">{metrics.model_type}</p>
            </div>
          </div>

          {/* Feature Importance */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Importance</h3>
            <div className="space-y-3">
              {Object.entries(metrics.feature_importance)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([feature, importance]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {feature.replace('_', ' ').replace(' encoded', '')}
                    </span>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(importance * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {(importance * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {/* Data Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Training Data</h3>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Upload a CSV file with product data to retrain the model
                </p>
                <p className="text-xs text-gray-500">
                  Required columns: product_name, category, base_price, inventory_level, competitor_avg_price, 
                  sales_last_30_days, rating, review_count, season, brand_tier, material_cost, target_price
                </p>
              </div>
              <div className="mt-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={uploading || !serverOnline}
                    className="hidden"
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {uploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Choose File
                      </>
                    )}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Performance Metrics Explained</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>R² Score:</strong> Measures how well the model explains price variations (0-1, higher is better)</p>
              <p><strong>RMSE:</strong> Root Mean Square Error - average prediction error in dollars (lower is better)</p>
              <p><strong>MSE:</strong> Mean Square Error - squared average of prediction errors (lower is better)</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Model Status</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {serverOnline ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm">
                  {serverOnline ? 'Model is online and ready' : 'Model is offline'}
                </span>
              </div>
              {metrics && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">
                    Trained on {metrics.training_samples} samples using {metrics.model_type}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;