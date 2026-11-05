import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get Seller analytics
// @route   GET /api/seller/analytics
// @access  Private (Seller)
export const getSellerAnalytics = async (req, res, next) => {
  try {
    const sellerId = req.user._id;

    const products = await Product.find({ seller: sellerId });
    const totalProducts = products.length;
    const availableStock = products.reduce((acc, p) => acc + p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

    // Fetch orders containing seller products
    const orders = await Order.find({
      'items.seller': sellerId,
    }).sort({ createdAt: -1 });

    let totalSales = 0;
    let totalItemsSold = 0;
    const productSalesMap = {};

    orders.forEach((order) => {
      if (order.paymentStatus === 'Paid') {
        order.items.forEach((item) => {
          if (item.seller.toString() === sellerId.toString()) {
            const saleAmount = item.price * item.quantity;
            totalSales += saleAmount;
            totalItemsSold += item.quantity;

            if (!productSalesMap[item.product]) {
              productSalesMap[item.product] = {
                name: item.name,
                sku: item.sku,
                unitsSold: 0,
                revenue: 0,
              };
            }
            productSalesMap[item.product].unitsSold += item.quantity;
            productSalesMap[item.product].revenue += saleAmount;
          }
        });
      }
    });

    const bestSelling = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // Daily sales for the last 7 days
    const dailySales = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

      let dayTotal = 0;
      orders.forEach((order) => {
        if (order.paymentStatus === 'Paid') {
          const orderDate = new Date(order.createdAt);
          if (
            orderDate.getDate() === d.getDate() &&
            orderDate.getMonth() === d.getMonth() &&
            orderDate.getFullYear() === d.getFullYear()
          ) {
            order.items.forEach((item) => {
              if (item.seller.toString() === sellerId.toString()) {
                dayTotal += item.price * item.quantity;
              }
            });
          }
        }
      });

      dailySales.push({ day: dayStr, sales: dayTotal });
    }

    // Monthly sales for the last 6 months
    const monthlySales = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const mName = monthNames[mDate.getMonth()];

      let monthTotal = 0;
      orders.forEach((order) => {
        if (order.paymentStatus === 'Paid') {
          const oDate = new Date(order.createdAt);
          if (oDate >= mDate && oDate < nextMDate) {
            order.items.forEach((item) => {
              if (item.seller.toString() === sellerId.toString()) {
                monthTotal += item.price * item.quantity;
              }
            });
          }
        }
      });

      monthlySales.push({ month: mName, sales: monthTotal });
    }

    res.json({
      success: true,
      analytics: {
        totalSales,
        totalOrders: orders.length,
        totalProducts,
        availableStock,
        lowStockCount,
        totalItemsSold,
        bestSelling,
        dailySales,
        monthlySales,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Sales Report (CSV)
// @route   GET /api/seller/reports/sales
// @access  Private (Seller)
export const downloadSalesReport = async (req, res, next) => {
  try {
    const sellerId = req.user._id;
    const orders = await Order.find({ 'items.seller': sellerId }).sort({ createdAt: -1 });

    const rows = [
      ['Order Number', 'Date', 'Item Name', 'SKU', 'Quantity', 'Unit Price', 'Total', 'Payment Status', 'Order Status'],
    ];

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.seller.toString() === sellerId.toString()) {
          rows.push([
            order.orderNumber,
            new Date(order.createdAt).toISOString().split('T')[0],
            `"${item.name.replace(/"/g, '""')}"`,
            item.sku,
            item.quantity,
            item.price,
            item.price * item.quantity,
            order.paymentStatus,
            order.orderStatus,
          ]);
        }
      });
    });

    const csvContent = rows.map((r) => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=StockSphere-SalesReport-${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
