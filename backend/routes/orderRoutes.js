import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';
import { downloadInvoice } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/my-orders', authorizeRoles('Customer'), getMyOrders);
router.get('/seller/my-orders', authorizeRoles('Seller', 'Admin'), getSellerOrders);
router.get('/:id/invoice', downloadInvoice);

router.route('/')
  .post(authorizeRoles('Customer'), createOrder)
  .get(authorizeRoles('Admin'), getAllOrders);

router.route('/:id')
  .get(getOrderById);

router.put('/:id/status', authorizeRoles('Seller', 'Admin'), updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
