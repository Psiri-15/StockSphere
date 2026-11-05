import React, { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink, AlertTriangle, XCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';

export const SellerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving seller notifications..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Inventory Alarms & Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time low-stock warnings, order notices, and administrative updates
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="px-3.5 py-1.5 bg-royal-50 hover:bg-royal-100 text-royal-700 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="Your inventory is healthy and you have no unread notifications."
            />
          </div>
        ) : (
          notifications.map((n) => {
            const isAlert = n.type === 'LOW_STOCK' || n.type === 'OUT_OF_STOCK';
            return (
              <div
                key={n._id}
                className={`p-5 flex items-start space-x-4 transition-colors ${
                  !n.isRead ? 'bg-royal-50/40' : 'hover:bg-slate-50/60'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    n.type === 'OUT_OF_STOCK'
                      ? 'bg-rose-100 text-rose-600'
                      : n.type === 'LOW_STOCK'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-royal-100 text-royal-600'
                  }`}
                >
                  {n.type === 'OUT_OF_STOCK' ? (
                    <XCircle className="w-5 h-5" />
                  ) : n.type === 'LOW_STOCK' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <ShoppingBag className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  {n.link && (
                    <Link
                      to={n.link}
                      className="mt-2 inline-flex items-center space-x-1 text-[11px] font-bold text-royal-600 hover:text-royal-800"
                    >
                      <span>Take Action</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SellerNotifications;
