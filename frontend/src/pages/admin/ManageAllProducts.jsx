import React, { useState, useEffect } from 'react';
import { Package, Trash2, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const ManageAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/products?limit=50&keyword=${search}`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Admin Action: Permanently remove "${name}" from platform?`)) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading platform-wide catalog..." />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Master Catalog</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Supervise published products across all verified sellers ({products.length} products listed)
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-80">
            <input
              type="text"
              placeholder="Search by name, SKU, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-royal-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>
          <span className="text-xs text-slate-500 font-semibold">{products.length} items loaded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Product Details</th>
                <th className="py-3 px-5">SKU</th>
                <th className="py-3 px-5">Merchant / Seller</th>
                <th className="py-3 px-5">Price</th>
                <th className="py-3 px-5">Stock Units</th>
                <th className="py-3 px-5">Stock Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                      />
                      <div className="max-w-xs truncate">
                        <Link
                          to={`/products/${p._id}`}
                          className="font-bold text-slate-900 hover:text-royal-600 block truncate"
                        >
                          {p.name}
                        </Link>
                        <span className="text-[10px] text-slate-400">{p.brand} &bull; {p.category?.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-royal-700 font-bold">{p.sku}</td>
                  <td className="py-3.5 px-5 text-slate-700">
                    <span className="font-bold block">{p.seller?.sellerDetails?.storeName || p.seller?.name || 'Admin'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.seller?.email}</span>
                  </td>
                  <td className="py-3.5 px-5 font-extrabold text-slate-900">
                    ₹{p.price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-5 font-bold text-slate-800 text-sm">{p.stock}</td>
                  <td className="py-3.5 px-5">
                    <StatusBadge status={p.stockStatus} />
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-2">
                    <button
                      onClick={() => handleDelete(p._id, p.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageAllProducts;
