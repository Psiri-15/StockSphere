# StockSphere – Smart Inventory & E-Commerce Management System

> **B.Tech 3rd-Year MERN Stack Capstone Project**  
> A high-concurrency, enterprise-grade multi-vendor e-commerce platform featuring atomic inventory locks, zero-overselling guarantees, real-time WebSocket synchronization, Razorpay payment processing, and automated PDF tax invoicing.

---

## 🌟 Key Features & Innovations

### 1. Robust Inventory Management (Zero Overselling)
- **Atomic Stock Deductions:** Implements MongoDB `$gte` conditional updates (`{ _id: item.productId, stock: { $gte: item.quantity } }`) to guarantee stock never drops below zero, even under intense concurrent buyer checkouts.
- **Auditable Movement Ledger:** Every stock alteration (`INITIAL_STOCK`, `SALE_DEDUCTION`, `PURCHASE_RESTOCK`, `ORDER_CANCELLATION_RESTORE`, `MANUAL_ADJUSTMENT`, `DAMAGE_WRITE_OFF`) is permanently recorded with user ID, SKU, previous stock, new stock, and timestamp.
- **Unique System SKUs:** Deterministically generated SKU tags (`AUD-SON-9821`, `HOM-PUR-6623`, etc.) for every product variant.
- **Automated Restocking:** When an order is cancelled or refunded, stock is atomically incremented back into active inventory.
- **Real-Time Threshold Alerts:** Pushes instant WebSocket alerts to sellers and admins when stock falls below `lowStockThreshold`.

### 2. Multi-Vendor Commerce Architecture
- **Three-Tier User Roles:** Complete separation of privileges for **Admin**, **Seller**, and **Customer**.
- **Seller Onboarding & Verification:** Sellers apply with Business Registration and GSTIN details. Publishing capabilities are locked until an Admin approves the merchant.
- **Itemized Seller Payouts:** Automatically calculates 5% platform commission fees and logs net merchant credit payouts per order.

### 3. Payment Processing & Invoice Generation
- **Dual Payment Engine:**
  - **Live Razorpay Gateway:** Integrates backend order creation (`/api/payments/create-order`) and HMAC-SHA256 signature verification (`/api/payments/verify`).
  - **1-Click Demo Evaluation Mode:** Frictionless simulation mode allowing immediate checkout evaluation even when external payment credentials are not configured.
- **Streaming PDF Invoices:** Built with PDFKit to dynamically generate branded tax invoices with itemized tables, GST calculations, and download links.

### 4. Interactive Dashboards & Real-Time Sync
- **Recharts Data Visualization:** Monthly revenue trajectories, 7-day velocity charts, and order status donut charts.
- **Socket.IO Event Mesh:** Real-time toast notifications, inventory updates, and order timeline transitions across connected browser tabs.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React, Socket.IO Client |
| **Backend** | Node.js, Express.js (ES Modules), Socket.IO, PDFKit, Multer, Cloudinary, Razorpay SDK, Morgan, bcryptjs, jsonwebtoken |
| **Database** | MongoDB Atlas / Local MongoDB / Zero-Config Embedded Memory Fallback |
| **Styling Palette** | SaaS Deep Navy (`#0B192C`), Royal Blue (`#2563EB`), Accent Teal (`#0D9488`), Surface (`#F8FAFC`) |

---

## 👥 Demo Accounts for Examination

StockSphere includes seeded accounts for 1-click evaluation. Use the buttons on the Login page or log in with:

| Role | Email Address | Password | Role Description |
|---|---|---|---|
| **Admin** | `admin@stocksphere.com` | `password123` | Platform-wide oversight, seller approvals, category & user management |
| **Approved Seller** | `seller1@stocksphere.com` | `password123` | Store: *TechNova Electronics* – Catalog & inventory controls |
| **Approved Seller** | `seller2@stocksphere.com` | `password123` | Store: *Aura Home & Living* – Modern minimalist decor |
| **Pending Seller** | `seller3@stocksphere.com` | `password123` | Store: *Pulse Gear Store* – Demonstrates onboarding approval queue |
| **Customer** | `customer@stocksphere.com` | `password123` | Name: *Aryan Sharma* – Active buyer profile with order history |

---

## 📂 Project Structure

```
StockSphere/
├── backend/
│   ├── config/             # DB, Cloudinary, and Razorpay setup
│   ├── controllers/        # Express REST controllers
│   ├── middleware/         # JWT auth, RBAC, multer, error handlers
│   ├── models/             # 11 Mongoose relational schemas
│   ├── routes/             # Express API routes
│   ├── services/           # Inventory atomic service, PDF invoice generator
│   ├── utils/              # SKU generator, token helper, seed script
│   ├── server.js           # Server entry point + Socket.IO server
│   ├── .env.example        # Environment variable template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI cards, tables, badges, navbar, sidebar
│   │   ├── context/        # Auth, Cart, Wishlist, and Socket contexts
│   │   ├── layouts/        # MainLayout, DashboardLayout
│   │   ├── pages/          # Storefront, Seller, Customer, and Admin pages
│   │   ├── services/       # Axios API client with interceptors
│   │   ├── App.jsx         # React Router route registry
│   │   └── main.jsx
│   ├── tailwind.config.js  # SaaS Deep Navy & Teal theme
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
├── package.json            # Root workspace orchestrator
├── README.md
└── .gitignore
```

---

## 🗄️ Database Collections (11 Mongoose Relational Schemas)

1. **Users:** Admin, Seller, Customer records with password hash, profile avatar, active flag, and seller legal details.
2. **Products:** SKU, name, description, brand, pricing, category reference, seller reference, stock quantity, lowStockThreshold, rating.
3. **Categories:** Classification names, unique slugs, images, and active state.
4. **InventoryTransactions:** Audit movement records capturing delta, prior stock, new stock, change type, and order reference.
5. **Carts:** User reference and array of product references with quantities and real-time prices.
6. **Orders:** Snapshot of product details at purchase time, shipping address, timeline milestones, payment statuses.
7. **Payments:** Payment transactions, Razorpay IDs, HMAC signatures, failure reasons, and settlement metadata.
8. **Notifications:** Socket-enabled alerts for low stock, out of stock, seller approval, and order status updates.
9. **Reviews:** Customer reviews, 1-to-5 star ratings, and verified purchase flags.
10. **Transactions:** Financial ledger recording merchant sale credits, 5% platform commissions, and net payouts.
11. **Addresses:** Saved user shipping addresses with default address flag.

---

## 🚀 Installation & Local Execution

### Prerequisites
- **Node.js:** v18+ (tested on Node v20/v24)
- **MongoDB:** MongoDB Atlas connection string or local MongoDB (`mongodb://127.0.0.1:27017`)

### 1. Clone & Install Dependencies
Run the installation command from the repository root:
```bash
npm run install:all
```

### 2. Environment Configuration
Create `.env` in both `backend` and `frontend`:

**backend/.env:**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/stocksphere
JWT_SECRET=stocksphere_super_secret_jwt_key_2025_secure_random
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_placeholder_key
RAZORPAY_KEY_SECRET=rzp_secret_placeholder_key
ENABLE_DEMO_PAYMENT=true
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder_key
```

### 3. Seed Realistic Demo Database
Populate the database with sample products, categories, users, orders, and audit transactions:
```bash
npm run seed
```

### 4. Start the Application
Start both backend API and frontend Vite servers concurrently:
```bash
npm run dev
```

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend REST API:** [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 12-Step Complete Capstone Workflow Demonstration

To evaluate the complete end-to-end flow in under 5 minutes:

1. **Sign In as Customer:** On the login page, click **Customer Demo** (`customer@stocksphere.com`).
2. **Browse Marketplace:** Go to **Products**, search for *"Headphones"*, or filter by *"Electronics & Gadgets"*.
3. **Inspect Inventory Status:** Open **SonicPro Wireless ANC Headphones**. Notice the verified stock count and SKU chip.
4. **Add to Cart:** Add 1 unit to cart and navigate to **My Cart**.
5. **Checkout:** Click **Proceed to Checkout**, select the saved address, choose **Instant Demo Payment** (or Razorpay), and click **Confirm & Pay**.
6. **Atomic Deduction:** Notice the immediate confirmation banner. The product stock in the database is automatically decremented by 1.
7. **Track Order:** The visual progress stepper shows **Confirmed**. Notice the audit timeline updates.
8. **Download Invoice:** Click **PDF Tax Invoice** to stream and download the computer-generated invoice with 5% GST breakdown.
9. **Log In as Seller:** Sign out and click **Approved Seller** (`seller1@stocksphere.com`).
10. **Seller Console:** Open **Inventory Audit**. Notice the decremented stock count and inspect the **Auditable Movement Ledger** row reflecting the `SALE_DEDUCTION`.
11. **Update Fulfillment:** Go to **Orders Received**, click **Update Status**, change status to **Shipped**, and add tracking number `BLUEDART-889123`.
12. **Admin Supervision:** Sign in as **Admin** (`admin@stocksphere.com`). Review platform revenue charts on **Admin Dashboard**, approve pending sellers in **Seller Approvals**, and inspect merchant payouts in **Transactions**.

---

## 🛡️ Security Best Practices
- Passwords encrypted with **bcrypt** (salt rounds = 10).
- Stateless **JWT** authentication with HTTP header verification.
- Protected route middleware with strict Role-Based Access Control (**RBAC**).
- Seller authorization checks guaranteeing merchants can only modify their own inventory and products.
- Rate limiting on authentication endpoints to defend against brute-force attacks.
- HMAC-SHA256 signature verification for Razorpay payment webhooks and callbacks.
