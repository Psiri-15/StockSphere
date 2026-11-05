import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Boxes, Shield, Store, User, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = (user) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    if (user.role === 'Admin') navigate('/admin/dashboard');
    else if (user.role === 'Seller') navigate('/seller/dashboard');
    else navigate('/customer/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      redirectAfterLogin(loggedUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword, role, sellerStatus) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(demoEmail, demoPassword, role, sellerStatus);
      redirectAfterLogin(loggedUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-navy-900 rounded-2xl shadow-sm mb-4">
            <Boxes className="w-6 h-6 text-teal-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to StockSphere
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your unified inventory, sales, or customer console
          </p>
        </div>

        {/* 1-Click Quick Demo Login Card */}
        <div className="bg-royal-50/70 border border-royal-200/80 rounded-xl p-4 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-royal-900 uppercase tracking-wider">
              1-Click Demo Evaluation Profiles
            </span>
            <span className="text-[10px] font-semibold text-royal-700 bg-white px-2 py-0.5 rounded border border-royal-200">
              Zero Config
            </span>
          </div>
          <p className="text-[11px] text-royal-800/80 mb-3">
            Click any profile below to immediately log in and inspect that role's features:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* 1. Admin Console */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('lsiri4429@gmail.com', 'password123', 'Admin')}
              className="p-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg font-bold flex items-center space-x-2.5 transition-colors shadow-sm text-left group"
            >
              <img
                src="/avatars/lakshmisiri_admin.jpg"
                alt="Lakshmisiri Pachigalla"
                className="w-8 h-8 rounded-full object-cover border border-teal-400/50 shadow-xs flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="block text-[11px] font-bold text-white">Admin Console</span>
                  <span className="text-[9px] bg-teal-400/20 text-teal-300 font-semibold px-1 rounded">Admin</span>
                </div>
                <span className="text-[10px] text-slate-300 block truncate font-medium">Lakshmisiri Pachigalla</span>
                <span className="text-[9px] text-slate-400 block truncate font-mono">lsiri4429@gmail.com</span>
              </div>
            </button>

            {/* 2. Approved Seller */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('sowmyakatta1@gmail.com', 'password123', 'Seller', 'Approved')}
              className="p-2.5 bg-white hover:bg-royal-50 text-slate-900 border border-royal-200 rounded-lg font-bold flex items-center space-x-2.5 transition-colors shadow-sm text-left group"
            >
              <img
                src="/avatars/sowmya_approved.jpg"
                alt="Sowmya Katta"
                className="w-8 h-8 rounded-full object-cover border border-royal-400/60 shadow-xs flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="block text-[11px] font-bold text-slate-900">Approved Seller</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-1 rounded">Active</span>
                </div>
                <span className="text-[10px] text-slate-700 block truncate font-medium">Sowmya Katta</span>
                <span className="text-[9px] text-slate-500 block truncate font-mono">sowmyakatta1@gmail.com</span>
              </div>
            </button>

            {/* 3. Pending Seller */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('sowmyakatta1+pending@gmail.com', 'password123', 'Seller', 'Pending')}
              className="p-2.5 bg-white hover:bg-amber-50 text-slate-900 border border-amber-200 rounded-lg font-bold flex items-center space-x-2.5 transition-colors shadow-sm text-left group"
            >
              <img
                src="/avatars/sowmya_pending.jpg"
                alt="Sowmya Katta"
                className="w-8 h-8 rounded-full object-cover border border-amber-400/60 shadow-xs flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="block text-[11px] font-bold text-slate-900">Pending Seller</span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-200 font-semibold px-1 rounded">Review</span>
                </div>
                <span className="text-[10px] text-slate-700 block truncate font-medium">Sowmya Katta</span>
                <span className="text-[9px] text-slate-500 block truncate font-mono">sowmyakatta1@gmail.com</span>
              </div>
            </button>

            {/* 4. Customer Demo */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('lsiri4429+customer@gmail.com', 'password123', 'Customer')}
              className="p-2.5 bg-white hover:bg-teal-50 text-slate-900 border border-teal-200 rounded-lg font-bold flex items-center space-x-2.5 transition-colors shadow-sm text-left group"
            >
              <img
                src="/avatars/lakshmisiri_customer.jpg"
                alt="Lakshmisiri Pachigalla"
                className="w-8 h-8 rounded-full object-cover border border-teal-400/60 shadow-xs flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="block text-[11px] font-bold text-slate-900">Customer Demo</span>
                  <span className="text-[9px] bg-teal-50 text-teal-700 border border-teal-200 font-semibold px-1 rounded">Customer</span>
                </div>
                <span className="text-[10px] text-slate-700 block truncate font-medium">Lakshmisiri Pachigalla</span>
                <span className="text-[9px] text-slate-500 block truncate font-mono">lsiri4429@gmail.com</span>
              </div>
            </button>
          </div>
        </div>

        {/* Main Login Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-royal-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-royal-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-navy-900 hover:bg-royal-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>Don't have an account?</span>
            <div className="space-x-2">
              <Link to="/register" className="font-semibold text-royal-600 hover:underline">
                Customer Sign Up
              </Link>
              <span>&bull;</span>
              <Link to="/seller/register" className="font-semibold text-teal-600 hover:underline">
                Seller Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
