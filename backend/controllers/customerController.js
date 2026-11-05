import Order from '../models/Order.js';

// @desc    Get customer dashboard metrics
// @route   GET /api/customer/dashboard
// @access  Private (Customer)
export const getCustomerDashboard = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.paymentStatus === 'Paid');
    const totalSpent = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const activeOrders = orders.filter(
      (o) => !['Delivered', 'Cancelled'].includes(o.orderStatus)
    ).length;

    const recentOrders = orders.slice(0, 5);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSpent,
        activeOrders,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};
