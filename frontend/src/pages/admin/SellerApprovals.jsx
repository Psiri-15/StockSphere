import React, { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle, XCircle, Store, ShieldCheck, Mail, Phone, MapPin, FileText } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';

export const SellerApprovals = () => {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchPending = async () => {
    try {
      const res = await api.get('/admin/sellers?status=Pending');
      if (res.data.success) {
        setPendingSellers(res.data.sellers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (sellerId, storeName) => {
    if (!window.confirm(`Approve seller application for "${storeName}"?`)) return;
    setProcessing(true);
    try {
      const res = await api.put(`/admin/sellers/${sellerId}/approval`, {
        status: 'Approved',
      });
      if (res.data.success) {
        setPendingSellers(pendingSellers.filter((s) => s._id !== sellerId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenReject = (seller) => {
    setSelectedSeller(seller);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await api.put(`/admin/sellers/${selectedSeller._id}/approval`, {
        status: 'Rejected',
        rejectionReason: rejectionReason || 'Information could not be verified.',
      });
      if (res.data.success) {
        setRejectModalOpen(false);
        setPendingSellers(pendingSellers.filter((s) => s._id !== selectedSeller._id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving pending seller applications..." />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Seller Onboarding Approvals
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review business registration numbers, tax credentials, and verify new store applications ({pendingSellers.length} pending)
        </p>
      </div>

      {pendingSellers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-card text-center">
          <EmptyState
            icon={CheckSquare}
            title="All Applications Processed"
            description="There are currently zero pending seller onboarding applications in the review queue."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingSellers.map((seller) => {
            const details = seller.sellerDetails || {};
            return (
              <div
                key={seller._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Pending Verification
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                        {details.storeName || 'Store Name Not Provided'}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-royal-50 text-royal-600 flex items-center justify-center font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                  </div>

                  {details.storeDescription && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      "{details.storeDescription}"
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <p className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>Applicant: <strong>{seller.name}</strong></span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{seller.email}</span>
                    </p>
                    {seller.phone && (
                      <p className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>{seller.phone}</span>
                      </p>
                    )}
                    <p className="flex items-center space-x-2 font-mono text-[11px]">
                      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>Reg: {details.businessRegistrationNumber || 'N/A'} | GST: {details.taxId || 'N/A'}</span>
                    </p>
                    {details.storeAddress && (
                      <p className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{details.storeAddress}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => handleOpenReject(seller)}
                    disabled={processing}
                    className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleApprove(seller._id, details.storeName)}
                    disabled={processing}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Seller</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-elevated border border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reject Application: {selectedSeller.sellerDetails?.storeName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide a reason that will be communicated to the merchant.
              </p>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rejection Reason
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Invalid tax identification number or unverified documentation."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm transition-colors"
                >
                  {processing ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerApprovals;
