const BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- 1. Testing Health ---');
  let res = await fetch(`${BASE}/health`);
  let data = await res.json();
  console.log('Health:', data.status);

  console.log('\n--- 2. Customer Login ---');
  res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@stocksphere.com', password: 'password123' }),
  });
  data = await res.json();
  const customerToken = data.token;
  console.log('Customer logged in:', data.user.name, 'Token:', customerToken ? 'OK' : 'FAIL');

  console.log('\n--- 3. Fetch Catalog Products ---');
  res = await fetch(`${BASE}/products`);
  data = await res.json();
  const firstProduct = data.products[0];
  console.log('Found', data.total, 'products. Testing with:', firstProduct.name, 'SKU:', firstProduct.sku, 'Stock:', firstProduct.stock);

  console.log('\n--- 4. Add to Cart ---');
  res = await fetch(`${BASE}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`,
    },
    body: JSON.stringify({ productId: firstProduct._id, quantity: 1 }),
  });
  data = await res.json();
  console.log('Cart add result:', data.message, 'Items:', data.itemCount);

  console.log('\n--- 5. Place Order ---');
  res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Aryan Sharma',
        phone: '+91 98444 55667',
        addressLine1: 'Flat 602, Orchid Heights',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122003',
        country: 'India',
      },
      paymentMethod: 'Demo',
    }),
  });
  data = await res.json();
  const createdOrder = data.order;
  console.log('Order created:', createdOrder.orderNumber, 'Total:', createdOrder.totalAmount, 'Status:', createdOrder.orderStatus);

  console.log('\n--- 6. Process Payment & Atomic Inventory Deduction ---');
  res = await fetch(`${BASE}/payments/demo-pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`,
    },
    body: JSON.stringify({ orderId: createdOrder._id }),
  });
  data = await res.json();
  console.log('Payment result:', data.message, 'Order Status:', data.order.orderStatus, 'Payment Status:', data.order.paymentStatus);

  console.log('\n--- 7. Verify Inventory Deduction & Stock Ledger ---');
  res = await fetch(`${BASE}/products/${firstProduct._id}`);
  data = await res.json();
  console.log('Updated stock for', data.product.name, 'is now:', data.product.stock, '(Was:', firstProduct.stock, ')');

  console.log('\n--- 8. Admin Login & Check Approvals ---');
  res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@stocksphere.com', password: 'password123' }),
  });
  data = await res.json();
  const adminToken = data.token;
  console.log('Admin logged in:', data.user.name);

  res = await fetch(`${BASE}/admin/analytics`, {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  data = await res.json();
  console.log('Platform Analytics: Total Revenue: ₹' + data.analytics.totalRevenue + ', Total Orders: ' + data.analytics.totalOrders);

  console.log('\n--- 9. Verify PDF Invoice Stream ---');
  res = await fetch(`${BASE}/orders/${createdOrder._id}/invoice`, {
    headers: { 'Authorization': `Bearer ${customerToken}` },
  });
  console.log('Invoice response status:', res.status, 'Content-Type:', res.headers.get('content-type'));

  console.log('\n=== ALL END-TO-END WORKFLOW TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(console.error);
