import crypto from 'crypto';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Cart from '../models/Cart.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import { getRazorpayInstance, isDemoPaymentMode } from '../config/razorpay.js';
import { deductStockForOrder, getSocketIO } from '../services/inventoryService.js';

// @desc    Create Razorpay Order or Demo Order
// @route   POST /api/payments/create-order
// @access  Private (Customer)
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this order' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'This order is already paid for.' });
    }

    const razorpay = getRazorpayInstance();

    // If live Razorpay is not configured or demo mode is selected
    if (!razorpay || isDemoPaymentMode) {
      const demoOrderId = `demo_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      await Payment.create({
        order: order._id,
        customer: req.user._id,
        paymentMethod: 'Demo',
        razorpayOrderId: demoOrderId,
        amount: order.totalAmount,
        currency: 'INR',
        status: 'Pending',
      });

      return res.json({
        success: true,
        isDemo: true,
        razorpayOrderId: demoOrderId,
        amount: order.totalAmount,
        currency: 'INR',
        keyId: 'rzp_demo_key_public',
        orderNumber: order.orderNumber,
        customer: {
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
        },
      });
    }

    // Live Razorpay order creation
    const options = {
      amount: Math.round(order.totalAmount * 100), // amount in paise
      currency: 'INR',
      receipt: `rcpt_${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '').slice(-12)}`,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: req.user.email,
      },
    };

    const rzpOrder = await razorpay.orders.create(options);

    await Payment.create({
      order: order._id,
      customer: req.user._id,
      paymentMethod: 'Razorpay',
      razorpayOrderId: rzpOrder.id,
      amount: order.totalAmount,
      currency: 'INR',
      status: 'Pending',
    });

    res.json({
      success: true,
      isDemo: false,
      razorpayOrderId: rzpOrder.id,
      amount: order.totalAmount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      orderNumber: order.orderNumber,
      customer: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private (Customer)
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check duplicate verification
    if (order.paymentStatus === 'Paid') {
      return res.json({
        success: true,
        message: 'Order has already been verified and paid.',
        order,
      });
    }

    // Verify signature using crypto HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder_key')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      await Payment.findOneAndUpdate(
        { order: order._id, razorpayOrderId: razorpay_order_id },
        { status: 'Failed', failureReason: 'Signature mismatch' }
      );
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Record verified payment
    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'Completed',
      },
      { upsert: true }
    );

    // Atomically deduct inventory
    await deductStockForOrder(order, req.user._id);

    // Update order status
    order.paymentStatus = 'Paid';
    order.orderStatus = 'Confirmed';
    order.statusTimeline.push({
      status: 'Confirmed',
      updatedAt: new Date(),
      comment: `Payment verified successfully via Razorpay (Txn ID: ${razorpay_payment_id})`,
      updatedBy: req.user._id,
    });
    await order.save();

    // Clear user cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Distribute seller earnings & transactions
    for (const item of order.items) {
      const itemSubtotal = item.price * item.quantity;
      const commission = Math.round(itemSubtotal * 0.05); // 5% platform commission
      const netPayout = itemSubtotal - commission;

      await Transaction.create({
        user: item.seller,
        type: 'CREDIT',
        amount: itemSubtotal,
        platformFee: commission,
        netAmount: netPayout,
        referenceOrder: order._id,
        description: `Sale payout for item: ${item.name} in order #${order.orderNumber}`,
        status: 'Completed',
      });

      // Notify seller
      await Notification.create({
        recipient: item.seller,
        title: 'New Order Received!',
        message: `New confirmed order #${order.orderNumber} for "${item.name}" (Qty: ${item.quantity}).`,
        type: 'ORDER',
        link: '/seller/orders',
      });
    }

    // Notify Customer
    await Notification.create({
      recipient: order.customer,
      title: 'Payment Successful!',
      message: `Your payment of ₹${order.totalAmount} for order #${order.orderNumber} was confirmed.`,
      type: 'PAYMENT',
      link: `/orders/${order._id}`,
    });

    const io = getSocketIO();
    if (io) {
      io.to(`user_${order.customer}`).emit('notification', {
        title: 'Payment Successful!',
        message: `Order #${order.orderNumber} confirmed.`,
        type: 'PAYMENT',
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully and stock updated.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process Demo Payment (Frictionless college demonstration mode)
// @route   POST /api/payments/demo-pay
// @access  Private (Customer)
export const processDemoPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this order' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.json({
        success: true,
        message: 'Order has already been verified and paid.',
        order,
      });
    }

    const demoTxnId = `DEMO_TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Atomically deduct inventory
    await deductStockForOrder(order, req.user._id);

    // Save payment record
    await Payment.create({
      order: order._id,
      customer: req.user._id,
      paymentMethod: 'Demo',
      razorpayOrderId: `demo_order_${order._id}`,
      razorpayPaymentId: demoTxnId,
      amount: order.totalAmount,
      currency: 'INR',
      status: 'Completed',
      metadata: { demoMode: true, simulationTime: new Date() },
    });

    order.paymentStatus = 'Paid';
    order.paymentMethod = 'Demo';
    order.orderStatus = 'Confirmed';
    order.statusTimeline.push({
      status: 'Confirmed',
      updatedAt: new Date(),
      comment: `Demo payment verified successfully (Txn: ${demoTxnId})`,
      updatedBy: req.user._id,
    });
    await order.save();

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Distribute seller earnings & audit transactions
    for (const item of order.items) {
      const itemSubtotal = item.price * item.quantity;
      const commission = Math.round(itemSubtotal * 0.05);
      const netPayout = itemSubtotal - commission;

      await Transaction.create({
        user: item.seller,
        type: 'CREDIT',
        amount: itemSubtotal,
        platformFee: commission,
        netAmount: netPayout,
        referenceOrder: order._id,
        description: `Demo sale credit for item "${item.name}" in order #${order.orderNumber}`,
        status: 'Completed',
      });

      await Notification.create({
        recipient: item.seller,
        title: 'New Confirmed Order!',
        message: `Order #${order.orderNumber} for "${item.name}" (Qty: ${item.quantity}) is paid.`,
        type: 'ORDER',
        link: '/seller/orders',
      });
    }

    // Customer notification
    await Notification.create({
      recipient: order.customer,
      title: 'Payment Confirmed',
      message: `Your payment of ₹${order.totalAmount} for order #${order.orderNumber} was successful.`,
      type: 'PAYMENT',
      link: `/orders/${order._id}`,
    });

    const io = getSocketIO();
    if (io) {
      io.to(`user_${order.customer}`).emit('notification', {
        title: 'Payment Confirmed',
        message: `Order #${order.orderNumber} placed successfully.`,
        type: 'PAYMENT',
      });
    }

    res.json({
      success: true,
      message: 'Demo payment completed successfully. Inventory updated.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle payment failure
// @route   POST /api/payments/fail
// @access  Private (Customer)
export const handlePaymentFailure = async (req, res, next) => {
  try {
    const { orderId, reason } = req.body;
    const order = await Order.findById(orderId);

    if (order && order.paymentStatus !== 'Paid') {
      order.paymentStatus = 'Failed';
      order.statusTimeline.push({
        status: 'Pending',
        updatedAt: new Date(),
        comment: `Payment attempt failed: ${reason || 'Transaction declined'}`,
        updatedBy: req.user._id,
      });
      await order.save();

      await Payment.create({
        order: order._id,
        customer: req.user._id,
        paymentMethod: 'Razorpay',
        amount: order.totalAmount,
        currency: 'INR',
        status: 'Failed',
        failureReason: reason || 'Customer aborted or transaction failed',
      });
    }

    res.json({
      success: true,
      message: 'Payment failure recorded.',
    });
  } catch (error) {
    next(error);
  }
};
