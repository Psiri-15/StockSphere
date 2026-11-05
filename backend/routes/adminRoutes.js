import express from 'express';
import {
  getAllUsers,
  toggleUserStatus,
  getSellers,
  updateSellerApproval,
  getAdminAnalytics,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('Admin'));

router.get('/analytics', getAdminAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/sellers', getSellers);
router.put('/sellers/:id/approval', updateSellerApproval);

export default router;
