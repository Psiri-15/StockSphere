import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Notification from '../models/Notification.js';

let ioInstance = null;

export const setSocketIOInstance = (io) => {
  ioInstance = io;
};

export const getSocketIO = () => ioInstance;

/**
 * Atomically deduct stock for an order
 * Throws error if any item lacks sufficient stock
 */
export const deductStockForOrder = async (order, performedBy = null) => {
  const deductedItems = [];

  try {
    for (const item of order.items) {
      const productId = item.product._id || item.product;
      const quantityToDeduct = item.quantity;

      // Atomic conditional decrement to guarantee stock never drops below 0
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: quantityToDeduct },
        },
        {
          $inc: { stock: -quantityToDeduct },
        },
        {
          new: true,
        }
      ).populate('seller', 'name email');

      if (!updatedProduct) {
        // Rollback any items that were already deducted in this loop
        for (const rolledBack of deductedItems) {
          await Product.findByIdAndUpdate(rolledBack.productId, {
            $inc: { stock: rolledBack.quantity },
          });
          // Remove or invert the transaction log if needed
          await InventoryTransaction.create({
            product: rolledBack.productId,
            sku: rolledBack.sku,
            seller: rolledBack.sellerId,
            changeType: 'ORDER_CANCELLATION_RESTORE',
            quantityChange: rolledBack.quantity,
            previousStock: rolledBack.newStock,
            newStock: rolledBack.newStock + rolledBack.quantity,
            referenceOrderId: order._id,
            notes: `Rollback due to checkout conflict on order ${order.orderNumber}`,
          });
        }

        const product = await Product.findById(productId);
        const available = product ? product.stock : 0;
        throw new Error(
          `Insufficient stock for "${item.name}" (SKU: ${item.sku}). Requested: ${quantityToDeduct}, Available: ${available}`
        );
      }

      const previousStock = updatedProduct.stock + quantityToDeduct;
      const newStock = updatedProduct.stock;

      deductedItems.push({
        productId,
        sku: updatedProduct.sku,
        sellerId: updatedProduct.seller?._id || item.seller,
        quantity: quantityToDeduct,
        previousStock,
        newStock,
      });

      // Audit log the stock deduction
      await InventoryTransaction.create({
        product: productId,
        sku: updatedProduct.sku,
        seller: updatedProduct.seller?._id || item.seller,
        changeType: 'SALE_DEDUCTION',
        quantityChange: -quantityToDeduct,
        previousStock,
        newStock,
        referenceOrderId: order._id,
        notes: `Sold in order #${order.orderNumber}`,
        performedBy,
      });

      // Check if low stock or out of stock notifications need to be sent
      if (newStock <= 0) {
        await Notification.create({
          recipient: updatedProduct.seller?._id || item.seller,
          title: 'Out of Stock Alert!',
          message: `Item "${updatedProduct.name}" (${updatedProduct.sku}) is now OUT OF STOCK!`,
          type: 'OUT_OF_STOCK',
          link: `/seller/inventory`,
        });

        if (ioInstance) {
          ioInstance.to(`user_${updatedProduct.seller?._id || item.seller}`).emit('notification', {
            title: 'Out of Stock Alert!',
            message: `Item "${updatedProduct.name}" (${updatedProduct.sku}) is now OUT OF STOCK!`,
            type: 'OUT_OF_STOCK',
          });
        }
      } else if (newStock <= updatedProduct.lowStockThreshold) {
        await Notification.create({
          recipient: updatedProduct.seller?._id || item.seller,
          title: 'Low Stock Warning',
          message: `Item "${updatedProduct.name}" (${updatedProduct.sku}) has only ${newStock} units left (Threshold: ${updatedProduct.lowStockThreshold}).`,
          type: 'LOW_STOCK',
          link: `/seller/inventory`,
        });

        if (ioInstance) {
          ioInstance.to(`user_${updatedProduct.seller?._id || item.seller}`).emit('notification', {
            title: 'Low Stock Warning',
            message: `Item "${updatedProduct.name}" (${updatedProduct.sku}) has only ${newStock} units left.`,
            type: 'LOW_STOCK',
          });
        }
      }

      // Broadcast real-time stock update
      if (ioInstance) {
        ioInstance.emit('stock_updated', {
          productId: updatedProduct._id,
          sku: updatedProduct.sku,
          newStock,
        });
      }
    }

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Restores inventory when an order is cancelled or refunded
 */
export const restoreStockForOrder = async (order, reason = 'Order Cancelled', performedBy = null) => {
  for (const item of order.items) {
    const productId = item.product._id || item.product;
    const qtyToRestore = item.quantity;

    const product = await Product.findById(productId);
    if (!product) continue;

    const previousStock = product.stock;
    product.stock += qtyToRestore;
    await product.save();

    await InventoryTransaction.create({
      product: product._id,
      sku: product.sku,
      seller: product.seller,
      changeType: 'ORDER_CANCELLATION_RESTORE',
      quantityChange: qtyToRestore,
      previousStock,
      newStock: product.stock,
      referenceOrderId: order._id,
      notes: `Restored ${qtyToRestore} units. Reason: ${reason} for order #${order.orderNumber}`,
      performedBy,
    });

    if (ioInstance) {
      ioInstance.emit('stock_updated', {
        productId: product._id,
        sku: product.sku,
        newStock: product.stock,
      });
    }
  }
};

/**
 * Manually adjust product stock (Restock, Damage Write-off, Inventory Recount)
 */
export const adjustStockManual = async ({
  productId,
  quantityChange,
  changeType,
  notes,
  performedBy,
}) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const previousStock = product.stock;
  const newStock = previousStock + Number(quantityChange);

  if (newStock < 0) {
    throw new Error(`Cannot adjust stock below zero. Current stock is ${previousStock}, adjustment is ${quantityChange}`);
  }

  product.stock = newStock;
  await product.save();

  const transaction = await InventoryTransaction.create({
    product: product._id,
    sku: product.sku,
    seller: product.seller,
    changeType: changeType || 'MANUAL_ADJUSTMENT',
    quantityChange: Number(quantityChange),
    previousStock,
    newStock,
    notes: notes || 'Manual stock adjustment',
    performedBy,
  });

  // Check alert thresholds
  if (newStock <= 0) {
    await Notification.create({
      recipient: product.seller,
      title: 'Out of Stock Alert',
      message: `Product ${product.name} (${product.sku}) is completely out of stock after adjustment.`,
      type: 'OUT_OF_STOCK',
      link: '/seller/inventory',
    });
  } else if (newStock <= product.lowStockThreshold) {
    await Notification.create({
      recipient: product.seller,
      title: 'Low Stock Alert',
      message: `Product ${product.name} (${product.sku}) is at ${newStock} units (threshold: ${product.lowStockThreshold}).`,
      type: 'LOW_STOCK',
      link: '/seller/inventory',
    });
  }

  if (ioInstance) {
    ioInstance.emit('stock_updated', {
      productId: product._id,
      sku: product.sku,
      newStock,
    });
  }

  return { product, transaction };
};
