import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const STATUS_COLORS = {
  Pending: '#F59E0B',
  Confirmed: '#3B82F6',
  Processing: '#6366F1',
  Shipped: '#A855F7',
  Delivered: '#10B981',
  Cancelled: '#EF4444',
};

export const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setData(res.data.analytics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling platform-wide analytics charts..." />;
  }

  const {
    totalRevenue = 0,
    totalOrders = 0,
    totalCustomers = 0,
    totalSellers = 0,
    totalProducts = 0,
    orderStatusDistribution = [],
    monthlyRevenue = [],
  } = data || {};

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Telemetry & Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          In-depth financial volume, order funnel progression, and market expansion metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Gross Platform Volume"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          icon={DollarSign}
          color="teal"
        />
        <StatCard
          title="Total Orders Processed"
          value={totalOrders}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Verified Buyers"
          value={totalCustomers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Onboarded Merchants"
          value={totalSellers}
          icon={Store}
          color="purple"
        />
        <StatCard
          title="Catalog SKUs"
          value={totalProducts}
          icon={Layers}
          color="teal"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Gross Monthly Volume</h3>
              <p className="text-xs text-slate-500 mt-0.5">Rolling 6-month transaction trajectory</p>
            </div>
            <TrendingUp className="w-4 h-4 text-royal-600" />
          </div>

          <div className="h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="areaSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Gross Revenue']}
                  contentStyle={{ backgroundColor: '#0B192C', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#areaSalesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Funnel Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Order Funnel Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Order stage categorization</p>
            </div>
            <PieIcon className="w-4 h-4 text-royal-600" />
          </div>

          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {orderStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#64748B'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [val, `${name} Orders`]}
                  contentStyle={{ backgroundColor: '#0B192C', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend
                  formatter={(value) => <span className="text-[11px] font-semibold text-slate-700">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
