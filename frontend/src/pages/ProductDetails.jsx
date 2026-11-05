import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Share2,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' or 'reviews'

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes, relRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`),
          api.get(`/products/${id}/related`),
        ]);

        if (prodRes.data.success) {
          setProduct(prodRes.data.product);
          setSelectedImage(0);
          setQuantity(1);
        }
        if (revRes.data.success) setReviews(revRes.data.reviews);
        if (relRes.data.success) setRelated(relRes.data.products);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, quantity);
      alert(`Added ${quantity} unit(s) of "${product.name}" to cart!`);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(product._id, quantity);
      navigate('/checkout');
    } catch (err) {
      alert(err.message || 'Checkout failed');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to write a review');
      return;
    }
    setReviewSubmitting(true);
    setReviewMessage(null);
    try {
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      if (res.data.success) {
        setReviewMessage({ type: 'success', text: 'Thank you! Your review has been posted.' });
        setReviewComment('');
        setReviewTitle('');
        // Refresh reviews
        const revRes = await api.get(`/reviews/product/${id}`);
        if (revRes.data.success) setReviews(revRes.data.reviews);
      }
    } catch (err) {
      setReviewMessage({
        type: 'error',
        text: err.response?.data?.message || 'Could not submit review.',
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving real-time stock & specs..." />;
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <Link to="/products" className="mt-4 inline-block text-xs font-semibold text-royal-600 hover:underline">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id);
  const currentImages = product.images?.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle relative flex items-center justify-center">
            <img
              src={currentImages[selectedImage]?.url}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-2.5 rounded-full shadow-sm transition-all ${
                isFavorited ? 'bg-rose-50 text-rose-500' : 'bg-white text-slate-400 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {currentImages.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                    selectedImage === idx ? 'border-royal-600 shadow' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold mb-2">
              <span className="text-royal-600">{product.brand || 'StockSphere'}</span>
              <span className="text-slate-300">&bull;</span>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                SKU: {product.sku}
              </span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-slate-500">{product.category?.name}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center space-x-2 mt-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5) ? 'fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating || 5.0}</span>
              <span className="text-xs text-slate-400">({reviews.length} verified reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-3 pb-4 border-b border-slate-200">
            <span className="text-3xl font-extrabold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
            {product.comparePrice > product.price && (
              <>
                <span className="text-base text-slate-400 line-through">
                  ₹{product.comparePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Save ₹{(product.comparePrice - product.price).toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>

          {/* Real-time Stock Status */}
          <div className="p-3.5 rounded-xl border flex items-center space-x-3 bg-white shadow-subtle">
            {product.stock <= 0 ? (
              <>
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-rose-700">Currently Out of Stock</p>
                  <p className="text-[11px] text-slate-500">Inventory depleted. Restock expected shortly.</p>
                </div>
              </>
            ) : product.stock <= product.lowStockThreshold ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 animate-bounce" />
                <div>
                  <p className="text-xs font-bold text-amber-800">
                    Low Stock Warning: Only {product.stock} units remaining!
                  </p>
                  <p className="text-[11px] text-slate-500">High demand. Order now to secure allocation.</p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-teal-800">In Stock ({product.stock} units verified)</p>
                  <p className="text-[11px] text-slate-500">Ready for immediate fulfillment & dispatch.</p>
                </div>
              </>
            )}
          </div>

          {/* Quantity and Actions */}
          {product.stock > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <label className="text-xs font-bold text-slate-700">Quantity:</label>
                <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-slate-900 border-x border-slate-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">Max limit: {product.stock}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="py-3 px-4 bg-navy-900 hover:bg-royal-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Instant Checkout
                </button>
              </div>
            </div>
          )}

          {/* Seller Store Card */}
          {product.seller && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
              <Store className="w-5 h-5 text-royal-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-900">
                    {product.seller.sellerDetails?.storeName || product.seller.name}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-teal-600" title="Verified Marketplace Seller" />
                </div>
                <p className="text-slate-500 mt-0.5 text-[11px]">
                  {product.seller.sellerDetails?.storeDescription || 'Authorized Seller on StockSphere.'}
                </p>
              </div>
            </div>
          )}

          {/* Features Strip */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-600 border-t border-slate-200">
            <div className="flex items-center space-x-1.5">
              <Truck className="w-4 h-4 text-royal-600 flex-shrink-0" />
              <span>Fast Tracked Dispatch</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Authentic SKU Verified</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <RotateCcw className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>Hassle-Free Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications & Reviews */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-3.5 px-6 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'specs'
                ? 'border-royal-600 text-royal-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Overview & Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3.5 px-6 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'reviews'
                ? 'border-royal-600 text-royal-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'specs' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Description</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">{product.description}</p>
              </div>

              {product.specifications && product.specifications.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-3xl">
                    {product.specifications.map((spec, i) => (
                      <div
                        key={i}
                        className="flex justify-between py-2 px-3 text-xs bg-slate-50 rounded border border-slate-100"
                      >
                        <span className="font-semibold text-slate-600">{spec.key}</span>
                        <span className="text-slate-800 font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-400">No reviews yet. Be the first to review this product!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900">{rev.customer?.name || 'Customer'}</span>
                          {rev.isVerifiedPurchase && (
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      {rev.title && <h4 className="font-semibold text-xs text-slate-900">{rev.title}</h4>}
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Submit Review Form */}
              <div className="pt-6 border-t border-slate-200 max-w-xl">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Write a Customer Review</h3>

                {reviewMessage && (
                  <div
                    className={`p-3 rounded-lg text-xs font-semibold mb-4 ${
                      reviewMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {reviewMessage.text}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                    >
                      <option value={5}>5 Stars - Outstanding</option>
                      <option value={4}>4 Stars - Very Good</option>
                      <option value={3}>3 Stars - Average</option>
                      <option value={2}>2 Stars - Poor</option>
                      <option value={1}>1 Star - Very Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
                    <input
                      type="text"
                      placeholder="Summary of your experience"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-royal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Review Details</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="What did you like or dislike about this product?"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-royal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-5 py-2.5 bg-navy-900 hover:bg-royal-600 text-white font-bold text-xs rounded-lg shadow-sm transition-all disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
