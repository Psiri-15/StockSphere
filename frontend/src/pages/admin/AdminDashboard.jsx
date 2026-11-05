import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  Package,
  CheckSquare,
  TrendingUp,
  PieChart as PieIcon,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const STATUS_COLORS = {
  Pending: '#F59E0B',
  Confirmed: '#3B82F6',
  Processing: '#6366F1',
  Shipped: '#A855F7',
  Delivered: '#10B981',
  Cancelled: '#EF4444',
};

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setData(res.data.analytics);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Retrieving platform-wide telemetry & analytics..." />;
  }

  const {
    totalRevenue = 0,
    totalOrders = 0,
    totalCustomers = 0,
    totalSellers = 0,
    pendingSellers = 0,
    totalProducts = 0,
    orderStatusDistribution = [],
    monthlyRevenue = [],
    recentTransactions = [],
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 sm:p-8 rounded-2xl border border-navy-800 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-teal-400 text-xs font-bold uppercase tracking-wider">
            Super Administrator Console
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            Platform Operations & Intelligence
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Platform revenue audit, multi-seller registration approvals, catalog supervision, and ledger transactions.
          </p>
        </div>

        {pendingSellers > 0 && (
          <Link
            to="/admin/approvals"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-900 font-extrabold text-xs rounded-xl shadow transition-colors flex items-center space-x-1.5 animate-pulse"
          >
            <CheckSquare className="w-4 h-4" />
            <span>{pendingSellers} Seller Application(s) Pending</span>
          </Link>
        )}
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Gross Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          icon={DollarSign}
          color="teal"
          subtitle="Processed volume"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          color="blue"
          subtitle="All platform orders"
        />
        <StatCard
          title="Buyers Registered"
          value={totalCustomers}
          icon={Users}
          color="blue"
          subtitle="Customer accounts"
        />
        <StatCard
          title="Active Sellers"
          value={totalSellers}
          icon={Store}
          color="purple"
          subtitle="Onboarded merchants"
        />
        <StatCard
          title="Pending Sellers"
          value={pendingSellers}
          icon={CheckSquare}
          color={pendingSellers > 0 ? 'amber' : 'teal'}
          subtitle="Awaiting review"
        />
        <StatCard
          title="Published SKUs"
          value={totalProducts}
          icon={Package}
          color="blue"
          subtitle="Marketplace products"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Platform Revenue */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Platform Revenue Trajectory</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly gross transaction volume (INR)</p>
            </div>
            <TrendingUp className="w-4 h-4 text-royal-600" />
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B192C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0B192C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0B192C', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0B192C" strokeWidth={2.5} fill="url(#adminRevenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Order Status Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across pipeline</p>
            </div>
            <PieIcon className="w-4 h-4 text-royal-600" />
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
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

      {/* Recent Ledger Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Financial Ledger Transactions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Auditable seller credits, fee deductions, and refunds</p>
          </div>
          <Link
            to="/admin/transactions"
            className="text-xs font-bold text-royal-600 hover:text-royal-800 flex items-center space-x-1"
          >
            <span>View Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Beneficiary / Merchant</th>
                  <th className="py-3 px-5">Transaction Type</th>
                  <th className="py-3 px-5">Gross Amount</th>
                  <th className="py-3 px-5">Platform Fee (5%)</th>
                  <th className="py-3 px-5 text-right">Net Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-900 block">
                        {tx.user?.sellerDetails?.storeName || tx.user?.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{tx.user?.email}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-800">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">
                      ₹{tx.platformFee.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5 font-extrabold text-slate-900 text-right">
                      ₹{tx.netAmount.toLocaleString('en-IN')}
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

export default AdminDashboard;
