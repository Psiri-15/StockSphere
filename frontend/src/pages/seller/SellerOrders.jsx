import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, Truck, Check, Edit2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';

export const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/seller/my-orders');
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
  }, []);

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setTrackingNumber(order.trackingNumber || '');
    setComment('');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put(`/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        trackingNumber,
        comment,
      });
      if (res.data.success) {
        setStatusModalOpen(false);
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving orders..." />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders Received</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fulfill incoming customer orders, manage shipments, and update status timelines
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState
              icon={ShoppingBag}
              title="No incoming orders yet"
              description="Orders placed by customers for your store's products will appear here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Order ID</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Your Items</th>
                  <th className="py-3 px-5">Seller Payout</th>
                  <th className="py-3 px-5">Payment</th>
                  <th className="py-3 px-5">Fulfillment Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-royal-700">
                      #{ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-900 block">{ord.customer?.name}</span>
                      <span className="text-[10px] text-slate-400">{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="max-w-xs truncate">
                        {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-extrabold text-slate-900">
                      ₹{ord.sellerSubtotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={ord.paymentStatus} />
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={ord.orderStatus} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(ord)}
                        className="px-3 py-1.5 bg-navy-900 hover:bg-royal-600 text-white font-bold text-[11px] rounded-lg shadow-sm transition-colors"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Order Status Modal */}
      {statusModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-elevated border border-slate-200">
            <div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-royal-700 px-2 py-0.5 rounded">
                Order #{selectedOrder.orderNumber}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                Update Fulfillment Status
              </h3>
              <p className="text-xs text-slate-500">
                Customer: {selectedOrder.customer?.name} ({selectedOrder.customer?.email})
              </p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Order Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing (Packed)</option>
                  <option value="Shipped">Shipped (In Transit)</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Courier Tracking Number / AWB
                </label>
                <input
                  type="text"
                  placeholder="e.g. BLUEDART-8891238"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Note / Audit Comment
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Package dispatched via express air freight..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 text-xs font-bold bg-navy-900 hover:bg-royal-600 text-white rounded-lg shadow-sm transition-colors"
                >
                  {updating ? 'Updating...' : 'Save & Broadcast Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
