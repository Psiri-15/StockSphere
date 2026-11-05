import React from 'react';

const statusStyles = {
  // Order Statuses
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  Processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',

  // Payment Statuses
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Failed: 'bg-rose-50 text-rose-700 border-rose-200',
  Refunded: 'bg-slate-100 text-slate-700 border-slate-300',

  // Stock Statuses
  IN_STOCK: 'bg-teal-50 text-teal-700 border-teal-200',
  LOW_STOCK: 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse',
  OUT_OF_STOCK: 'bg-rose-50 text-rose-700 border-rose-300',

  // Roles & Approvals
  Admin: 'bg-navy-900 text-white border-navy-800',
  Seller: 'bg-royal-50 text-royal-700 border-royal-200',
  Customer: 'bg-slate-100 text-slate-700 border-slate-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const StatusBadge = ({ status, label }) => {
  const displayLabel = label || status?.replace('_', ' ') || 'Unknown';
  const style = statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} transition-colors`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
