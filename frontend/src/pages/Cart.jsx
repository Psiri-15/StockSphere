import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';

export const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner text="Retrieving your shopping cart..." />;
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Explore our marketplace to discover verified products and next-generation tech gear."
          actionLabel="Explore Marketplace"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {cart.items.reduce((s, i) => s + i.quantity, 0)} item(s) selected for checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const product = item.product;
            if (!product) return null;
            const isLowStock = product.stock <= product.lowStockThreshold && product.stock > 0;
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={item._id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <img
                    src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                    alt={product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                      {product.sku}
                    </span>
                    <Link
                      to={`/products/${product._id}`}
                      className="block font-bold text-slate-900 text-xs sm:text-sm hover:text-royal-600 truncate mt-1"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs font-bold text-slate-900 mt-1">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>

                    {/* Stock Alert in Cart */}
                    {isOutOfStock ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-600 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Item is now Out of Stock</span>
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-600 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Only {product.stock} available</span>
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-900 border-x border-slate-200">
                      {item.quantity}
                    </span>
                    <button
                      disabled={item.quantity >= product.stock}
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 font-bold disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Subtotal */}
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-5 h-fit">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>GST & Platform Tax (5%)</span>
              <span className="font-bold text-slate-800">₹{cart.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Estimate</span>
              <span className="font-bold text-slate-800">
                {cart.shippingFee === 0 ? (
                  <span className="text-teal-600 uppercase font-extrabold text-[11px]">Free</span>
                ) : (
                  `₹${cart.shippingFee}`
                )}
              </span>
            </div>
            {cart.subtotal < 999 && (
              <p className="text-[10px] text-royal-600 bg-royal-50 p-2 rounded-lg">
                Add ₹{(999 - cart.subtotal).toLocaleString('en-IN')} more to unlock Free Shipping!
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-extrabold text-slate-900">Total Amount</span>
            <span className="text-2xl font-black text-navy-900">
              ₹{cart.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 bg-navy-900 hover:bg-royal-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-3 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Encrypted Payment & Atomic Stock Lock</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
