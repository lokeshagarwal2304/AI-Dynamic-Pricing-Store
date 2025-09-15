import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCartIcon,
  HeartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  ShoppingCartIcon as ShoppingCartSolid,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ThemeToggle';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: 'Products', href: '/', current: isActive('/') || isActive('/products'), icon: '📦' },
    ...(isAdmin ? [
      { name: 'Dashboard', href: '/dashboard', current: isActive('/dashboard'), icon: '📊' },
      { name: 'Performance', href: '/performance', current: isActive('/performance'), icon: '📈' },
    ] : []),
  ];

  const userNavigation = user ? [
    { name: 'Profile', href: '/profile' },
    { name: 'Orders', href: '/orders' },
    { name: 'Wishlist', href: '/wishlist' },
    ...(isAdmin ? [{ name: 'Admin Dashboard', href: '/admin/dashboard' }] : []),
  ] : [];

  return (

    <header className="bg-white/95 dark:bg-brand-dark-surface/95 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-brand-dark-border sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/products" className="flex-shrink-0 flex items-center group">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <SparklesIcon className="h-7 w-7 text-white animate-pulse" />
              </div>
              <div className="ml-3 hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-brand-dark-text-primary group-hover:text-blue-600 dark:group-hover:text-brand-dark-accent transition-colors">AI Store</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 group-hover:text-blue-500 dark:group-hover:text-brand-dark-accent transition-colors">Dynamic Pricing</p>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-brand-dark-border rounded-xl leading-5 bg-gray-50 dark:bg-brand-dark-bg dark:text-brand-dark-text-primary placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-dark-accent focus:border-blue-500 dark:focus:border-brand-dark-accent focus:bg-white dark:focus:bg-brand-dark-bg transition-all duration-200 shadow-sm focus:shadow-md"
                placeholder="Search products, categories, brands..."
              />
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  item.current
                    ? 'bg-blue-50 dark:bg-brand-dark-bg text-blue-600 dark:text-brand-dark-accent border-blue-200 dark:border-brand-dark-border'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-brand-dark-bg hover:text-gray-900 dark:hover:text-brand-dark-text-primary border-transparent'
                } inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 group`}
              >
                <span className="mr-2 group-hover:scale-110 transition-transform">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side - Cart, Wishlist, User Menu */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 relative group"
                >
                  <HeartIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                </Link>

                {/* Shopping Cart */}
                <Link
                  to="/cart"
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-brand-dark-accent hover:bg-blue-50 dark:hover:bg-brand-dark-accent/20 rounded-lg transition-all duration-200 relative group"
                >
                  <ShoppingCartIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">2</span>
                </Link>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-sm rounded-xl p-2 hover:bg-gray-50 dark:hover:bg-brand-dark-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-brand-dark-accent transition-all duration-200 group"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white shadow-lg group-hover:scale-105 transition-transform">
                      {user.profile_picture ? (
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={user.profile_picture}
                          alt=""
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <span className="hidden md:ml-2 md:block text-gray-700 dark:text-brand-dark-text-primary font-medium group-hover:text-gray-900 dark:group-hover:text-brand-dark-text-primary transition-colors">
                      {user.full_name}
                    </span>
                    <ChevronDownIcon className={`hidden md:ml-1 md:block h-4 w-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white dark:bg-brand-dark-surface ring-1 ring-black ring-opacity-5 border border-gray-100 dark:border-brand-dark-border backdrop-blur-sm transition-colors duration-300">
                      <div className="py-2">
                        <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
                          <p className="font-semibold text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        {userNavigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <span className="mr-3 group-hover:scale-110 transition-transform">
                              {item.name === 'Profile' ? '👤' : 
                               item.name === 'Orders' ? '📦' : 
                               item.name === 'Wishlist' ? '❤️' : 
                               item.name === 'Admin Dashboard' ? '⚙️' : '📄'}
                            </span>
                            {item.name}
                          </Link>
                        ))}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors group rounded-b-xl"
                        >
                          <span className="mr-3 group-hover:scale-110 transition-transform">🚪</span>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Auth buttons for non-logged in users */
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Search bar - Mobile */}
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search products..."
                />
              </div>

              {/* Navigation links */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* User menu items for mobile */}
              {user && (
                <>
                  <div className="pt-4 pb-3 border-t border-gray-200">
                    <div className="flex items-center px-4">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        {user.profile_picture ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.profile_picture}
                            alt=""
                          />
                        ) : (
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">
                          {user.full_name}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;