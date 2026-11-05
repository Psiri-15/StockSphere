import Order from '../models/Order.js';
import { generateInvoicePDF } from '../services/invoiceService.js';

// @desc    Download PDF invoice for order
// @route   GET /api/orders/:id/invoice
// @access  Private (Customer/Seller/Admin)
export const downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.seller', 'name email sellerDetails.storeName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isCustomer = req.user.role === 'Customer' && order.customer._id.toString() === req.user._id.toString();
    const isSeller = req.user.role === 'Seller' && order.items.some(
      (item) => item.seller?._id?.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'Admin';

    if (!isCustomer && !isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to download invoice for this order.' });
    }

    generateInvoicePDF(order, res);
  } catch (error) {
    next(error);
  }
};
