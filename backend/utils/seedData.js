import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import Review from '../models/Review.js';
import Transaction from '../models/Transaction.js';
import Address from '../models/Address.js';
import Cart from '../models/Cart.js';

export const seedDatabase = async () => {
  console.log('[Seed] Clearing existing collections...');
  await User.deleteMany();
  await Category.deleteMany();
  await Product.deleteMany();
  await InventoryTransaction.deleteMany();
  await Order.deleteMany();
  await Payment.deleteMany();
  await Notification.deleteMany();
  await Review.deleteMany();
  await Transaction.deleteMany();
  await Address.deleteMany();
  await Cart.deleteMany();

  console.log('[Seed] Creating demo users...');
  const admin = await User.create({
    name: 'Lakshmisiri Pachigalla',
    email: 'lsiri4429@gmail.com',
    password: 'password123',
    role: 'Admin',
    phone: '+91 98765 43210',
    avatar: '/avatars/lakshmisiri.jpg',
    isActive: true,
  });

  const seller1 = await User.create({
    name: 'Sowmya Katta',
    email: 'sowmyakatta1@gmail.com',
    password: 'password123',
    role: 'Seller',
    phone: '+91 98111 22334',
    avatar: '/avatars/sowmya.jpg',
    isActive: true,
    sellerDetails: {
      storeName: 'TechNova Electronics',
      storeDescription: 'Authorized premium electronics, audiophile gear and smart accessories.',
      businessRegistrationNumber: 'TN-ELEC-2023-8871',
      taxId: 'GSTIN27AABCS1429B1Z',
      storeAddress: '402 Cyber Hub, DLF Phase 2, Gurugram, HR',
      approvalStatus: 'Approved',
      approvedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
    },
  });

  const seller2 = await User.create({
    name: 'Ananya Roy',
    email: 'seller2@stocksphere.com',
    password: 'password123',
    role: 'Seller',
    phone: '+91 98222 33445',
    avatar: '/avatars/sowmya.jpg',
    isActive: true,
    sellerDetails: {
      storeName: 'Aura Home & Living',
      storeDescription: 'Modern minimalist smart home decor, intelligent lighting, and ergonomic gear.',
      businessRegistrationNumber: 'AURA-HOME-9912',
      taxId: 'GSTIN29XYZAB8829C1Z',
      storeAddress: '88 Indiranagar 100ft Road, Bengaluru, KA',
      approvalStatus: 'Approved',
      approvedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000),
    },
  });

  const sellerPending = await User.create({
    name: 'Sowmya Katta',
    email: 'sowmyakatta1+pending@gmail.com',
    password: 'password123',
    role: 'Seller',
    phone: '+91 98333 44556',
    avatar: '/avatars/sowmya.jpg',
    isActive: true,
    sellerDetails: {
      storeName: 'Pulse Gear Store',
      storeDescription: 'Athletic tech, smart tracking apparel and fitness hardware.',
      businessRegistrationNumber: 'PULSE-FIT-5512',
      taxId: 'GSTIN24PULSE9921D1Z',
      storeAddress: '12 SG Highway, Ahmedabad, GJ',
      approvalStatus: 'Pending',
    },
  });

  const customer = await User.create({
    name: 'Lakshmisiri Pachigalla',
    email: 'lsiri4429+customer@gmail.com',
    password: 'password123',
    role: 'Customer',
    phone: '+91 98444 55667',
    avatar: '/avatars/lakshmisiri.jpg',
    isActive: true,
  });

  console.log('[Seed] Creating categories...');
  const catElectronics = await Category.create({
    name: 'Electronics & Gadgets',
    description: 'Next-gen computing, smartphones, charging hubs, and wireless accessories.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
  });

  const catAudio = await Category.create({
    name: 'Audio & Acoustics',
    description: 'Studio-grade noise-cancelling headphones, high-fidelity wireless earbuds, and soundbars.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  });

  const catWearables = await Category.create({
    name: 'Wearable Tech',
    description: 'Smartwatches, fitness bands, bio-monitors, and intelligent health trackers.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  });

  const catHome = await Category.create({
    name: 'Smart Home & Living',
    description: 'Automated ambient lighting, smart sensors, air purifiers, and connected decor.',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
  });

  const catOffice = await Category.create({
    name: 'Ergonomics & Desk Gear',
    description: 'Mechanical keyboards, ergonomic desks, ultra-wide monitor arms, and setup essentials.',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
  });

  console.log('[Seed] Creating demo products with unique SKUs...');
  const demoProducts = [
    {
      name: 'SonicPro Wireless ANC Headphones',
      sku: 'AUD-SON-9821',
      description: 'Engineered with 40mm beryllium drivers, active hybrid noise cancellation up to 42dB, and 50-hour ultra battery life with quick charge.',
      price: 8999,
      comparePrice: 12999,
      category: catAudio._id,
      seller: seller1._id,
      stock: 35,
      lowStockThreshold: 8,
      brand: 'AcoustiQ',
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' },
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80' },
      ],
      rating: 4.8,
      numReviews: 24,
      specifications: [
        { key: 'Driver Size', value: '40mm Custom Dynamic' },
        { key: 'Battery Life', value: '50 Hours (ANC Off), 38 Hours (ANC On)' },
        { key: 'Connectivity', value: 'Bluetooth 5.3 + 3.5mm Aux' },
      ],
    },
    {
      name: 'Veloce Chroma Smartwatch Gen-4',
      sku: 'WEA-VEL-3042',
      description: 'Brilliant 1.43" AMOLED display with sapphire crystal glass, continuous ECG heart monitor, SpO2 sensor, and 120 sports modes.',
      price: 6499,
      comparePrice: 8999,
      category: catWearables._id,
      seller: seller1._id,
      stock: 4, // Intentionally low stock to trigger low-stock alert!
      lowStockThreshold: 10,
      brand: 'Veloce',
      images: [
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' },
        { url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80' },
      ],
      rating: 4.6,
      numReviews: 18,
      specifications: [
        { key: 'Display', value: '1.43" AMOLED 466x466' },
        { key: 'Water Resistance', value: '5ATM / 50m' },
        { key: 'Battery', value: '12 Days Typical Usage' },
      ],
    },
    {
      name: 'NovaDesk 8-in-1 GaN Charging Station',
      sku: 'ELE-NOV-7719',
      description: '140W total output powered by GaNFast architecture. Powers laptops, tablets, phones, and peripherals simultaneously with intelligent thermal throttling.',
      price: 3499,
      comparePrice: 4999,
      category: catElectronics._id,
      seller: seller1._id,
      stock: 0, // Out of stock demo item!
      lowStockThreshold: 5,
      brand: 'TechNova',
      images: [
        { url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80' },
      ],
      rating: 4.7,
      numReviews: 12,
      specifications: [
        { key: 'Total Power', value: '140W Max' },
        { key: 'Ports', value: '3x USB-C PD 3.1, 2x USB-A, 1x AC Socket' },
      ],
    },
    {
      name: 'Lumina Smart Ambient RGB Floor Lamp',
      sku: 'HOM-LUM-5011',
      description: 'Sleek corner-standing architectural LED lamp with 16 million colors, music sync sensor, Matter/Alexa/Google Home compatibility.',
      price: 4299,
      comparePrice: 5999,
      category: catHome._id,
      seller: seller2._id,
      stock: 22,
      lowStockThreshold: 5,
      brand: 'Aura Living',
      images: [
        { url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80' },
      ],
      rating: 4.9,
      numReviews: 31,
      specifications: [
        { key: 'Height', value: '145 cm' },
        { key: 'Smart Integration', value: 'Apple Home, Google Assistant, Alexa' },
        { key: 'Color Temp', value: '2700K - 6500K Tunable White + RGB' },
      ],
    },
    {
      name: 'Zenith Pro Split Mechanical Keyboard',
      sku: 'OFF-ZEN-8812',
      description: 'Ergonomic split wireless mechanical keyboard with hot-swappable tactile brown switches, OLED status matrix, and CNC aluminum casing.',
      price: 11999,
      comparePrice: 15499,
      category: catOffice._id,
      seller: seller2._id,
      stock: 14,
      lowStockThreshold: 5,
      brand: 'KeyCrafters',
      images: [
        { url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80' },
        { url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80' },
      ],
      rating: 4.9,
      numReviews: 42,
      specifications: [
        { key: 'Switch Type', value: 'Gateron G-Pro Brown (Hot-swappable)' },
        { key: 'Connectivity', value: '2.4GHz Wireless, Bluetooth 5.1, USB-C' },
      ],
    },
    {
      name: 'PureAir IoT Smart Air Purifier 300',
      sku: 'HOM-PUR-6623',
      description: 'Medical-grade H13 True HEPA filtration with laser PM2.5 particle scanner. Purifies a 400 sq.ft room in under 12 minutes.',
      price: 9499,
      comparePrice: 13999,
      category: catHome._id,
      seller: seller2._id,
      stock: 19,
      lowStockThreshold: 6,
      brand: 'Aura Living',
      images: [
        { url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80' },
      ],
      rating: 4.5,
      numReviews: 15,
      specifications: [
        { key: 'CADR', value: '380 m³/h' },
        { key: 'Filter Life', value: '12 Months with RFID Tracking' },
      ],
    },
    {
      name: 'AeroTune True Wireless Earbuds',
      sku: 'AUD-AER-4420',
      description: 'Featherlight 4.1g in-ear acoustic earbuds with spatial audio tracking, transparency mode, and IPX7 sweat & rain resistance.',
      price: 2999,
      comparePrice: 4499,
      category: catAudio._id,
      seller: seller1._id,
      stock: 50,
      lowStockThreshold: 10,
      brand: 'AcoustiQ',
      images: [
        { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80' },
      ],
      rating: 4.4,
      numReviews: 9,
      specifications: [
        { key: 'Playtime', value: '32 Hours with Case' },
        { key: 'Bluetooth Codec', value: 'AAC, aptX Adaptive' },
      ],
    },
    {
      name: 'ErgoLift Heavy-Duty Gas Spring Monitor Arm',
      sku: 'OFF-ERG-1194',
      description: 'Aerospace-grade aluminum single monitor desk mount supporting curved and flat screens from 17" to 38" up to 12kg.',
      price: 3299,
      comparePrice: 4799,
      category: catOffice._id,
      seller: seller2._id,
      stock: 28,
      lowStockThreshold: 5,
      brand: 'KeyCrafters',
      images: [
        { url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80' },
      ],
      rating: 4.8,
      numReviews: 27,
      specifications: [
        { key: 'VESA Compatibility', value: '75x75mm / 100x100mm' },
        { key: 'Tilt Range', value: '-90° to +90°' },
      ],
    },
  ];

  const createdProducts = await Product.insertMany(demoProducts);

  console.log('[Seed] Generating initial audit stock movements...');
  for (const prod of createdProducts) {
    if (prod.stock > 0) {
      await InventoryTransaction.create({
        product: prod._id,
        sku: prod.sku,
        seller: prod.seller,
        changeType: 'INITIAL_STOCK',
        quantityChange: prod.stock,
        previousStock: 0,
        newStock: prod.stock,
        notes: 'Initial warehouse stock import',
        performedBy: admin._id,
      });
    }
  }

  console.log('[Seed] Creating demo customer address...');
  const customerAddress = await Address.create({
    user: customer._id,
    fullName: 'Aryan Sharma',
    phone: '+91 98444 55667',
    addressLine1: 'Flat 602, Orchid Heights, Sector 45',
    addressLine2: 'Near Golf Course Extension',
    city: 'Gurugram',
    state: 'Haryana',
    postalCode: '122003',
    country: 'India',
    isDefault: true,
  });

  console.log('[Seed] Creating demo orders...');
  const prod1 = createdProducts[0]; // SonicPro Headphones
  const prod2 = createdProducts[1]; // Veloce Smartwatch

  const sampleOrder1 = await Order.create({
    orderNumber: 'ORD-20251101-1024',
    customer: customer._id,
    items: [
      {
        product: prod1._id,
        name: prod1.name,
        sku: prod1.sku,
        price: prod1.price,
        image: prod1.images[0].url,
        seller: prod1.seller,
        quantity: 1,
      },
    ],
    shippingAddress: {
      fullName: customerAddress.fullName,
      phone: customerAddress.phone,
      addressLine1: customerAddress.addressLine1,
      city: customerAddress.city,
      state: customerAddress.state,
      postalCode: customerAddress.postalCode,
      country: customerAddress.country,
    },
    paymentMethod: 'Demo',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    subtotal: prod1.price,
    tax: Math.round(prod1.price * 0.05),
    shippingFee: 0,
    totalAmount: prod1.price + Math.round(prod1.price * 0.05),
    trackingNumber: 'TRK-IND-902183',
    statusTimeline: [
      { status: 'Pending', updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), comment: 'Order placed' },
      { status: 'Confirmed', updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), comment: 'Payment verified' },
      { status: 'Processing', updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000), comment: 'Packed at warehouse' },
      { status: 'Shipped', updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000), comment: 'Dispatched via BlueDart' },
      { status: 'Delivered', updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000), comment: 'Delivered to customer' },
    ],
  });

  await Payment.create({
    order: sampleOrder1._id,
    customer: customer._id,
    paymentMethod: 'Demo',
    razorpayOrderId: 'demo_ord_seeded_1',
    razorpayPaymentId: 'pay_demo_seeded_1',
    amount: sampleOrder1.totalAmount,
    currency: 'INR',
    status: 'Completed',
  });

  await Transaction.create({
    user: seller1._id,
    type: 'CREDIT',
    amount: prod1.price,
    platformFee: Math.round(prod1.price * 0.05),
    netAmount: prod1.price - Math.round(prod1.price * 0.05),
    referenceOrder: sampleOrder1._id,
    description: `Payout for order #${sampleOrder1.orderNumber}`,
    status: 'Completed',
  });

  console.log('[Seed] Creating demo reviews...');
  await Review.create({
    product: prod1._id,
    customer: customer._id,
    rating: 5,
    title: 'Outstanding soundstage and ANC quality',
    comment: 'The noise cancellation completely blocks office noise. Super crisp highs and punchy bass without distortion. Very comfortable pads for long sessions.',
    isVerifiedPurchase: true,
  });

  console.log('[Seed] Creating system notifications...');
  await Notification.create({
    recipient: seller1._id,
    title: 'Low Stock Alert',
    message: 'Item "Veloce Chroma Smartwatch Gen-4" has only 4 units left in inventory!',
    type: 'LOW_STOCK',
    link: '/seller/inventory',
  });

  await Notification.create({
    recipient: admin._id,
    title: 'New Seller Registration',
    message: 'Store "Pulse Gear Store" submitted an onboarding application for review.',
    type: 'APPROVAL',
    link: '/admin/sellers',
  });

  console.log('[Seed] Database successfully populated with realistic demo records!');
};

// Auto-sync function to verify or update demo evaluation profiles without resetting the database
export const ensureDemoProfiles = async () => {
  try {
    console.log('[DemoProfiles] Verifying demo evaluation profiles...');

    // 1. Admin Console: Lakshmisiri Pachigalla (lsiri4429@gmail.com)
    let admin = await User.findOne({ email: 'lsiri4429@gmail.com' });
    if (!admin) {
      admin = await User.findOne({ email: 'admin@stocksphere.com' });
      if (admin) {
        admin.name = 'Lakshmisiri Pachigalla';
        admin.email = 'lsiri4429@gmail.com';
        admin.role = 'Admin';
        admin.password = 'password123';
        admin.avatar = '/avatars/lakshmisiri.jpg';
        await admin.save();
        console.log('[DemoProfiles] Migrated Admin to Lakshmisiri Pachigalla (lsiri4429@gmail.com)');
      } else {
        admin = await User.create({
          name: 'Lakshmisiri Pachigalla',
          email: 'lsiri4429@gmail.com',
          password: 'password123',
          role: 'Admin',
          phone: '+91 98765 43210',
          avatar: '/avatars/lakshmisiri.jpg',
          isActive: true,
        });
        console.log('[DemoProfiles] Created Admin Lakshmisiri Pachigalla');
      }
    } else {
      admin.name = 'Lakshmisiri Pachigalla';
      admin.role = 'Admin';
      admin.password = 'password123';
      admin.avatar = '/avatars/lakshmisiri.jpg';
      await admin.save();
    }

    // 2. Approved Seller: Sowmya Katta (sowmyakatta1@gmail.com)
    let sellerApproved = await User.findOne({ email: 'sowmyakatta1@gmail.com' });
    if (!sellerApproved) {
      sellerApproved = await User.findOne({ email: 'seller1@stocksphere.com' });
      if (sellerApproved) {
        sellerApproved.name = 'Sowmya Katta';
        sellerApproved.email = 'sowmyakatta1@gmail.com';
        sellerApproved.password = 'password123';
        sellerApproved.role = 'Seller';
        sellerApproved.avatar = '/avatars/sowmya.jpg';
        sellerApproved.sellerDetails = sellerApproved.sellerDetails || {};
        sellerApproved.sellerDetails.approvalStatus = 'Approved';
        sellerApproved.sellerDetails.storeName = sellerApproved.sellerDetails.storeName || 'TechNova Electronics';
        await sellerApproved.save();
        console.log('[DemoProfiles] Migrated Approved Seller to Sowmya Katta (sowmyakatta1@gmail.com)');
      } else {
        sellerApproved = await User.create({
          name: 'Sowmya Katta',
          email: 'sowmyakatta1@gmail.com',
          password: 'password123',
          role: 'Seller',
          phone: '+91 98111 22334',
          avatar: '/avatars/sowmya.jpg',
          isActive: true,
          sellerDetails: {
            storeName: 'TechNova Electronics',
            storeDescription: 'Authorized premium electronics, audiophile gear and smart accessories.',
            businessRegistrationNumber: 'TN-ELEC-2023-8871',
            taxId: 'GSTIN27AABCS1429B1Z',
            storeAddress: '402 Cyber Hub, DLF Phase 2, Gurugram, HR',
            approvalStatus: 'Approved',
            approvedAt: new Date(),
          },
        });
        console.log('[DemoProfiles] Created Approved Seller Sowmya Katta');
      }
    } else {
      sellerApproved.name = 'Sowmya Katta';
      sellerApproved.password = 'password123';
      sellerApproved.avatar = '/avatars/sowmya.jpg';
      sellerApproved.sellerDetails = sellerApproved.sellerDetails || {};
      sellerApproved.sellerDetails.approvalStatus = 'Approved';
      await sellerApproved.save();
    }

    // 3. Pending Seller: Sowmya Katta (sowmyakatta1+pending@gmail.com)
    let sellerPending = await User.findOne({ email: 'sowmyakatta1+pending@gmail.com' });
    if (!sellerPending) {
      sellerPending = await User.findOne({ email: 'seller3@stocksphere.com' });
      if (sellerPending) {
        sellerPending.name = 'Sowmya Katta';
        sellerPending.email = 'sowmyakatta1+pending@gmail.com';
        sellerPending.password = 'password123';
        sellerPending.role = 'Seller';
        sellerPending.avatar = '/avatars/sowmya.jpg';
        sellerPending.sellerDetails = sellerPending.sellerDetails || {};
        sellerPending.sellerDetails.approvalStatus = 'Pending';
        sellerPending.sellerDetails.storeName = sellerPending.sellerDetails.storeName || 'Pulse Gear Store';
        await sellerPending.save();
        console.log('[DemoProfiles] Migrated Pending Seller to Sowmya Katta (sowmyakatta1+pending@gmail.com)');
      } else {
        sellerPending = await User.create({
          name: 'Sowmya Katta',
          email: 'sowmyakatta1+pending@gmail.com',
          password: 'password123',
          role: 'Seller',
          phone: '+91 98333 44556',
          avatar: '/avatars/sowmya.jpg',
          isActive: true,
          sellerDetails: {
            storeName: 'Pulse Gear Store',
            storeDescription: 'Athletic tech, smart tracking apparel and fitness hardware.',
            businessRegistrationNumber: 'PULSE-FIT-5512',
            taxId: 'GSTIN24PULSE9921D1Z',
            storeAddress: '12 SG Highway, Ahmedabad, GJ',
            approvalStatus: 'Pending',
          },
        });
        console.log('[DemoProfiles] Created Pending Seller Sowmya Katta');
      }
    } else {
      sellerPending.name = 'Sowmya Katta';
      sellerPending.password = 'password123';
      sellerPending.avatar = '/avatars/sowmya.jpg';
      sellerPending.sellerDetails = sellerPending.sellerDetails || {};
      sellerPending.sellerDetails.approvalStatus = 'Pending';
      await sellerPending.save();
    }

    // 4. Customer Demo: Lakshmisiri Pachigalla (lsiri4429+customer@gmail.com)
    let customer = await User.findOne({ email: 'lsiri4429+customer@gmail.com' });
    if (!customer) {
      customer = await User.findOne({ email: 'customer@stocksphere.com' });
      if (customer) {
        customer.name = 'Lakshmisiri Pachigalla';
        customer.email = 'lsiri4429+customer@gmail.com';
        customer.password = 'password123';
        customer.role = 'Customer';
        customer.avatar = '/avatars/lakshmisiri.jpg';
        await customer.save();
        console.log('[DemoProfiles] Migrated Customer to Lakshmisiri Pachigalla (lsiri4429+customer@gmail.com)');
      } else {
        customer = await User.create({
          name: 'Lakshmisiri Pachigalla',
          email: 'lsiri4429+customer@gmail.com',
          password: 'password123',
          role: 'Customer',
          phone: '+91 98444 55667',
          avatar: '/avatars/lakshmisiri.jpg',
          isActive: true,
        });
        console.log('[DemoProfiles] Created Customer Lakshmisiri Pachigalla');
      }
    } else {
      customer.name = 'Lakshmisiri Pachigalla';
      customer.password = 'password123';
      customer.avatar = '/avatars/lakshmisiri.jpg';
      customer.role = 'Customer';
      await customer.save();
    }

    console.log('[DemoProfiles] All 4 evaluation demo profiles are synchronized.');
  } catch (err) {
    console.error('[DemoProfiles] Profile sync notice:', err.message);
  }
};
