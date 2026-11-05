import React from 'react';
import {
  Boxes,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Database,
  FileText,
  CreditCard,
  Bell,
  Cpu,
} from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-royal-50 border border-royal-200 text-royal-700 text-xs font-semibold">
          <Boxes className="w-4 h-4" />
          <span>B.Tech 3rd-Year MERN Stack Capstone</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          StockSphere System Architecture & Engineering Principles
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          A high-reliability inventory synchronization and multi-vendor e-commerce platform engineered with atomic database operations, real-time WebSockets, secure payments, and auditable stock movement ledgers.
        </p>
      </div>

      {/* Tech Stack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-royal-50 text-royal-600 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">React & Vite Frontend</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Constructed with Vite for ultra-fast HMR, Tailwind CSS customized with SaaS Navy/Royal/Teal palette, React Router v6, Axios interceptors, and Recharts.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Node.js & MongoDB</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Express REST APIs with Mongoose ODM modeling 11 interconnected relational collections, atomic stock decrements, and automated in-memory fallback.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Payment & Invoicing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Full Razorpay test integration with HMAC-SHA256 signature verification, frictionless demo mode simulation, and streaming PDF tax invoice generation via PDFKit.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Socket.IO WebSockets</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bidirectional WebSocket pipelines broadcasting low-stock alerts, out-of-stock events, and real-time order status timeline transitions to connected clients.
          </p>
        </div>
      </div>

      {/* Deep Dive: Inventory Concurrency Safety */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl text-white p-8 md:p-12 border border-navy-700">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Core Capstone Innovation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How StockSphere Guarantees Zero Overselling
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            In standard web applications, race conditions allow two customers to purchase the last unit simultaneously. StockSphere solves this using MongoDB atomic conditional operations:
          </p>
        </div>

        <div className="mt-6 bg-navy-950 p-4 sm:p-6 rounded-xl border border-navy-700 font-mono text-xs text-slate-300 overflow-x-auto">
          <p className="text-slate-500">// Safe Atomic Stock Deduction at Checkout</p>
          <p className="text-teal-400 mt-1">const updated = await Product.findOneAndUpdate(&#123;</p>
          <p className="pl-4 text-slate-300">_id: item.productId,</p>
          <p className="pl-4 text-royal-300 font-bold">stock: &#123; $gte: item.quantity &#125; // Atomic lock condition</p>
          <p className="text-teal-400">&#125;, &#123;</p>
          <p className="pl-4 text-royal-300 font-bold">$inc: &#123; stock: -item.quantity &#125;</p>
          <p className="text-teal-400">&#125;, &#123; new: true &#125;);</p>
          <p className="text-slate-500 mt-2">// If updated === null, stock was insufficient &rarr; rollback cleanly &amp; reject</p>
        </div>
      </div>

      {/* Role Responsibility Matrix */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Three-Tier Role Responsibility Matrix
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center space-x-2 font-bold text-sm text-navy-900">
              <span className="w-3 h-3 rounded-full bg-navy-900" />
              <span>Platform Administrator</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Approve or reject seller onboarding applications</li>
              <li>Toggle active / blocked status on suspicious accounts</li>
              <li>Manage platform categories and global order ledger</li>
              <li>Monitor platform-wide revenue and transaction fee payouts</li>
              <li>Inspect low-stock products across all registered sellers</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center space-x-2 font-bold text-sm text-royal-600">
              <span className="w-3 h-3 rounded-full bg-royal-600" />
              <span>Verified Seller</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Create and update products with unique SKUs</li>
              <li>Manage inventory, re-stocks, and low-stock threshold triggers</li>
              <li>Track incoming buyer orders and update status timelines</li>
              <li>Receive real-time Socket.IO low-stock and out-of-stock alerts</li>
              <li>Download CSV sales reports and track revenue charts</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center space-x-2 font-bold text-sm text-teal-600">
              <span className="w-3 h-3 rounded-full bg-teal-600" />
              <span>Registered Customer</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Search, filter by price and category, and inspect SKU specs</li>
              <li>Maintain synchronized Cart and persistent Wishlist</li>
              <li>Checkout securely with Razorpay or 1-click Demo payment</li>
              <li>Real-time visual order status tracking timeline</li>
              <li>Stream and download PDF tax invoices with itemized GST</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
