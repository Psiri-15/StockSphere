import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  processDemoPayment,
  handlePaymentFailure,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/demo-pay', processDemoPayment);
router.post('/fail', handlePaymentFailure);

export default router;
