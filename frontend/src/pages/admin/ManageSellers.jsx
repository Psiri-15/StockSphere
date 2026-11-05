import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, XCircle, Clock, ShieldCheck, Mail, MapPin } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const ManageSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchSellers = async () => {
    try {
      const res = await api.get(`/admin/sellers${statusFilter ? `?status=${statusFilter}` : ''}`);
      if (res.data.success) {
        setSellers(res.data.sellers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [statusFilter]);

  const handleUpdateApproval = async (id, status) => {
    if (!window.confirm(`Set status to ${status}?`)) return;
    try {
      const res = await api.put(`/admin/sellers/${id}/approval`, { status });
      if (res.data.success) {
        setSellers(
          sellers.map((s) =>
            s._id === id
              ? { ...s, sellerDetails: { ...s.sellerDetails, approvalStatus: status } }
              : s
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading sellers registry..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Merchants & Sellers Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of all onboarding applications, approved stores, and merchant status ({sellers.length} total)
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 shadow-sm"
          >
            <option value="">All Statuses</option>
            <option value="Approved">Approved Only</option>
            <option value="Pending">Pending Review</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Storefront Name</th>
                <th className="py-3 px-5">Merchant Owner</th>
                <th className="py-3 px-5">Registration & Tax ID</th>
                <th className="py-3 px-5">Warehouse City</th>
                <th className="py-3 px-5">Approval Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {sellers.map((s) => {
                const details = s.sellerDetails || {};
                const approval = details.approvalStatus || 'Pending';
                return (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-extrabold text-slate-900 block text-xs">
                        {details.storeName || 'Unnamed Store'}
                      </span>
                      <span className="text-[10px] text-slate-400 max-w-xs truncate block">
                        {details.storeDescription || 'No description provided'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-800 block">{s.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{s.email}</span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-600">
                      <div>Reg: {details.businessRegistrationNumber || 'N/A'}</div>
                      <div className="text-slate-400">GST: {details.taxId || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate">
                      {details.storeAddress || 'Not specified'}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={approval} />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      {approval !== 'Approved' && (
                        <button
                          onClick={() => handleUpdateApproval(s._id, 'Approved')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {approval !== 'Rejected' && (
                        <button
                          onClick={() => handleUpdateApproval(s._id, 'Rejected')}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageSellers;
