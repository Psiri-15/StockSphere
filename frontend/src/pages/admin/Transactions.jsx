import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';

export const Transactions = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setData(res.data.analytics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Retrieving financial ledger..." />;
  }

  const transactions = data?.recentTransactions || [];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Financial Ledger</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Auditable record of merchant sales credits, commission fee retention (5%), and payouts
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState
              icon={CreditCard}
              title="No transactions logged"
              description="Confirmed customer checkouts will automatically credit seller accounts and record platform fees here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Merchant / Store</th>
                  <th className="py-3 px-5">Transaction Type</th>
                  <th className="py-3 px-5">Gross Sale</th>
                  <th className="py-3 px-5">Platform Fee (5%)</th>
                  <th className="py-3 px-5">Net Payout</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-900 block">
                        {tx.user?.sellerDetails?.storeName || tx.user?.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{tx.user?.email}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                        <span>{tx.type}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-800">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-semibold">
                      ₹{tx.platformFee.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5 font-extrabold text-slate-900">
                      ₹{tx.netAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
