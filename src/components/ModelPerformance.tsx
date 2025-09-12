import React, { useState, useEffect } from 'react';
import { 
  Activity, Target, TrendingUp, AlertTriangle, CheckCircle, 
  RefreshCw, Calendar, BarChart3, Brain, Database 
} from 'lucide-react';

interface ModelMetrics {
  accuracy: number;
  rmse: number;
  mae: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTraining: string;
  predictions: number;
  successRate: number;
}

interface BacktestResult {
  period: string;
  actualRevenue: number;
  predictedRevenue: number;
  accuracy: number;
}

export const ModelPerformance: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics>({
    accuracy: 0.87,
    rmse: 2.34,
    mae: 1.89,
    precision: 0.82,
    recall: 0.79,
    f1Score: 0.80,
    lastTraining: '2024-01-15 08:30:00',
    predictions: 15420,
    successRate: 0.84
  });

  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([
    { period: 'Week 1', actualRevenue: 45230, predictedRevenue: 43890, accuracy: 0.85 },
    { period: 'Week 2', actualRevenue: 52100, predictedRevenue: 51200, accuracy: 0.89 },
    { period: 'Week 3', actualRevenue: 48750, predictedRevenue: 47900, accuracy: 0.87 },
    { period: 'Week 4', actualRevenue: 55600, predictedRevenue: 54100, accuracy: 0.88 }
  ]);

  const [isRetraining, setIsRetraining] = useState(false);

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        accuracy: Math.min(0.95, prev.accuracy + 0.02),
        rmse: Math.max(1.5, prev.rmse - 0.1),
        mae: Math.max(1.2, prev.mae - 0.08),
        lastTraining: new Date().toISOString().slice(0, 19).replace('T', ' '),
        predictions: prev.predictions + Math.floor(Math.random() * 100)
      }));
      setIsRetraining(false);
    }, 3000);
  };

  const getStatusColor = (value: number, threshold: number) => {
    return value >= threshold ? 'text-green-600' : value >= threshold - 0.1 ? 'text-yellow-600' : 'text-red-600';
  };

  const getStatusIcon = (value: number, threshold: number) => {
    return value >= threshold ? CheckCircle : value >= threshold - 0.1 ? AlertTriangle : AlertTriangle;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Model Performance</h2>
          <p className="text-gray-600">Monitor and evaluate AI model effectiveness</p>
        </div>
        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
          {isRetraining ? 'Retraining...' : 'Retrain Model'}
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Model Accuracy</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.accuracy, 0.85)}`}>
                {(metrics.accuracy * 100).toFixed(1)}%
              </p>
            </div>
            {React.createElement(getStatusIcon(metrics.accuracy, 0.85), { 
              className: `w-8 h-8 ${getStatusColor(metrics.accuracy, 0.85)}` 
            })}
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${metrics.accuracy * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">RMSE</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.rmse}</p>
            </div>
            <Target className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Root Mean Square Error</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">F1 Score</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.f1Score, 0.75)}`}>
                {metrics.f1Score.toFixed(2)}
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Precision: {metrics.precision.toFixed(2)}</span>
            <span>Recall: {metrics.recall.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.successRate, 0.80)}`}>
                {(metrics.successRate * 100).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-500 mt-2">{metrics.predictions.toLocaleString()} predictions</p>
        </div>
      </div>

      {/* Detailed Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backtest Results */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Backtest Results</h3>
          </div>
          <div className="space-y-4">
            {backtestResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{result.period}</p>
                  <p className="text-sm text-gray-600">
                    Actual: ${result.actualRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Predicted: ${result.predictedRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getStatusColor(result.accuracy, 0.85)}`}>
                    {(result.accuracy * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Accuracy</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Health Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Model Health</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Data Quality</span>
              </div>
              <span className="text-green-600 font-bold">Excellent</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Model Drift</span>
              </div>
              <span className="text-green-600 font-bold">Stable</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Last Training</span>
              </div>
              <span className="text-blue-600 font-bold">
                {new Date(metrics.lastTraining).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-900">Next Training</span>
              </div>
              <span className="text-yellow-600 font-bold">In 2 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trends Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Performance trend visualization</p>
            <p className="text-sm text-gray-400">Chart integration available with charting library</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance