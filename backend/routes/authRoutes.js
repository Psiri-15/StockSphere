import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerCustomer,
  registerSeller,
  loginUser,
  getMe,
  updateProfile,
  updatePassword,
  uploadAvatar,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Rate limiter for auth routes to prevent brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 auth requests per window
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, registerCustomer);
router.post('/register-seller', authLimiter, registerSeller);
router.post('/login', authLimiter, loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/upload-avatar', protect, uploadSingleImage, uploadAvatar);
router.put('/password', protect, updatePassword);

export default router;
