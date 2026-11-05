import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';
import Transaction from '../models/Transaction.js';
import { getSocketIO } from '../services/inventoryService.js';

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/blocked status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'Admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate an Administrator' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sellers list (including pending approvals)
// @route   GET /api/admin/sellers
// @access  Private/Admin
export const getSellers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { role: 'Seller' };

    if (status) {
      query['sellerDetails.approvalStatus'] = status;
    }

    const sellers = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: sellers.length,
      sellers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject seller application
// @route   PUT /api/admin/sellers/:id/approval
// @access  Private/Admin
export const updateSellerApproval = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid approval status' });
    }

    const seller = await User.findOne({ _id: req.params.id, role: 'Seller' });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    seller.sellerDetails.approvalStatus = status;
    if (status === 'Approved') {
      seller.sellerDetails.approvedAt = new Date();
      seller.sellerDetails.rejectionReason = '';
    } else {
      seller.sellerDetails.rejectionReason = rejectionReason || 'Application does not meet platform criteria.';
    }

    await seller.save();

    // Create notification for seller
    await Notification.create({
      recipient: seller._id,
      title: `Seller Account ${status}`,
      message:
        status === 'Approved'
          ? 'Congratulations! Your seller account has been approved. You can now manage products and inventory.'
          : `Your seller onboarding application was rejected. Reason: ${seller.sellerDetails.rejectionReason}`,
      type: 'APPROVAL',
      link: '/seller/dashboard',
    });

    const io = getSocketIO();
    if (io) {
      io.to(`user_${seller._id}`).emit('notification', {
        title: `Seller Account ${status}`,
        message: status === 'Approved' ? 'You are now approved to sell on StockSphere!' : 'Application status updated.',
        type: 'APPROVAL',
      });
    }

    res.json({
      success: true,
      message: `Seller application marked as ${status}`,
      sellerDetails: seller.sellerDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform-wide admin analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'Customer' });
    const totalSellers = await User.countDocuments({ role: 'Seller' });
    const pendingSellers = await User.countDocuments({
      role: 'Seller',
      'sellerDetails.approvalStatus': 'Pending',
    });
    const totalProducts = await Product.countDocuments();
    const lowStockProductsCount = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    });

    const allOrders = await Order.find();
    const totalOrders = allOrders.length;

    // Platform revenue (Paid orders)
    const paidOrders = allOrders.filter((o) => o.paymentStatus === 'Paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Order status breakdown
    const orderStatusCounts = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    allOrders.forEach((o) => {
      if (orderStatusCounts[o.orderStatus] !== undefined) {
        orderStatusCounts[o.orderStatus]++;
      }
    });

    // Monthly revenue aggregation (last 6 months)
    const monthlyRevenue = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const mName = monthNames[d.getMonth()];

      const monthOrders = paidOrders.filter(
        (o) => new Date(o.createdAt) >= d && new Date(o.createdAt) < nextMonth
      );
      const revenue = monthOrders.reduce((acc, o) => acc + o.totalAmount, 0);

      monthlyRevenue.push({
        month: mName,
        revenue,
        orders: monthOrders.length,
      });
    }

    // Recent 5 platform transactions
    const recentTransactions = await Transaction.find()
      .populate('user', 'name email sellerDetails.storeName')
      .populate('referenceOrder', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalSellers,
        pendingSellers,
        totalProducts,
        lowStockProductsCount,
        orderStatusDistribution: Object.keys(orderStatusCounts).map((k) => ({
          status: k,
          count: orderStatusCounts[k],
        })),
        monthlyRevenue,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};
