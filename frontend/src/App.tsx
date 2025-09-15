import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
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
import Chatbot from './components/Chatbot';
import ChatbotToggle from './components/ChatbotToggle';

// Placeholder components for now
const Wishlist = () => (
  <div className="p-8 bg-white dark:bg-brand-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-brand-dark-border text-gray-900 dark:text-brand-dark-text-primary transition-colors duration-300">
    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-brand-dark-text-primary">Wishlist</h2>
    <p className="text-gray-600 dark:text-gray-400">Your wishlist feature is coming soon!</p>
    <div className="mt-4">
      <a href="#" className="text-blue-600 dark:text-brand-dark-accent hover:underline font-medium transition-colors">Explore Products →</a>
    </div>
  </div>
);

const Orders = () => (
  <div className="p-8 bg-white dark:bg-brand-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-brand-dark-border text-gray-900 dark:text-brand-dark-text-primary transition-colors duration-300">
    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-brand-dark-text-primary">Orders</h2>
    <p className="text-gray-600 dark:text-gray-400">Your order history feature is coming soon!</p>
    <div className="mt-4 space-x-4">
      <a href="#" className="text-blue-600 dark:text-brand-dark-accent hover:underline font-medium transition-colors">View Sample Order →</a>
      <a href="#" className="text-blue-600 dark:text-brand-dark-accent hover:underline font-medium transition-colors">Track Package →</a>
    </div>
  </div>
);

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-brand-dark-bg text-gray-900 dark:text-brand-dark-text-primary transition-colors duration-300">
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
                      <Route path="/dashboard" element={
                        <AdminProtectedRoute>
                          <AdminDashboard />
                        </AdminProtectedRoute>
                      } />
                      <Route path="/performance" element={
                        <AdminProtectedRoute>
                          <ModelPerformance />
                        </AdminProtectedRoute>
                      } />
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
                          <AdminProtectedRoute>
                            <AdminDashboard />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/performance"
                        element={
                          <AdminProtectedRoute>
                            <ModelPerformance />
                          </AdminProtectedRoute>
                        }
                      />
                    </Routes>
                  </main>
                </ProtectedRoute>
              }
            />
          </Routes>
          
          {/* Floating Chatbot - Available on all authenticated pages */}
          <ChatbotToggle 
            isOpen={isChatbotOpen} 
            onClick={toggleChatbot}
          />
          <Chatbot 
            isOpen={isChatbotOpen} 
            onToggle={toggleChatbot}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
