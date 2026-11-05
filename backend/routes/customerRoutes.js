import express from 'express';
import { getCustomerDashboard } from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getCustomerDashboard);

export default router;
