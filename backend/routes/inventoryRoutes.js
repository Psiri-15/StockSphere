import express from 'express';
import {
  getInventoryStatus,
  getInventoryTransactions,
  adjustProductStock,
  getLowStockAlerts,
  getInventorySummaryStats,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles, requireApprovedSeller } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/status', authorizeRoles('Seller', 'Admin'), getInventoryStatus);
router.get('/transactions', authorizeRoles('Seller', 'Admin'), getInventoryTransactions);
router.post('/adjust', requireApprovedSeller, adjustProductStock);
router.get('/alerts', authorizeRoles('Seller', 'Admin'), getLowStockAlerts);
router.get('/summary', authorizeRoles('Seller', 'Admin'), getInventorySummaryStats);

export default router;
