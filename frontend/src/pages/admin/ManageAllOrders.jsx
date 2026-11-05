import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, Download, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const ManageAllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders?status=${statusFilter}&search=${search}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleDownloadInvoice = async (orderId, orderNumber) => {
    try {
      const res = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `StockSphere-Invoice-${orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download invoice');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving platform orders ledger..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Orders Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor orders across all buyers and sellers ({orders.length} orders listed)
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 shadow-sm"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Order ID</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Items Summary</th>
                <th className="py-3 px-5">Grand Total</th>
                <th className="py-3 px-5">Payment</th>
                <th className="py-3 px-5">Order Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-royal-700">
                    #{ord.orderNumber}
                  </td>
                  <td className="py-3.5 px-5 text-slate-500">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-slate-800 block">{ord.customer?.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{ord.customer?.email}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-slate-600 block truncate max-w-xs">
                      {ord.items.map((i) => i.name).join(', ')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {ord.items.reduce((s, i) => s + i.quantity, 0)} unit(s)
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-extrabold text-slate-900">
                    ₹{ord.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-5">
                    <StatusBadge status={ord.paymentStatus} />
                  </td>
                  <td className="py-3.5 px-5">
                    <StatusBadge status={ord.orderStatus} />
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-2">
                    <button
                      onClick={() => handleDownloadInvoice(ord._id, ord.orderNumber)}
                      className="p-1.5 text-slate-500 hover:text-royal-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Download PDF Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/orders/${ord._id}`}
                      className="p-1.5 text-slate-500 hover:text-royal-600 hover:bg-slate-100 rounded-lg transition-colors inline-block"
                      title="Inspect Tracking"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageAllOrders;
