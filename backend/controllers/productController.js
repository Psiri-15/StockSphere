import Product from '../models/Product.js';
import Category from '../models/Category.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import { generateSKU } from '../utils/skuGenerator.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// @desc    Get all products with filtering, search, sorting and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      rating,
      stockStatus,
      seller,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    // Search keyword in name, description, brand, or SKU
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
        { sku: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCategory = await Category.findOne({ slug: category });
        if (foundCategory) {
          query.category = foundCategory._id;
        }
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Seller filter
    if (seller) {
      query.seller = seller;
    }

    // Stock Status filter
    if (stockStatus === 'IN_STOCK') {
      query.stock = { $gt: 0 };
    } else if (stockStatus === 'OUT_OF_STOCK') {
      query.stock = { $lte: 0 };
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'name_asc') sortOption = { name: 1 };
    else if (sort === 'popular') sortOption = { numReviews: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('seller', 'name sellerDetails.storeName email')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or SKU
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const query = isObjectId ? { _id: id } : { sku: id.toUpperCase() };

    const product = await Product.findOne(query)
      .populate('category', 'name slug description')
      .populate('seller', 'name email sellerDetails.storeName sellerDetails.storeDescription avatar');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products in the same category
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .populate('category', 'name')
      .populate('seller', 'sellerDetails.storeName')
      .limit(4);

    res.json({
      success: true,
      products: related,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (Seller / Admin)
// @route   POST /api/products
// @access  Private (Seller/Admin)
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      comparePrice,
      category,
      stock,
      lowStockThreshold,
      images,
      brand,
      specifications,
    } = req.body;

    if (!name || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, category, and initial stock quantity are required.',
      });
    }

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: 'Selected category does not exist' });
    }

    // Determine seller: if Seller, use req.user._id; if Admin, can assign to specified seller or self
    const sellerId = req.user.role === 'Admin' && req.body.seller ? req.body.seller : req.user._id;

    // Generate unique SKU
    const sku = generateSKU(categoryDoc.name, name);

    // Default image if not provided
    const productImages = images && images.length > 0 ? images : [
      {
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        public_id: 'default_product_img',
      },
    ];

    const initialStock = Number(stock) || 0;

    const product = await Product.create({
      name,
      sku,
      description,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : 0,
      category,
      seller: sellerId,
      images: productImages,
      stock: initialStock,
      lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 5,
      brand: brand || 'StockSphere Basics',
      specifications: specifications || [],
    });

    // Record initial inventory transaction log
    if (initialStock > 0) {
      await InventoryTransaction.create({
        product: product._id,
        sku: product.sku,
        seller: sellerId,
        changeType: 'INITIAL_STOCK',
        quantityChange: initialStock,
        previousStock: 0,
        newStock: initialStock,
        notes: 'Initial inventory logged upon product creation',
        performedBy: req.user._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Product Seller or Admin)
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ownership check: seller must own product or user must be Admin
    if (req.user.role !== 'Admin' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this product',
      });
    }

    const {
      name,
      description,
      price,
      comparePrice,
      category,
      lowStockThreshold,
      images,
      brand,
      specifications,
      isActive,
    } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (comparePrice !== undefined) product.comparePrice = Number(comparePrice);
    if (category) product.category = category;
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    if (images && images.length > 0) product.images = images;
    if (brand) product.brand = brand;
    if (specifications) product.specifications = specifications;
    if (isActive !== undefined) product.isActive = isActive;

    const updated = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Product Seller or Admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ownership check
    if (req.user.role !== 'Admin' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this product',
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product removed from catalog',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products belonging to current seller
// @route   GET /api/products/seller/my-products
// @access  Private (Seller)
export const getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload product image(s) to Cloudinary or base64 placeholder
// @route   POST /api/products/upload-images
// @access  Private (Seller/Admin)
export const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      // Check single file
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        return res.json({
          success: true,
          images: [{ url: result.secure_url, public_id: result.public_id }],
        });
      }
      return res.status(400).json({ success: false, message: 'Please upload at least one image file.' });
    }

    const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer));
    const results = await Promise.all(uploadPromises);

    const images = results.map((r) => ({
      url: r.secure_url,
      public_id: r.public_id,
    }));

    res.json({
      success: true,
      images,
    });
  } catch (error) {
    next(error);
  }
};
