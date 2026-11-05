import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  // Filter States
  const keyword = searchParams.get('keyword') || '';
  const selectedCategory = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const stockStatus = searchParams.get('stockStatus') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) setCategories(res.data.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(searchParams);
        queryParams.set('page', page);
        queryParams.set('limit', '12');

        const res = await api.get(`/products?${queryParams.toString()}`);
        if (res.data.success) {
          setProducts(res.data.products);
          setTotal(res.data.total);
          setPages(res.data.pages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset page on filter change
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Marketplace Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse live verified stock from all approved sellers ({total} products found)
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-500">Sort By:</label>
          <select
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 py-1.5 px-3 focus:outline-none focus:border-royal-500 shadow-sm"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Reviews</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-royal-600" />
                <span>Filters</span>
              </span>
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-semibold text-slate-400 hover:text-royal-600 flex items-center space-x-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Keyword / SKU</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Headphones or SKU..."
                  value={keyword}
                  onChange={(e) => updateFilter('keyword', e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-royal-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-royal-50 text-royal-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => updateFilter('category', c.slug)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      selectedCategory === c.slug
                        ? 'bg-royal-50 text-royal-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Stock Availability</label>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="stockStatus"
                    checked={!stockStatus}
                    onChange={() => updateFilter('stockStatus', '')}
                    className="text-royal-600 focus:ring-royal-500"
                  />
                  <span>All Items</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="stockStatus"
                    checked={stockStatus === 'IN_STOCK'}
                    onChange={() => updateFilter('stockStatus', 'IN_STOCK')}
                    className="text-royal-600 focus:ring-royal-500"
                  />
                  <span className="text-teal-700 font-medium">In Stock Only</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="stockStatus"
                    checked={stockStatus === 'OUT_OF_STOCK'}
                    onChange={() => updateFilter('stockStatus', 'OUT_OF_STOCK')}
                    className="text-royal-600 focus:ring-royal-500"
                  />
                  <span className="text-rose-600 font-medium">Out of Stock</span>
                </label>
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {loading ? (
            <LoadingSpinner text="Refreshing product catalog..." />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products matched your criteria"
              description="Try adjusting or clearing your filters to see more results."
              actionLabel="Clear Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-6 border-t border-slate-200">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateFilter('page', page - 1)}
                    className="p-2 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-slate-600 px-3">
                    Page {page} of {pages}
                  </span>
                  <button
                    disabled={page >= pages}
                    onClick={() => updateFilter('page', page + 1)}
                    className="p-2 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
