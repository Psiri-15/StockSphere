import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  ShoppingCart,
  Heart,
  Search,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  Sliders,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationDropdown from './NotificationDropdown';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isSeller, isCustomer } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isSeller) return '/seller/dashboard';
    return '/customer/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro bar for university capstone & demo note */}
      <div className="bg-navy-900 text-slate-300 text-[11px] py-1 px-4 text-center font-medium flex items-center justify-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        <span>StockSphere Capstone System &bull; Multi-Vendor Inventory & Real-Time E-Commerce</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-navy-900 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Boxes className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-navy-900 tracking-tight">Stock<span className="text-royal-600">Sphere</span></span>
              <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400 -mt-1">Smart Inventory</span>
            </div>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search products, brands, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-royal-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <Link to="/" className="hover:text-royal-600 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-royal-600 transition-colors">Products</Link>
            <Link to="/about" className="hover:text-royal-600 transition-colors">Architecture</Link>
            <Link to="/contact" className="hover:text-royal-600 transition-colors">Support</Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2">
            {/* Real-time Notifications */}
            <NotificationDropdown />

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-full transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-full transition-colors"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="hidden sm:block text-left text-xs">
                    <p className="font-bold text-slate-900 leading-tight">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-royal-600 font-semibold">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elevated border border-slate-200 py-1 z-50 animate-fade-in text-xs font-medium text-slate-700">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 hover:bg-slate-50 hover:text-royal-600 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span>{user.role} Dashboard</span>
                    </Link>

                    {isCustomer && (
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 hover:bg-slate-50 hover:text-royal-600 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </Link>
                    )}

                    {isSeller && (
                      <Link
                        to="/seller/inventory"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 hover:bg-slate-50 hover:text-royal-600 transition-colors"
                      >
                        <Sliders className="w-4 h-4 text-slate-400" />
                        <span>Inventory Audit</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-royal-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-navy-900 hover:bg-royal-600 text-white rounded-lg shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-navy-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 animate-fade-in space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-200"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>
            <div className="flex flex-col space-y-2 text-xs font-semibold text-slate-700 pt-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-1">Home</Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="py-1">Products</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-1">About</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-1">Contact</Link>
              <Link to="/seller/register" onClick={() => setMobileMenuOpen(false)} className="py-1 text-teal-600">Sell on StockSphere</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
