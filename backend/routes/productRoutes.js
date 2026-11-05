import express from 'express';
import {
  getProducts,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  uploadImages,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles, requireApprovedSeller } from '../middleware/roleMiddleware.js';
import { uploadMultipleImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/seller/my-products', protect, authorizeRoles('Seller', 'Admin'), getSellerProducts);
router.post(
  '/upload-images',
  protect,
  authorizeRoles('Seller', 'Admin'),
  uploadMultipleImages,
  uploadImages
);

router.route('/')
  .get(getProducts)
  .post(protect, requireApprovedSeller, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, requireApprovedSeller, updateProduct)
  .delete(protect, requireApprovedSeller, deleteProduct);

router.get('/:id/related', getRelatedProducts);

export default router;
