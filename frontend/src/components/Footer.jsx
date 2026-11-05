import React from 'react';
import { Link } from 'react-router-dom';
import { Boxes, ShieldCheck, Zap, RefreshCw, Award, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-navy-900 text-slate-400 text-xs border-t border-navy-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-navy-800">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-royal-600 rounded-lg flex items-center justify-center text-white">
                <Boxes className="w-5 h-5 text-teal-300" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">Stock<span className="text-teal-400">Sphere</span></span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              High-concurrency Smart Inventory & Multi-Seller E-Commerce Management System built for B.Tech CSE / IT capstone evaluation.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-navy-800 text-teal-400 border border-teal-500/30">
                MERN Stack
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-navy-800 text-royal-400 border border-royal-500/30">
                Socket.IO
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-navy-800 text-amber-400 border border-amber-500/30">
                Razorpay
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Platform Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="hover:text-white transition-colors">Catalog & Products</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">System Architecture</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Engineering Support</Link></li>
              <li><Link to="/seller/register" className="hover:text-teal-400 transition-colors">Seller Onboarding</Link></li>
            </ul>
          </div>

          {/* Roles */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">User Portals</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-white transition-colors">Admin Gateway</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Seller Console</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Customer Portal</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Real-time Cart</Link></li>
            </ul>
          </div>

          {/* Inventory Safety Pillars */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Enterprise Guarantees</h4>
            <ul className="space-y-2.5 text-[11px]">
              <li className="flex items-center space-x-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>Zero-Overselling Atomic Locks</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-300">
                <Zap className="w-4 h-4 text-royal-400 flex-shrink-0" />
                <span>Instant WebSocket Stock Broadcasts</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-300">
                <RefreshCw className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Automated Cancellation Restocking</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-300">
                <Award className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Immutable Auditable Inventory Ledgers</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>&copy; {new Date().getFullYear()} StockSphere – Smart Inventory & E-Commerce Management System. All rights reserved.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Crafted for B.Tech Capstone Demonstration
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
