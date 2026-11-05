import React, { useState } from 'react';
import { Store, ShieldCheck, MapPin, FileText, CheckCircle2, User } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';

export const SellerProfile = () => {
  const { user, updateProfile } = useAuth();
  const [storeName, setStoreName] = useState(user?.sellerDetails?.storeName || '');
  const [storeDescription, setStoreDescription] = useState(user?.sellerDetails?.storeDescription || '');
  const [storeAddress, setStoreAddress] = useState(user?.sellerDetails?.storeAddress || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await updateProfile({
        sellerDetails: {
          storeName,
          storeDescription,
          storeAddress,
        },
      });
      setMsg({ type: 'success', text: 'Store profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Settings & Legal Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Public storefront configuration, registration details, and warehouse origin
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
        {/* Verification Status Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Store className="w-6 h-6 text-royal-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-xs text-slate-900">
                {user?.sellerDetails?.storeName || 'Storefront'}
              </p>
              <p className="text-[11px] text-slate-500">
                Business Reg: {user?.sellerDetails?.businessRegistrationNumber || 'N/A'} &bull; GSTIN: {user?.sellerDetails?.taxId || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Approval Status:</span>
            <StatusBadge status={user?.sellerDetails?.approvalStatus || 'Pending'} />
          </div>
        </div>

        {msg && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
            }`}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name *</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Storefront Description & Bio
            </label>
            <textarea
              rows={3}
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Warehouse / Fulfillment Dispatch Address
            </label>
            <input
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-navy-900 hover:bg-royal-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Store Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerProfile;
