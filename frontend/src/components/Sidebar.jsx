import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  CheckSquare,
  Package,
  Layers,
  ShoppingBag,
  CreditCard,
  BarChart3,
  PlusCircle,
  Sliders,
  Bell,
  FileSpreadsheet,
  UserCheck,
  Heart,
  ShoppingCart,
  LogOut,
  MapPin,
  Boxes,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Manage Sellers', path: '/admin/sellers', icon: Store },
    { name: 'Seller Approvals', path: '/admin/approvals', icon: CheckSquare },
    { name: 'All Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'All Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Transactions', path: '/admin/transactions', icon: CreditCard },
  ];

  const sellerLinks = [
    { name: 'Dashboard', path: '/seller/dashboard', icon: LayoutDashboard },
    { name: 'My Products', path: '/seller/products', icon: Package },
    { name: 'Add Product', path: '/seller/products/new', icon: PlusCircle },
    { name: 'Inventory Audit', path: '/seller/inventory', icon: Sliders },
    { name: 'Orders Received', path: '/seller/orders', icon: ShoppingBag },
    { name: 'Low Stock Alerts', path: '/seller/notifications', icon: Bell },
    { name: 'Sales Reports', path: '/seller/reports', icon: FileSpreadsheet },
    { name: 'Store Profile', path: '/seller/profile', icon: UserCheck },
  ];

  const customerLinks = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
    { name: 'My Cart', path: '/cart', icon: ShoppingCart },
    { name: 'Profile & Addresses', path: '/customer/profile', icon: MapPin },
  ];

  const links = role === 'Admin' ? adminLinks : role === 'Seller' ? sellerLinks : customerLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-navy-900 text-slate-300 flex flex-col justify-between border-r border-navy-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-navy-800">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-royal-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <Boxes className="w-4 h-4 text-teal-300" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                Stock<span className="text-teal-400">Sphere</span>
              </span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* User Profile Pill */}
          <div className="p-4 mx-3 my-3 bg-navy-800/60 rounded-xl border border-navy-700/50 flex items-center space-x-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover border border-royal-500/40"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-royal-900/80 text-royal-300 border border-royal-700/50">
                {role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {role} Menu
            </p>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-royal-600 text-white shadow-sm font-bold'
                        : 'text-slate-400 hover:bg-navy-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-navy-800 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-center w-full py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-navy-800 hover:bg-navy-700 rounded-lg transition-colors"
          >
            ← View Public Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full py-2 px-3 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
