import PDFDocument from 'pdfkit';

/**
 * Generate a PDF invoice for an order and stream it to the response
 */
export const generateInvoicePDF = (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=StockSphere-Invoice-${order.orderNumber}.pdf`
  );

  doc.pipe(res);

  // Header / Branding
  doc
    .fillColor('#0B192C')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('STOCKSPHERE', 50, 50);

  doc
    .fillColor('#2563EB')
    .fontSize(10)
    .font('Helvetica')
    .text('Smart Inventory & E-Commerce Platform', 50, 75);

  doc
    .fillColor('#64748B')
    .fontSize(9)
    .text('www.stocksphere.local | support@stocksphere.local', 50, 88);

  // Invoice Metadata Header Right
  doc
    .fillColor('#0B192C')
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('TAX INVOICE', 350, 50, { align: 'right' });

  doc
    .fillColor('#475569')
    .fontSize(9)
    .font('Helvetica')
    .text(`Invoice No: INV-${order.orderNumber.replace('ORD-', '')}`, 350, 72, { align: 'right' })
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, 85, { align: 'right' })
    .text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, 350, 98, { align: 'right' });

  // Divider Line
  doc
    .strokeColor('#CBD5E1')
    .lineWidth(1)
    .moveTo(50, 120)
    .lineTo(550, 120)
    .stroke();

  // Billed To & Shipped To Section
  const yBilling = 135;
  doc
    .fillColor('#0B192C')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Billed & Shipped To:', 50, yBilling);

  doc
    .fillColor('#334155')
    .fontSize(10)
    .font('Helvetica')
    .text(order.shippingAddress.fullName, 50, yBilling + 18)
    .text(order.shippingAddress.addressLine1, 50, yBilling + 32)
    .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`, 50, yBilling + 46)
    .text(`Phone: ${order.shippingAddress.phone}`, 50, yBilling + 60);

  doc
    .fillColor('#0B192C')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Order Details:', 350, yBilling);

  doc
    .fillColor('#334155')
    .fontSize(10)
    .font('Helvetica')
    .text(`Order ID: #${order.orderNumber}`, 350, yBilling + 18)
    .text(`Order Status: ${order.orderStatus}`, 350, yBilling + 32)
    .text(`Items Ordered: ${order.items.reduce((s, i) => s + i.quantity, 0)} units`, 350, yBilling + 46);

  // Table Header
  const tableTop = 230;
  doc
    .rect(50, tableTop, 500, 24)
    .fill('#F1F5F9');

  doc
    .fillColor('#0F172A')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Item Description', 60, tableTop + 7)
    .text('SKU', 250, tableTop + 7)
    .text('Qty', 350, tableTop + 7, { width: 40, align: 'center' })
    .text('Price (INR)', 400, tableTop + 7, { width: 70, align: 'right' })
    .text('Total (INR)', 470, tableTop + 7, { width: 70, align: 'right' });

  let yPos = tableTop + 30;

  order.items.forEach((item, index) => {
    const isAlt = index % 2 === 1;
    if (isAlt) {
      doc.rect(50, yPos - 5, 500, 22).fill('#F8FAFC');
    }

    doc
      .fillColor('#1E293B')
      .fontSize(9)
      .font('Helvetica')
      .text(item.name.substring(0, 32), 60, yPos)
      .text(item.sku, 250, yPos)
      .text(item.quantity.toString(), 350, yPos, { width: 40, align: 'center' })
      .text(`Rs. ${item.price.toFixed(2)}`, 400, yPos, { width: 70, align: 'right' })
      .text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, 470, yPos, { width: 70, align: 'right' });

    yPos += 22;
  });

  // Summary Box
  yPos += 15;
  doc
    .strokeColor('#E2E8F0')
    .lineWidth(1)
    .moveTo(330, yPos)
    .lineTo(550, yPos)
    .stroke();

  yPos += 10;
  doc
    .fillColor('#475569')
    .fontSize(10)
    .font('Helvetica')
    .text('Subtotal:', 340, yPos)
    .text(`Rs. ${order.subtotal.toFixed(2)}`, 450, yPos, { align: 'right' });

  yPos += 18;
  doc
    .text('GST (5%):', 340, yPos)
    .text(`Rs. ${order.tax.toFixed(2)}`, 450, yPos, { align: 'right' });

  yPos += 18;
  doc
    .text('Shipping Fee:', 340, yPos)
    .text(order.shippingFee === 0 ? 'FREE' : `Rs. ${order.shippingFee.toFixed(2)}`, 450, yPos, { align: 'right' });

  yPos += 22;
  doc
    .rect(330, yPos - 5, 220, 28)
    .fill('#0B192C');

  doc
    .fillColor('#FFFFFF')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Total Amount:', 340, yPos + 3)
    .text(`Rs. ${order.totalAmount.toFixed(2)}`, 450, yPos + 3, { align: 'right' });

  // Footer notes
  const footerY = 700;
  doc
    .strokeColor('#CBD5E1')
    .lineWidth(1)
    .moveTo(50, footerY)
    .lineTo(550, footerY)
    .stroke();

  doc
    .fillColor('#64748B')
    .fontSize(8)
    .font('Helvetica')
    .text('This is a computer-generated tax invoice for StockSphere - Smart Inventory & E-Commerce Management System.', 50, footerY + 12, { align: 'center', width: 500 })
    .text('Thank you for shopping with us! For returns and support, visit your customer dashboard.', 50, footerY + 24, { align: 'center', width: 500 });

  doc.end();
};
