import React, { useState, useEffect } from 'react';
import {
  Sliders,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  ArrowUpDown,
  History,
  FileSpreadsheet,
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const SellerInventory = () => {
  const [activeTab, setActiveTab] = useState('status'); // 'status' or 'ledger'
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Adjustment Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityChange, setQuantityChange] = useState('');
  const [changeType, setChangeType] = useState('PURCHASE_RESTOCK');
  const [notes, setNotes] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  const { socket } = useSocket();

  const fetchInventoryData = async () => {
    try {
      const [invRes, sumRes, txnRes] = await Promise.all([
        api.get(`/inventory/status${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`),
        api.get('/inventory/summary'),
        api.get('/inventory/transactions?limit=25'),
      ]);

      if (invRes.data.success) setInventory(invRes.data.inventory);
      if (sumRes.data.success) setSummary(invRes.data.inventory ? sumRes.data.summary : null);
      if (txnRes.data.success) setTransactions(txnRes.data.transactions);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [statusFilter]);

  // Listen to live WebSocket stock updates
  useEffect(() => {
    if (socket) {
      socket.on('stock_updated', () => {
        fetchInventoryData();
      });
    }
  }, [socket]);

  const handleOpenAdjustModal = (item) => {
    setSelectedProduct(item);
    setQuantityChange('');
    setChangeType('PURCHASE_RESTOCK');
    setNotes('');
    setAdjustError('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setAdjustSubmitting(true);
    setAdjustError('');

    try {
      const res = await api.post('/inventory/adjust', {
        productId: selectedProduct._id,
        quantityChange: Number(quantityChange),
        changeType,
        notes,
      });

      if (res.data.success) {
        setAdjustModalOpen(false);
        fetchInventoryData();
      }
    } catch (err) {
      setAdjustError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
  });

  if (loading) {
    return <LoadingSpinner text="Connecting to real-time inventory ledger..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Real-Time Inventory Engine</span>
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atomic SKU stock tracking, threshold alarms, and auditable movement records
          </p>
        </div>

        <button
          onClick={fetchInventoryData}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-royal-600" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total SKUs"
            value={summary.totalSKUs}
            color="blue"
            subtitle="Catalog product variants"
          />
          <StatCard
            title="Total Units"
            value={summary.totalUnits}
            color="blue"
            subtitle="In warehouse stock"
          />
          <StatCard
            title="Healthy Stock"
            value={summary.healthyStockCount}
            color="teal"
            subtitle="Above threshold"
          />
          <StatCard
            title="Low Stock"
            value={summary.lowStockCount}
            color={summary.lowStockCount > 0 ? 'amber' : 'teal'}
            subtitle="At or below threshold"
          />
          <StatCard
            title="Out of Stock"
            value={summary.outOfStockCount}
            color={summary.outOfStockCount > 0 ? 'rose' : 'teal'}
            subtitle="Zero available units"
          />
          <StatCard
            title="Total Valuation"
            value={`₹${summary.totalValuation.toLocaleString('en-IN')}`}
            color="purple"
            subtitle="Current stock value"
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3.5 px-6 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'status'
                ? 'border-royal-600 text-royal-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Stock Status & Quick Adjustment</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-3.5 px-6 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'ledger'
                ? 'border-royal-600 text-royal-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Auditable Movement Ledger ({transactions.length})</span>
          </button>
        </div>

        <div className="p-5">
          {activeTab === 'status' ? (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search by SKU or name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-royal-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-semibold text-slate-500">Filter Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-700"
                  >
                    <option value="ALL">All Items</option>
                    <option value="IN_STOCK">Healthy Stock</option>
                    <option value="LOW_STOCK">Low Stock Only</option>
                    <option value="OUT_OF_STOCK">Out of Stock Only</option>
                  </select>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Low Stock Limit</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Valuation</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredInventory.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-royal-700">{item.sku}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{item.category}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{item.stock}</td>
                        <td className="py-3.5 px-4 text-slate-500">{item.lowStockThreshold} units</td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={item.stockStatus} />
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                          ₹{item.totalValuation.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenAdjustModal(item)}
                            className="px-3 py-1.5 bg-navy-900 hover:bg-royal-600 text-white font-bold text-[11px] rounded-lg shadow-sm transition-colors"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Movement Ledger */
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Immutable chronological log of all stock deductions, restocks, and returns.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Product / SKU</th>
                      <th className="py-3 px-4">Change Type</th>
                      <th className="py-3 px-4">Quantity Delta</th>
                      <th className="py-3 px-4">Prev → New</th>
                      <th className="py-3 px-4">Audit Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block truncate max-w-xs">
                            {tx.product?.name || tx.sku}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{tx.sku}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                            {tx.changeType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-sm">
                          <span className={tx.quantityChange > 0 ? 'text-teal-600' : 'text-rose-600'}>
                            {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-600">
                          {tx.previousStock} &rarr; <span className="font-bold text-slate-900">{tx.newStock}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 max-w-sm truncate">
                          {tx.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Stock Adjustment Modal */}
      {adjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-elevated border border-slate-200">
            <div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-royal-700 px-2 py-0.5 rounded">
                SKU: {selectedProduct.sku}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                Stock Adjustment & Recount
              </h3>
              <p className="text-xs text-slate-500">{selectedProduct.name}</p>
            </div>

            {adjustError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold">
                {adjustError}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between">
                <span className="text-slate-500">Current In-Warehouse Stock:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {selectedProduct.stock} units
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjustment Reason / Type *
                </label>
                <select
                  value={changeType}
                  onChange={(e) => setChangeType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="PURCHASE_RESTOCK">Purchase Restock (+ Incoming Units)</option>
                  <option value="MANUAL_ADJUSTMENT">Manual Recount / Discrepancy Correction</option>
                  <option value="DAMAGE_WRITE_OFF">Damaged / Expired Goods Write-off (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity Change (+ to add, - to deduct) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 20 or -5"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Audit Notes / PO Reference
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Received shipment from distributor batch #401"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="px-4 py-2 text-xs font-bold bg-navy-900 hover:bg-royal-600 text-white rounded-lg shadow-sm transition-colors"
                >
                  {adjustSubmitting ? 'Updating...' : 'Commit Stock Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerInventory;
