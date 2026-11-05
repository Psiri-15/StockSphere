import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  MapPin,
  CheckCircle,
  AlertCircle,
  Truck,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Checkout = () => {
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Demo'); // Default to Demo for frictionless capstone demo!
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // New Address state
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Gurugram',
    state: 'Haryana',
    postalCode: '122003',
    country: 'India',
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/addresses');
        if (res.data.success && res.data.addresses.length > 0) {
          setAddresses(res.data.addresses);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error(err);
        setShowNewAddressForm(true);
      }
    };
    fetchAddresses();
  }, []);

  if (cartLoading) {
    return <LoadingSpinner text="Preparing checkout session..." />;
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <Link to="/products" className="mt-4 inline-block text-xs font-semibold text-royal-600 hover:underline">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const handleCreateNewAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddress);
      if (res.data.success) {
        setAddresses([res.data.address, ...addresses]);
        setSelectedAddressIndex(0);
        setShowNewAddressForm(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);

    try {
      const shippingAddress = showNewAddressForm
        ? newAddress
        : addresses[selectedAddressIndex];

      if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1) {
        setError('Please provide a complete shipping address.');
        setLoading(false);
        return;
      }

      // 1. Create order on backend
      const orderRes = await api.post('/orders', {
        shippingAddress,
        paymentMethod,
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Could not create order');
      }

      const createdOrder = orderRes.data.order;

      // 2. Process payment
      if (paymentMethod === 'Demo') {
        // Frictionless demonstration payment
        const payRes = await api.post('/payments/demo-pay', {
          orderId: createdOrder._id,
        });

        if (payRes.data.success) {
          await refreshCart();
          navigate(`/orders/${createdOrder._id}?confirmed=true`);
        }
      } else {
        // Razorpay flow
        const payOrderRes = await api.post('/payments/create-order', {
          orderId: createdOrder._id,
        });

        const data = payOrderRes.data;

        if (data.isDemo) {
          // Fallback if Razorpay API keys aren't set
          const payRes = await api.post('/payments/demo-pay', {
            orderId: createdOrder._id,
          });
          await refreshCart();
          navigate(`/orders/${createdOrder._id}?confirmed=true`);
          return;
        }

        // Open Razorpay Popup
        const options = {
          key: data.keyId,
          amount: data.amount * 100,
          currency: 'INR',
          name: 'StockSphere Systems',
          description: `Order #${data.orderNumber}`,
          order_id: data.razorpayOrderId,
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/payments/verify', {
                orderId: createdOrder._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                await refreshCart();
                navigate(`/orders/${createdOrder._id}?confirmed=true`);
              }
            } catch (err) {
              setError('Payment verification failed on server.');
            }
          },
          prefill: {
            name: data.customer.name,
            email: data.customer.email,
            contact: data.customer.phone,
          },
          theme: {
            color: '#0B192C',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async (resp) => {
          await api.post('/payments/fail', {
            orderId: createdOrder._id,
            reason: resp.error?.description || 'Payment rejected',
          });
          setError(`Payment Failed: ${resp.error?.description || 'Declined'}`);
        });
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Secure Checkout</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Step 2 of 2: Shipping Destination & Payment Verification
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-royal-600" />
                <span>1. Shipping Destination</span>
              </span>
              <button
                type="button"
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="text-xs font-semibold text-royal-600 hover:text-royal-800 flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{showNewAddressForm ? 'Use Saved Address' : 'Add New Address'}</span>
              </button>
            </div>

            {!showNewAddressForm && addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr, idx) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddressIndex === idx
                        ? 'border-royal-600 bg-royal-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{addr.fullName}</span>
                      {selectedAddressIndex === idx && (
                        <CheckCircle className="w-4 h-4 text-royal-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-xs text-slate-500">{addr.addressLine2}</p>}
                    <p className="text-xs text-slate-600">
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 font-mono">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleCreateNewAddress} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="House/Flat No., Building, Street"
                    value={newAddress.addressLine1}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Payment Method Selector Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-2 pb-3 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-royal-600" />
              <span>2. Payment Verification Method</span>
            </span>

            <div className="space-y-3">
              {/* Option 1: Demo Instant Mode */}
              <label
                onClick={() => setPaymentMethod('Demo')}
                className={`p-4 rounded-xl border-2 flex items-start space-x-3 cursor-pointer transition-all ${
                  paymentMethod === 'Demo'
                    ? 'border-teal-600 bg-teal-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'Demo'}
                  onChange={() => setPaymentMethod('Demo')}
                  className="mt-1 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">
                      Instant Demo Payment (College Demo Mode)
                    </span>
                    <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Recommended for Evaluation</span>
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1 leading-relaxed">
                    Instantly verifies payment, performs atomic inventory deduction, credits seller payouts, generates tax invoice, and opens tracking timeline.
                  </p>
                </div>
              </label>

              {/* Option 2: Live Razorpay */}
              <label
                onClick={() => setPaymentMethod('Razorpay')}
                className={`p-4 rounded-xl border-2 flex items-start space-x-3 cursor-pointer transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'border-royal-600 bg-royal-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => setPaymentMethod('Razorpay')}
                  className="mt-1 text-royal-600 focus:ring-royal-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">Razorpay Payment Gateway</span>
                    <span className="bg-royal-100 text-royal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Card / UPI / NetBanking
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1 leading-relaxed">
                    Opens Razorpay checkout popup. Verifies HMAC-SHA256 signature on backend before updating order status.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Item Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-5 h-fit">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
            Cart Snapshot ({cart.items.reduce((s, i) => s + i.quantity, 0)} Items)
          </h3>

          <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-slate-100 pr-1">
            {cart.items.map((item) => (
              <div key={item._id} className="pt-2 flex items-center justify-between text-xs">
                <div className="truncate mr-2">
                  <p className="font-bold text-slate-800 truncate">{item.product?.name}</p>
                  <p className="text-[11px] text-slate-400">Qty: {item.quantity} &times; ₹{item.price}</p>
                </div>
                <span className="font-bold text-slate-900 flex-shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5% GST)</span>
              <span className="font-bold text-slate-800">₹{cart.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-bold text-slate-800">
                {cart.shippingFee === 0 ? 'FREE' : `₹${cart.shippingFee}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-navy-900 pt-2 border-t border-slate-100">
              <span>Grand Total</span>
              <span>₹{cart.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full py-3.5 bg-navy-900 hover:bg-royal-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Securing Allocation & Order...</span>
            ) : (
              <span>Confirm & Pay ₹{cart.totalAmount.toLocaleString('en-IN')}</span>
            )}
          </button>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            By confirming order, StockSphere immediately locks the inventory quantity atomically and issues an auditable movement record.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
