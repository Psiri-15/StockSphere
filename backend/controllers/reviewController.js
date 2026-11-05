import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for product
// @route   POST /api/reviews
// @access  Private (Customer)
export const addReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, rating (1-5), and comment are required.',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const alreadyReviewed = await Review.findOne({
      product: productId,
      customer: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product.',
      });
    }

    // Check if verified purchase
    const orderWithProduct = await Order.findOne({
      customer: req.user._id,
      'items.product': productId,
      paymentStatus: 'Paid',
    });

    const review = await Review.create({
      product: productId,
      customer: req.user._id,
      rating: Number(rating),
      title: title || '',
      comment,
      isVerifiedPurchase: Boolean(orderWithProduct),
    });

    // Recalculate product rating
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    product.numReviews = allReviews.length;
    product.rating = Number(avgRating.toFixed(1));
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review posted successfully!',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner/Admin)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (req.user.role !== 'Admin' && review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this review' });
    }

    const productId = review.product;
    await review.deleteOne();

    const allReviews = await Review.find({ product: productId });
    const product = await Product.findById(productId);
    if (product) {
      product.numReviews = allReviews.length;
      product.rating = allReviews.length > 0
        ? Number((allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1))
        : 0;
      await product.save();
    }

    res.json({
      success: true,
      message: 'Review deleted',
    });
  } catch (error) {
    next(error);
  }
};
