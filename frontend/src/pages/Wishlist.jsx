import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/LoadingSpinner';

export const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = async (product) => {
    try {
      await addToCart(product._id, 1);
      removeFromWishlist(product._id);
      alert(`Moved "${product.name}" to cart!`);
    } catch (err) {
      alert(err.message || 'Could not add to cart');
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save items you love to your wishlist to easily purchase them later."
          actionLabel="Explore Marketplace"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Wishlist</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {wishlist.length} saved item(s) in your personal collection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle flex flex-col justify-between"
          >
            <div>
              <div className="aspect-square bg-slate-100 relative">
                <Link to={`/products/${product._id}`}>
                  <img
                    src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-2.5 right-2.5 p-2 bg-white/90 text-rose-500 hover:bg-white rounded-full shadow-sm"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4">
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                  {product.sku}
                </span>
                <Link
                  to={`/products/${product._id}`}
                  className="block font-bold text-slate-900 text-xs hover:text-royal-600 line-clamp-2 mt-1"
                >
                  {product.name}
                </Link>
                <p className="text-sm font-extrabold text-slate-900 mt-2">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={() => handleMoveToCart(product)}
                disabled={product.stock <= 0}
                className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                  product.stock <= 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-navy-900 hover:bg-royal-600 text-white shadow-sm'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{product.stock <= 0 ? 'Out of Stock' : 'Move to Cart'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
