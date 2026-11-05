import express from 'express';
import {
  getSellerAnalytics,
  downloadSalesReport,
} from '../controllers/sellerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('Seller', 'Admin'));

router.get('/analytics', getSellerAnalytics);
router.get('/reports/sales', downloadSalesReport);

export default router;
