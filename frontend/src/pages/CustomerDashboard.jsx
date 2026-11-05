import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  CreditCard,
  Heart,
  PackageCheck,
  ArrowRight,
  Clock,
  Download,
  Eye,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/customer/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load customer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading customer overview..." />;
  }

  const { totalOrders = 0, totalSpent = 0, activeOrders = 0, recentOrders = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-navy-900 to-royal-900 text-white p-6 sm:p-8 rounded-2xl border border-navy-800 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-teal-400 text-xs font-bold uppercase tracking-wider">
            Customer Dashboard
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Track current shipments, review your purchase history, and download official tax invoices.
          </p>
        </div>
        <Link
          to="/products"
          className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-navy-900 font-bold text-xs rounded-xl shadow transition-colors flex items-center space-x-1.5"
        >
          <span>Shop Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          color="blue"
          subtitle="Lifetime orders placed"
        />
        <StatCard
          title="Active Shipments"
          value={activeOrders}
          icon={Clock}
          color="amber"
          subtitle="Orders in fulfillment pipeline"
        />
        <StatCard
          title="Total Expenditure"
          value={`₹${totalSpent.toLocaleString('en-IN')}`}
          icon={CreditCard}
          color="teal"
          subtitle="Verified payments"
        />
        <StatCard
          title="Saved Items"
          value={wishlistCount}
          icon={Heart}
          color="rose"
          subtitle="Items in wishlist"
        />
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Purchase History</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your latest orders and fulfillment statuses</p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-bold text-royal-600 hover:text-royal-800 flex items-center space-x-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            You haven't placed any orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Order ID</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Items</th>
                  <th className="py-3 px-5">Total</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold font-mono text-royal-700">
                      #{ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="truncate max-w-xs">
                        {ord.items.map((i) => i.name).join(', ')}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-extrabold text-slate-900">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={ord.orderStatus} />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <Link
                        to={`/orders/${ord._id}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-royal-50 hover:text-royal-600 text-slate-700 text-[11px] font-semibold transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Track</span>
                      </Link>
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

export default CustomerDashboard;
