import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Layers,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const SellerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const res = await api.get('/seller/analytics');
        if (res.data.success) {
          setData(res.data.analytics);
        }
      } catch (err) {
        console.error('Failed to load seller analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading seller analytics & sales metrics..." />;
  }

  const {
    totalSales = 0,
    totalOrders = 0,
    totalProducts = 0,
    availableStock = 0,
    lowStockCount = 0,
    bestSelling = [],
    dailySales = [],
    monthlySales = [],
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-royal-900 text-white p-6 sm:p-8 rounded-2xl border border-navy-800 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-teal-400 text-xs font-bold uppercase tracking-wider">
            Seller Central &bull; {user?.sellerDetails?.storeName || 'My Store'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            Store Performance Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time sales velocity, available inventory health, and automated low-stock triggers.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/seller/products/new"
            className="px-4 py-2.5 bg-royal-600 hover:bg-royal-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center space-x-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Low Stock Warning Banner if items need restocking */}
      {lowStockCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center justify-between shadow-subtle animate-pulse">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">
                Attention: {lowStockCount} product(s) reached or fell below low-stock threshold!
              </p>
              <p className="text-amber-700 mt-0.5">
                Restock now to prevent checkout lockouts and avoid out-of-stock cart rejections.
              </p>
            </div>
          </div>
          <Link
            to="/seller/inventory"
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center space-x-1"
          >
            <span>Audit Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Gross Sales"
          value={`₹${totalSales.toLocaleString('en-IN')}`}
          icon={DollarSign}
          color="teal"
          subtitle="Total verified sales"
        />
        <StatCard
          title="Orders Received"
          value={totalOrders}
          icon={ShoppingBag}
          color="blue"
          subtitle="Orders with your products"
        />
        <StatCard
          title="Active Catalog"
          value={totalProducts}
          icon={Package}
          color="purple"
          subtitle="Live product listings"
        />
        <StatCard
          title="Available Units"
          value={availableStock}
          icon={Layers}
          color="blue"
          subtitle="Total stock across SKUs"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          icon={AlertTriangle}
          color={lowStockCount > 0 ? 'rose' : 'teal'}
          subtitle="Products near threshold"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Monthly Revenue Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Verified sales over the last 6 months</p>
            </div>
            <TrendingUp className="w-4 h-4 text-royal-600" />
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySales}>
                <defs>
                  <linearGradient id="sellerSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Sales']}
                  contentStyle={{ backgroundColor: '#0B192C', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={2.5} fill="url(#sellerSalesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Velocity Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Daily Sales Velocity (Last 7 Days)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time daily fulfillment revenue</p>
            </div>
            <BarChart className="w-4 h-4 text-teal-600" />
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Sales']}
                  contentStyle={{ backgroundColor: '#0B192C', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="sales" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Best-Selling Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Top Performing Products</h3>
            <p className="text-xs text-slate-500 mt-0.5">Highest volume products sold through your store</p>
          </div>
          <Link
            to="/seller/products"
            className="text-xs font-bold text-royal-600 hover:text-royal-800 flex items-center space-x-1"
          >
            <span>Manage Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bestSelling.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No sales recorded yet. Once customers purchase your items, performance metrics will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Product Name</th>
                  <th className="py-3 px-5">SKU</th>
                  <th className="py-3 px-5">Units Sold</th>
                  <th className="py-3 px-5 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {bestSelling.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{prod.name}</td>
                    <td className="py-3.5 px-5 font-mono text-royal-700 font-bold">{prod.sku}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-800">{prod.unitsSold} units</td>
                    <td className="py-3.5 px-5 font-extrabold text-slate-900 text-right">
                      ₹{prod.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
