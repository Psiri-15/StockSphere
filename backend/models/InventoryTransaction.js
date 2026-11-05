import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    changeType: {
      type: String,
      enum: [
        'INITIAL_STOCK',
        'PURCHASE_RESTOCK',
        'SALE_DEDUCTION',
        'ORDER_CANCELLATION_RESTORE',
        'REFUND_RESTORE',
        'MANUAL_ADJUSTMENT',
        'DAMAGE_WRITE_OFF',
      ],
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    referenceOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('InventoryTransaction', inventoryTransactionSchema);
