import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private (Customer)
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name sku price images stock isActive lowStockThreshold seller',
      populate: { path: 'seller', select: 'sellerDetails.storeName name' },
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out deleted or deactivated products and update price snapshot
    const validItems = [];
    let hasChanges = false;

    for (const item of cart.items) {
      if (item.product && item.product.isActive) {
        // Keep current price up to date
        if (item.price !== item.product.price) {
          item.price = item.product.price;
          hasChanges = true;
        }
        validItems.push(item);
      } else {
        hasChanges = true;
      }
    }

    if (hasChanges) {
      cart.items = validItems;
      await cart.save();
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const shippingFee = subtotal > 999 || subtotal === 0 ? 0 : 99; // Free shipping above ₹999
    const totalAmount = subtotal + tax + shippingFee;

    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        itemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
        subtotal,
        tax,
        shippingFee,
        totalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private (Customer)
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const qty = Math.max(1, parseInt(quantity, 10));

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Sorry, this product is currently out of stock.' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      const newTotalQty = cart.items[existingItemIndex].quantity + qty;
      if (newTotalQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} items are available in stock.`,
        });
      }
      cart.items[existingItemIndex].quantity = newTotalQty;
      cart.items[existingItemIndex].price = product.price;
    } else {
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${qty} units. Only ${product.stock} are available.`,
        });
      }
      cart.items.push({
        product: productId,
        quantity: qty,
        price: product.price,
      });
    }

    await cart.save();

    res.json({
      success: true,
      message: 'Item added to cart',
      itemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private (Customer)
export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (qty <= 0) {
      cart.items.pull(itemId);
    } else {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        cart.items.pull(itemId);
      } else if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units are currently available.`,
        });
      } else {
        item.quantity = qty;
        item.price = product.price;
      }
    }

    await cart.save();

    res.json({
      success: true,
      message: 'Cart updated',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private (Customer)
export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items.pull(itemId);
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private (Customer)
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    next(error);
  }
};
