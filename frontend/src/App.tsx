import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProductListing from './components/ProductListing';
import Cart from './components/Cart';
import CartView from './components/CartView';
import Checkout from './components/Checkout';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import ModelPerformance from './components/ModelPerformance';
import AIInsights from './components/AIInsights';
import Deals from './components/Deals';
import Categories from './components/Categories';

// Placeholder components for now
const Wishlist = () => (
  <div className="p-8 bg-white dark:bg-night-surface rounded-lg shadow-sm border border-gray-200 dark:border-night-surface text-gray-900 dark:text-night-text-primary transition-colors duration-300">
    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-night-text-primary">Wishlist</h2>
    <p className="text-gray-600 dark:text-night-text-secondary">Your wishlist feature is coming soon!</p>
    <div className="mt-4">
      <a href="#" className="text-blue-600 dark:text-night-accent hover:underline font-medium">Explore Products →</a>
    </div>
  </div>
);

const Orders = () => (
  <div className="p-8 bg-white dark:bg-night-surface rounded-lg shadow-sm border border-gray-200 dark:border-night-surface text-gray-900 dark:text-night-text-primary transition-colors duration-300">
    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-night-text-primary">Orders</h2>
    <p className="text-gray-600 dark:text-night-text-secondary">Your order history feature is coming soon!</p>
    <div className="mt-4 space-x-4">
      <a href="#" className="text-blue-600 dark:text-night-accent hover:underline font-medium">View Sample Order →</a>
      <a href="#" className="text-blue-600 dark:text-night-accent hover:underline font-medium">Track Package →</a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-night-bg text-gray-900 dark:text-night-text-primary transition-colors duration-300">
          <Routes>
            {/* Authentication routes (no header) */}
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              }
            />

            {/* Main app routes (with header) */}
            <Route
              path="/*"
              element={
                <ProtectedRoute requireAuth={true}>
                  <Header />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-transparent">
                    <Routes>
                      <Route path="/" element={<ProductListing />} />
                      <Route path="/products" element={<ProductListing />} />
                      <Route path="/dashboard" element={<AdminDashboard />} />
                      <Route path="/performance" element={<ModelPerformance />} />
                      <Route path="/cart" element={<CartView />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/deals" element={<Deals />} />
                      <Route path="/ai-insights" element={<AIInsights />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/orders" element={<Orders />} />
                      
                      {/* Admin routes */}
                      <Route
                        path="/admin/dashboard"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/performance"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <ModelPerformance />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </main>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
