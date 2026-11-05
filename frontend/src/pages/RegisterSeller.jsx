import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, User, Mail, Lock, Phone, Building, FileText, MapPin, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterSeller = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    storeName: '',
    storeDescription: '',
    businessRegistrationNumber: '',
    taxId: '',
    storeAddress: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerSeller } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.storeName) {
      setError('Please fill in all mandatory seller onboarding fields.');
      return;
    }

    setLoading(true);
    try {
      await registerSeller(formData);
      navigate('/seller/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Seller registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-royal-600 rounded-2xl shadow-sm mb-4">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Seller Onboarding Application
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Apply to list products, manage real-time inventory, and receive automated payout disbursements
          </p>
        </div>

        {/* Info notice about approval */}
        <div className="p-3.5 bg-royal-50 border border-royal-200 rounded-xl text-royal-900 text-xs flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-royal-600 mt-0.5 flex-shrink-0" />
          <p className="leading-relaxed">
            <strong>Administrator Verification Notice:</strong> For platform compliance and quality assurance, new seller registrations are reviewed by an Admin before inventory publication permissions are enabled.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Representative Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Karan Patel"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-royal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="seller@business.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-royal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-royal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98111 22334"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-royal-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-royal-600 mb-3">
                Store & Legal Details
              </span>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    required
                    placeholder="e.g. TechNova Electronics"
                    value={formData.storeName}
                    onChange={handleChange}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-royal-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Bio / Description
                  </label>
                  <textarea
                    name="storeDescription"
                    rows={2}
                    placeholder="Describe your catalog focus and specialty..."
                    value={formData.storeDescription}
                    onChange={handleChange}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-royal-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Business Reg. No.
                    </label>
                    <input
                      type="text"
                      name="businessRegistrationNumber"
                      placeholder="e.g. TN-ELEC-2023-8871"
                      value={formData.businessRegistrationNumber}
                      onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      GSTIN / Tax ID
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      placeholder="e.g. 27AABCS1429B1Z"
                      value={formData.taxId}
                      onChange={handleChange}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warehouse / Store Address
                  </label>
                  <input
                    type="text"
                    name="storeAddress"
                    placeholder="Street, City, State, PIN"
                    value={formData.storeAddress}
                    onChange={handleChange}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-navy-900 hover:bg-royal-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Submitting Application...' : 'Submit Seller Application'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Already have a seller account?</span>
            <Link to="/login" className="font-semibold text-royal-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSeller;
