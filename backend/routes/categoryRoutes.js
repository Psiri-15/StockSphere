import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, authorizeRoles('Admin'), createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(protect, authorizeRoles('Admin'), updateCategory)
  .delete(protect, authorizeRoles('Admin'), deleteCategory);

export default router;
