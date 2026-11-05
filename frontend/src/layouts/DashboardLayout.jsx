import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import { Menu, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, sellerApproved } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-navy-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-slate-800 tracking-tight flex items-center space-x-2">
              <span className="text-royal-600 font-extrabold">{role}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600 font-medium">Console</span>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <NotificationDropdown />
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center space-x-2">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <span className="hidden sm:inline text-xs font-semibold text-slate-700">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Warning Banner if Seller is Pending Approval */}
        {role === 'Seller' && !sellerApproved && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 px-6 flex items-center space-x-3 text-amber-800">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-bold">
                Seller Account Status: {user?.sellerDetails?.approvalStatus || 'Pending Review'}
              </p>
              <p className="text-amber-700 mt-0.5">
                Your onboarding application is under administrative review. Once approved, product publishing and stock updates will unlock immediately.
              </p>
            </div>
          </div>
        )}

        {/* Outlet Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
