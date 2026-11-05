import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product._id, 1);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const isFavorited = isInWishlist(product._id);
  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

  const discountPercentage = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle hover:shadow-elevated transition-all duration-300 flex flex-col justify-between relative">
      <div>
        {/* Image & Wishlist Button */}
        <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
          <Link to={`/products/${product._id}`}>
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </Link>

          {/* Discount Tag */}
          {discountPercentage > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
              {discountPercentage}% OFF
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all shadow-sm ${
              isFavorited
                ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
            }`}
            title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Stock Notification Badge Overlay */}
          {product.stock <= 0 ? (
            <div className="absolute inset-x-0 bottom-0 bg-rose-900/80 backdrop-blur-sm text-white text-xs font-semibold py-1 px-2 flex items-center justify-center space-x-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Out of Stock</span>
            </div>
          ) : product.stock <= product.lowStockThreshold ? (
            <div className="absolute inset-x-0 bottom-0 bg-amber-600/90 backdrop-blur-sm text-white text-xs font-semibold py-1 px-2 flex items-center justify-center space-x-1 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Only {product.stock} left in stock!</span>
            </div>
          ) : null}
        </div>

        {/* Product Details */}
        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium text-slate-600">{product.brand || 'StockSphere'}</span>
            <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
              {product.sku}
            </span>
          </div>

          <Link to={`/products/${product._id}`}>
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 hover:text-royal-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-1 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-800">{product.rating || 5.0}</span>
            <span className="text-[11px] text-slate-400">({product.numReviews || 0})</span>
          </div>
        </div>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="p-4 pt-0">
        <div className="flex items-baseline space-x-2 mb-3">
          <span className="text-lg font-bold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
          {product.comparePrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              ₹{product.comparePrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`w-full py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center space-x-2 transition-all ${
            product.stock <= 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-navy-900 hover:bg-royal-600 text-white shadow-sm hover:shadow'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
