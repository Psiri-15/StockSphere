import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Upload, AlertCircle, Check } from 'lucide-react';
import api from '../../services/api';

export const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    price: '',
    comparePrice: '',
    stock: '',
    lowStockThreshold: 5,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
  });

  const [specifications, setSpecifications] = useState([
    { key: 'Material', value: 'Aerospace Grade' },
    { key: 'Warranty', value: '1 Year Manufacturer' },
  ]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success && res.data.categories.length > 0) {
          setCategories(res.data.categories);
          setFormData((prev) => ({ ...prev, category: res.data.categories[0]._id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const addSpec = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpec = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.price || !formData.category || formData.stock === '') {
      setError('Please fill in name, price, category, and initial stock.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/products', {
        name: formData.name,
        category: formData.category,
        brand: formData.brand || 'StockSphere Gear',
        price: Number(formData.price),
        comparePrice: formData.comparePrice ? Number(formData.comparePrice) : 0,
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold) || 5,
        description: formData.description,
        images: [{ url: formData.imageUrl }],
        specifications: specifications.filter((s) => s.key && s.value),
      });

      if (res.data.success) {
        navigate('/seller/products');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <Link
          to="/seller/products"
          className="text-xs font-semibold text-slate-500 hover:text-royal-600 flex items-center space-x-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Product</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter product attributes. A unique system SKU will be automatically assigned.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
            1. Basic Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                name="name"
                placeholder="e.g. UltraSonic Studio Monitor Headphones"
                value={formData.name}
                onChange={handleChange}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-royal-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  name="brand"
                  placeholder="e.g. AcoustiQ"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Description</label>
              <textarea
                name="description"
                rows={3}
                required
                placeholder="Detailed specifications, features, and capabilities..."
                value={formData.description}
                onChange={handleChange}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
            2. Pricing & Inventory Controls
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                name="price"
                required
                min="1"
                placeholder="₹ 4999"
                value={formData.price}
                onChange={handleChange}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Compare MRP (₹)</label>
              <input
                type="number"
                name="comparePrice"
                placeholder="₹ 6999"
                value={formData.comparePrice}
                onChange={handleChange}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock Units *</label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                placeholder="e.g. 50"
                value={formData.stock}
                onChange={handleChange}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Low-Stock Alert Trigger</label>
              <input
                type="number"
                name="lowStockThreshold"
                min="1"
                placeholder="Default: 5"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Image URL */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
            3. Product Imagery
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Image URL (Cloudinary / Unsplash Hosted)
            </label>
            <input
              type="url"
              required
              name="imageUrl"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
            />
          </div>

          {formData.imageUrl && (
            <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
              <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Technical Specs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              4. Technical Specifications
            </h3>
            <button
              type="button"
              onClick={addSpec}
              className="text-xs font-bold text-royal-600 hover:text-royal-800 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Spec Row</span>
            </button>
          </div>

          <div className="space-y-2">
            {specifications.map((spec, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Key (e.g. Battery)"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                  className="w-1/3 text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 50 Hours)"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                  className="flex-1 text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(index)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/seller/products')}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-navy-900 hover:bg-royal-600 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Publishing & Auditing SKU...' : 'Publish Product to Marketplace'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
