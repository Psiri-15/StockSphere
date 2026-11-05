import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import { adjustStockManual } from '../services/inventoryService.js';

// @desc    Get inventory status for products
// @route   GET /api/inventory/status
// @access  Private (Seller/Admin)
export const getInventoryStatus = async (req, res, next) => {
  try {
    const filter = { isActive: true };

    if (req.user.role === 'Seller') {
      filter.seller = req.user._id;
    }

    if (req.query.status === 'LOW_STOCK') {
      filter.$expr = {
        $and: [
          { $gt: ['$stock', 0] },
          { $lte: ['$stock', '$lowStockThreshold'] },
        ],
      };
    } else if (req.query.status === 'OUT_OF_STOCK') {
      filter.stock = { $lte: 0 };
    } else if (req.query.status === 'IN_STOCK') {
      filter.$expr = { $gt: ['$stock', '$lowStockThreshold'] };
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('seller', 'name sellerDetails.storeName')
      .sort({ stock: 1, updatedAt: -1 });

    const inventoryList = products.map((p) => ({
      _id: p._id,
      name: p.name,
      sku: p.sku,
      category: p.category?.name || 'Uncategorized',
      price: p.price,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      stockStatus: p.stockStatus,
      totalValuation: p.stock * p.price,
      seller: p.seller,
      updatedAt: p.updatedAt,
    }));

    res.json({
      success: true,
      count: inventoryList.length,
      inventory: inventoryList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit trail / stock movement records
// @route   GET /api/inventory/transactions
// @access  Private (Seller/Admin)
export const getInventoryTransactions = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'Seller') {
      filter.seller = req.user._id;
    }

    if (req.query.productId) {
      filter.product = req.query.productId;
    }

    if (req.query.changeType) {
      filter.changeType = req.query.changeType;
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await InventoryTransaction.countDocuments(filter);
    const transactions = await InventoryTransaction.find(filter)
      .populate('product', 'name sku images price')
      .populate('performedBy', 'name role')
      .populate('referenceOrderId', 'orderNumber totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust product stock manually
// @route   POST /api/inventory/adjust
// @access  Private (Seller/Admin)
export const adjustProductStock = async (req, res, next) => {
  try {
    const { productId, quantityChange, changeType, notes } = req.body;

    if (!productId || quantityChange === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity change are required.',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Role check: Seller can only adjust their own products
    if (req.user.role !== 'Admin' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to adjust inventory for this product.',
      });
    }

    const result = await adjustStockManual({
      productId,
      quantityChange,
      changeType: changeType || 'MANUAL_ADJUSTMENT',
      notes,
      performedBy: req.user._id,
    });

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock and out-of-stock items
// @route   GET /api/inventory/alerts
// @access  Private (Seller/Admin)
export const getLowStockAlerts = async (req, res, next) => {
  try {
    const filter = {
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    };

    if (req.user.role === 'Seller') {
      filter.seller = req.user._id;
    }

    const alerts = await Product.find(filter)
      .populate('category', 'name')
      .populate('seller', 'name sellerDetails.storeName')
      .sort({ stock: 1 });

    res.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory summary statistics
// @route   GET /api/inventory/summary
// @access  Private (Seller/Admin)
export const getInventorySummaryStats = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.user.role === 'Seller') {
      filter.seller = req.user._id;
    }

    const products = await Product.find(filter);

    let totalStock = 0;
    let totalValuation = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let healthyStockCount = 0;

    products.forEach((p) => {
      totalStock += p.stock;
      totalValuation += p.stock * p.price;

      if (p.stock <= 0) {
        outOfStockCount++;
      } else if (p.stock <= p.lowStockThreshold) {
        lowStockCount++;
      } else {
        healthyStockCount++;
      }
    });

    res.json({
      success: true,
      summary: {
        totalSKUs: products.length,
        totalUnits: totalStock,
        totalValuation,
        outOfStockCount,
        lowStockCount,
        healthyStockCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
