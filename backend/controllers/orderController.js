import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Notification from '../models/Notification.js';
import { deductStockForOrder, restoreStockForOrder, getSocketIO } from '../services/inventoryService.js';

// Helper to generate readable Order Number
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${random}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'Razorpay' } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required.',
      });
    }

    let orderItems = [];

    // If items not provided, load from active cart
    if (!items || items.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Your shopping cart is empty' });
      }

      for (const cartItem of cart.items) {
        const prod = cartItem.product;
        if (!prod || !prod.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product ${cartItem.product?.name || 'Item'} is no longer available.`,
          });
        }
        if (prod.stock < cartItem.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${prod.name}". Available: ${prod.stock}, In Cart: ${cartItem.quantity}`,
          });
        }

        orderItems.push({
          product: prod._id,
          name: prod.name,
          sku: prod.sku,
          price: prod.price,
          image: prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
          seller: prod.seller,
          quantity: cartItem.quantity,
        });
      }
    } else {
      // Direct checkout items
      for (const item of items) {
        const prod = await Product.findById(item.productId || item.product);
        if (!prod || !prod.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product is unavailable.`,
          });
        }
        if (prod.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${item.quantity}`,
          });
        }

        orderItems.push({
          product: prod._id,
          name: prod.name,
          sku: prod.sku,
          price: prod.price,
          image: prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
          seller: prod.seller,
          quantity: item.quantity,
        });
      }
    }

    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const shippingFee = subtotal > 999 ? 0 : 99;
    const totalAmount = subtotal + tax + shippingFee;

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      subtotal,
      tax,
      shippingFee,
      totalAmount,
      statusTimeline: [
        {
          status: 'Pending',
          updatedAt: new Date(),
          comment: 'Order placed, awaiting payment confirmation',
          updatedBy: req.user._id,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.seller', 'name email sellerDetails.storeName phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization: Customer who placed it, Seller who sells an item in it, or Admin
    const isCustomer = req.user.role === 'Customer' && order.customer._id.toString() === req.user._id.toString();
    const isSeller = req.user.role === 'Seller' && order.items.some(
      (item) => item.seller?._id?.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'Admin';

    if (!isCustomer && !isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders for seller
// @route   GET /api/orders/seller/my-orders
// @access  Private (Seller)
export const getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'items.seller': req.user._id })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    // Filter items to show seller's items in each order
    const sellerOrders = orders.map((order) => {
      const filteredItems = order.items.filter(
        (item) => item.seller.toString() === req.user._id.toString()
      );
      const sellerSubtotal = filteredItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

      return {
        ...order.toObject(),
        items: filteredItems,
        sellerSubtotal,
      };
    });

    res.json({
      success: true,
      count: sellerOrders.length,
      orders: sellerOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private (Admin)
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Seller/Admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, comment, trackingNumber } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status value.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization
    if (req.user.role === 'Seller') {
      const ownsProductInOrder = order.items.some(
        (item) => item.seller.toString() === req.user._id.toString()
      );
      if (!ownsProductInOrder) {
        return res.status(403).json({ success: false, message: 'Unauthorized for this order' });
      }
    }

    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    order.statusTimeline.push({
      status,
      updatedAt: new Date(),
      comment: comment || `Status updated to ${status}`,
      updatedBy: req.user._id,
    });

    await order.save();

    // Create Notification for Customer
    await Notification.create({
      recipient: order.customer,
      title: `Order Status: ${status}`,
      message: `Your order #${order.orderNumber} is now marked as ${status}.`,
      type: 'ORDER',
      link: `/orders/${order._id}`,
    });

    const io = getSocketIO();
    if (io) {
      io.to(`user_${order.customer}`).emit('notification', {
        title: `Order Status: ${status}`,
        message: `Your order #${order.orderNumber} is now ${status}.`,
        type: 'ORDER',
      });
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        status,
        timeline: order.statusTimeline,
      });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer/Seller/Admin)
export const cancelOrder = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by user' } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    if (order.orderStatus === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Delivered orders cannot be cancelled directly.' });
    }

    // Customer can only cancel Pending or Confirmed
    if (req.user.role === 'Customer') {
      if (order.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Order has already been processed or shipped and cannot be cancelled automatically.',
        });
      }
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason;
    order.cancelledAt = new Date();

    order.statusTimeline.push({
      status: 'Cancelled',
      updatedAt: new Date(),
      comment: `Order cancelled. Reason: ${reason}`,
      updatedBy: req.user._id,
    });

    // If payment was completed, restore stock back into inventory!
    if (order.paymentStatus === 'Paid') {
      await restoreStockForOrder(order, reason, req.user._id);
      order.paymentStatus = 'Refunded';
    }

    await order.save();

    // Notify Customer and Sellers
    await Notification.create({
      recipient: order.customer,
      title: 'Order Cancelled',
      message: `Order #${order.orderNumber} has been cancelled.`,
      type: 'ORDER',
      link: `/orders/${order._id}`,
    });

    const uniqueSellerIds = [...new Set(order.items.map((i) => i.seller.toString()))];
    for (const sId of uniqueSellerIds) {
      await Notification.create({
        recipient: sId,
        title: 'Order Cancelled Notice',
        message: `Order #${order.orderNumber} containing your items was cancelled.`,
        type: 'ORDER',
        link: `/seller/orders`,
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully and inventory restored where applicable.',
      order,
    });
  } catch (error) {
    next(error);
  }
};
