import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="w-8 h-8 border-3 border-royal-200 border-t-royal-600 rounded-full animate-spin" />
      <span className="text-xs font-medium text-slate-500">{text}</span>
    </div>
  );
};

export const EmptyState = ({ title = 'No items found', description, actionLabel, onAction, icon: Icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200 shadow-subtle">
      {Icon && (
        <div className="p-3 bg-slate-100 text-slate-400 rounded-full mb-3">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      {description && <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-navy-900 hover:bg-royal-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
