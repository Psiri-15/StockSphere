import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit3, Trash2, Package, Search } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';

export const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/seller/my-products');
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

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your catalog?`)) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner text="Retrieving your catalog..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your store's listings, prices, SKU designations, and stock thresholds
          </p>
        </div>

        <Link
          to="/seller/products/new"
          className="px-4 py-2.5 bg-navy-900 hover:bg-royal-600 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Product</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Search header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-royal-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {filtered.length} product(s)
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState
              icon={Package}
              title="No products found"
              description="You have not published any products matching your query yet."
              actionLabel="Add Your First Product"
              onAction={() => (window.location.href = '/seller/products/new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Product Details</th>
                  <th className="py-3 px-5">SKU</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Price</th>
                  <th className="py-3 px-5">Stock</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={prod.name}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                        />
                        <div className="max-w-xs truncate">
                          <span className="font-bold text-slate-900 block truncate">{prod.name}</span>
                          <span className="text-[11px] text-slate-400">{prod.brand || 'StockSphere'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 font-mono text-royal-700 font-bold">{prod.sku}</td>
                    <td className="py-3 px-5 text-slate-500">{prod.category?.name || 'General'}</td>
                    <td className="py-3 px-5 font-extrabold text-slate-900">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-5 font-bold text-slate-800 text-sm">{prod.stock}</td>
                    <td className="py-3 px-5">
                      <StatusBadge status={prod.stockStatus} />
                    </td>
                    <td className="py-3 px-5 text-right space-x-2">
                      <Link
                        to={`/seller/products/${prod._id}/edit`}
                        className="inline-flex p-1.5 text-slate-500 hover:text-royal-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(prod._id, prod.name)}
                        className="inline-flex p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

export default SellerProducts;
