import React, { useState } from 'react';
import { Upload, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  React.useEffect(() => {
    checkServerStatus();
  }, []);

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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">
          Manage your AI pricing model, upload new data, and monitor system performance.
        </p>
      </div>

      {/* Server Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="flex items-center space-x-3">
          {serverStatus === 'online' ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-700">AI Service Online</span>
            </>
          ) : serverStatus === 'offline' ? (
            <>
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">AI Service Offline</span>
              <span className="text-sm text-gray-500 ml-2">
                (Start backend server: cd backend && python run.py)
              </span>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              <span className="text-gray-600">Checking status...</span>
            </>
          )}
        </div>
      </div>

      {/* Model Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Management</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Retrain Model</h4>
            <p className="text-sm text-gray-600 mb-4">
              Retrain the pricing model with the latest data to improve accuracy.
            </p>
            <button
              onClick={handleRetrain}
              disabled={isTraining || serverStatus !== 'online'}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isTraining ? 'animate-spin' : ''}`} />
              {isTraining ? 'Training...' : 'Retrain Model'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Upload */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Upload Training Data</h4>
          <p className="text-sm text-gray-600 mb-4">
            Upload a CSV file with new product data to expand the training dataset.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <label className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500">Choose CSV file</span>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-medium text-gray-900 mb-2">Model Type</h4>
          <p className="text-2xl font-bold text-blue-600">Random Forest</p>
          <p className="text-sm text-gray-500">100 estimators, max depth 10</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-medium text-gray-900 mb-2">Training Data</h4>
          <p className="text-2xl font-bold text-green-600">65+ Products</p>
          <p className="text-sm text-gray-500">Across multiple categories</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-medium text-gray-900 mb-2">Features</h4>
          <p className="text-2xl font-bold text-purple-600">10 Variables</p>
          <p className="text-sm text-gray-500">Price, inventory, ratings, etc.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;