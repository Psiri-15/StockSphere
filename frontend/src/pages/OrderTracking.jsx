import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Truck,
  Package,
  Download,
  AlertCircle,
  ArrowLeft,
  XCircle,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

const STEPS = [
  { status: 'Pending', label: 'Order Placed' },
  { status: 'Confirmed', label: 'Payment Confirmed' },
  { status: 'Processing', label: 'Packed & Dispatched' },
  { status: 'Shipped', label: 'In Transit' },
  { status: 'Delivered', label: 'Delivered' },
];

export const OrderTracking = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isConfirmedJustNow = searchParams.get('confirmed') === 'true';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { socket } = useSocket();

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Join order real-time socket room
  useEffect(() => {
    if (socket && id) {
      socket.emit('join_room', `order_${id}`);
      socket.on('order_status_updated', (data) => {
        if (data.orderId === id) {
          fetchOrder();
        }
      });
      return () => {
        socket.emit('leave_room', `order_${id}`);
      };
    }
  }, [socket, id]);

  const handleDownloadInvoice = async () => {
    try {
      const res = await api.get(`/orders/${id}/invoice`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `StockSphere-Invoice-${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download invoice PDF.');
    }
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await api.put(`/orders/${id}/cancel`, {
        reason: cancelReason || 'Cancelled by customer',
      });
      if (res.data.success) {
        setCancelModalOpen(false);
        fetchOrder();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving live order tracking..." />;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <Link to="/orders" className="mt-4 inline-block text-xs font-semibold text-royal-600 hover:underline">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';
  const canCancel = ['Pending', 'Confirmed'].includes(order.orderStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Just confirmed celebration alert */}
      {isConfirmedJustNow && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Payment Confirmed & Inventory Allocated!</p>
              <p className="text-emerald-700 mt-0.5">
                Stock quantities have been atomically deducted. A tax invoice has been generated for your order.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadInvoice}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Invoice</span>
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <Link
            to="/orders"
            className="text-xs font-semibold text-slate-500 hover:text-royal-600 flex items-center space-x-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              #{order.orderNumber}
            </h1>
            <StatusBadge status={order.orderStatus} />
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Placed on {new Date(order.createdAt).toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadInvoice}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-royal-600" />
            <span>PDF Tax Invoice</span>
          </button>

          {canCancel && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Visual Tracking Stepper */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
          Live Fulfillment Timeline
        </h3>

        {isCancelled ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold">This Order has been Cancelled</p>
              <p className="text-rose-700 mt-0.5">
                Reason: {order.cancellationReason || 'User requested cancellation'}. Allocated stock was automatically restored to inventory.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative py-4">
            {/* Desktop Stepper */}
            <div className="hidden sm:flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-teal-500 -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%`,
                }}
              />

              {STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.status} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                        isPassed
                          ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                          : 'bg-white text-slate-400 border-2 border-slate-300'
                      }`}
                    >
                      {isPassed ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold ${
                        isCurrent ? 'text-teal-700 font-extrabold' : isPassed ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="sm:hidden space-y-4">
              {STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                return (
                  <div key={step.status} className="flex items-center space-x-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isPassed ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span className={`text-xs ${isPassed ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Status Timeline Log */}
        {order.statusTimeline && order.statusTimeline.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-700">Audit Status Updates</h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              {order.statusTimeline.map((tl, i) => (
                <div key={i} className="flex items-baseline space-x-2">
                  <span className="font-mono text-[10px] text-slate-400">
                    {new Date(tl.updatedAt).toLocaleTimeString()}
                  </span>
                  <span className="font-semibold text-slate-800">{tl.status}:</span>
                  <span className="text-slate-600">{tl.comment}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Order Items & Delivery Address */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items Purchased Snapshot */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
            Items in this Shipment ({order.items.reduce((s, i) => s + i.quantity, 0)})
          </h3>

          <div className="divide-y divide-slate-100 space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl border border-slate-100 flex-shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                      {item.sku}
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">{item.name}</p>
                    <p className="text-slate-400 text-[11px]">Unit Price: ₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-slate-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                  <p className="text-slate-400 text-[11px]">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5% GST)</span>
              <span className="font-bold text-slate-800">₹{order.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-bold text-slate-800">
                {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-navy-900 pt-2 border-t border-slate-100">
              <span>Total Paid</span>
              <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-royal-600" />
              <span>Delivery Address</span>
            </h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-2">
                Contact: {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
              Payment Method
            </h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">{order.paymentMethod} Payment</p>
              <p className="text-slate-500">Status: <StatusBadge status={order.paymentStatus} /></p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-elevated border border-slate-200">
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Confirm Order Cancellation</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel order #{order.orderNumber}? Once cancelled, your payment will be refunded and inventory units will be atomically released back to the marketplace.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation
              </label>
              <textarea
                rows={2}
                placeholder="Changed my mind / Ordered by mistake..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
