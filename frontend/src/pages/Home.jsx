import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  PackageCheck,
  Cpu,
  Layers,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=8'),
        ]);

        if (catRes.data.success) setCategories(catRes.data.categories);
        if (prodRes.data.success) setFeaturedProducts(prodRes.data.products);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-royal-900/80 border border-royal-700/60 text-teal-300 text-xs font-semibold mb-6 shadow-inner">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Smart Real-Time Inventory & E-Commerce System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
            Next-Gen Inventory Control & <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-400 via-teal-300 to-cyan-400">Multi-Vendor</span> Marketplace
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Eliminate overselling through atomic stock deductions, real-time WebSocket synchronization, unique SKU auditing, and automated PDF invoicing.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/products"
              className="px-6 py-3.5 bg-royal-600 hover:bg-royal-500 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-royal-500/25 transition-all flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="px-6 py-3.5 bg-navy-800/80 hover:bg-navy-700 text-slate-200 border border-navy-700 hover:border-slate-500 font-bold text-sm rounded-xl transition-all"
            >
              Demo Portals & Logins
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl text-left">
            <div className="p-4 bg-navy-800/50 backdrop-blur-sm rounded-xl border border-navy-700/60">
              <span className="text-teal-400 text-xl font-bold font-mono">0.0%</span>
              <p className="text-xs text-slate-300 font-semibold mt-1">Overselling Rate</p>
              <p className="text-[10px] text-slate-400">Atomic Mongo locks</p>
            </div>
            <div className="p-4 bg-navy-800/50 backdrop-blur-sm rounded-xl border border-navy-700/60">
              <span className="text-royal-400 text-xl font-bold font-mono">&lt; 50ms</span>
              <p className="text-xs text-slate-300 font-semibold mt-1">Stock Sync Latency</p>
              <p className="text-[10px] text-slate-400">Socket.IO real-time</p>
            </div>
            <div className="p-4 bg-navy-800/50 backdrop-blur-sm rounded-xl border border-navy-700/60">
              <span className="text-amber-400 text-xl font-bold font-mono">100%</span>
              <p className="text-xs text-slate-300 font-semibold mt-1">Audit Trail</p>
              <p className="text-[10px] text-slate-400">Stock movement logs</p>
            </div>
            <div className="p-4 bg-navy-800/50 backdrop-blur-sm rounded-xl border border-navy-700/60">
              <span className="text-cyan-400 text-xl font-bold font-mono">3 Roles</span>
              <p className="text-xs text-slate-300 font-semibold mt-1">RBAC Isolation</p>
              <p className="text-[10px] text-slate-400">Admin, Seller, Customer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-royal-600 uppercase tracking-wider">Curated Collections</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Shop by Category</h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-royal-600 hover:text-royal-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="group bg-white rounded-xl border border-slate-200 p-4 shadow-subtle hover:shadow-elevated transition-all flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-slate-100 border border-slate-200 group-hover:scale-105 transition-transform">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-slate-800 text-xs group-hover:text-royal-600 transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Live Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Verified Inventory</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Trending Tech & Gear</h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-royal-600 hover:text-royal-800 flex items-center space-x-1"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching real-time stock catalog..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Core Architectural Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-900 via-royal-900 to-navy-900 rounded-2xl text-white p-8 md:p-12 border border-navy-800 shadow-elevated">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Engineered For Reliability
            </span>
            <h2 className="text-3xl font-extrabold mt-2 tracking-tight">
              Why StockSphere Outperforms Traditional E-Commerce
            </h2>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              Standard retail websites experience cart collision and overselling during peak sales. StockSphere enforces safe database locks at checkout and broadcasts instant updates to all connected browser sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-navy-800/80 p-5 rounded-xl border border-navy-700/60">
              <Cpu className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="font-bold text-sm text-white">Atomic Concurrency</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                MongoDB conditional operator <code className="text-teal-300 font-mono font-bold">$gte</code> prevents stock from ever descending below zero even under simultaneous rapid checkouts.
              </p>
            </div>

            <div className="bg-navy-800/80 p-5 rounded-xl border border-navy-700/60">
              <Zap className="w-6 h-6 text-royal-400 mb-3" />
              <h4 className="font-bold text-sm text-white">Instant Event Mesh</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Socket.IO event emitters immediately push low-stock alerts to sellers and live inventory updates to browsing customers without page refresh.
              </p>
            </div>

            <div className="bg-navy-800/80 p-5 rounded-xl border border-navy-700/60">
              <PackageCheck className="w-6 h-6 text-amber-400 mb-3" />
              <h4 className="font-bold text-sm text-white">Audit Movement Ledger</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Every unit deduction, restocking, damage write-off, or return is immutably logged with timestamp, user ID, and reference order number.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
