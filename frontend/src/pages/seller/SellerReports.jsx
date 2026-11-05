import React, { useState } from 'react';
import { FileSpreadsheet, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const SellerReports = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadReport = async () => {
    setDownloading(true);
    setDownloadSuccess(false);
    try {
      const res = await api.get('/seller/reports/sales', {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `StockSphere-SellerSalesReport-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloadSuccess(true);
    } catch (err) {
      alert('Failed to generate sales report.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales & Inventory Reports</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Export auditable CSV reports for bookkeeping, tax compliance, and performance audits
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl flex-shrink-0">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Complete Sales & SKU Movement Export
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl">
              Includes itemized sales records: Order Numbers, Order Dates, Item Names, SKUs, Units Sold, Selling Prices, Order Fulfillment Statuses, and Payment Settlement records.
            </p>
          </div>
        </div>

        {downloadSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>CSV Report generated and downloaded to your computer successfully!</span>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Verified against MongoDB transaction ledgers</span>
          </div>

          <button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="px-5 py-2.5 bg-navy-900 hover:bg-royal-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Compiling CSV Ledger...' : 'Download CSV Sales Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerReports;
