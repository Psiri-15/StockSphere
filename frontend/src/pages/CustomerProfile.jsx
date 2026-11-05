import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Lock, MapPin, Trash2, Plus, ShieldCheck, Check } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CustomerProfile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await updateProfile({ name, phone });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      const res = await api.put('/auth/password', { currentPassword, newPassword });
      if (res.data.success) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Password update failed' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddress);
      if (res.data.success) {
        setAddresses([res.data.address, ...addresses]);
        setShowAddAddress(false);
        setNewAddress({
          fullName: user?.name || '',
          phone: user?.phone || '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(addresses.filter((a) => a._id !== id));
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account & Saved Addresses</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage personal information and shipping destinations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-royal-600" />
            <span>Profile Details</span>
          </h3>

          {profileMsg && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold ${
                profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-4 py-2 bg-navy-900 hover:bg-royal-600 text-white font-bold text-xs rounded-lg transition-colors"
            >
              {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 pb-2 border-b border-slate-100">
            <Lock className="w-4 h-4 text-royal-600" />
            <span>Update Password</span>
          </h3>

          {passwordMsg && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold ${
                passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}
            >
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2 bg-navy-900 hover:bg-royal-600 text-white font-bold text-xs rounded-lg transition-colors"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-royal-600" />
            <span>Saved Shipping Addresses ({addresses.length})</span>
          </h3>
          <button
            onClick={() => setShowAddAddress(!showAddAddress)}
            className="text-xs font-bold text-royal-600 hover:text-royal-800 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddAddress ? 'Cancel' : 'Add New Address'}</span>
          </button>
        </div>

        {showAddAddress && (
          <form onSubmit={handleAddAddress} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-800">New Address Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                className="text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
              <input
                type="tel"
                required
                placeholder="Phone"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <input
              type="text"
              required
              placeholder="Address Line 1"
              value={newAddress.addressLine1}
              onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                required
                placeholder="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                required
                placeholder="PIN Code"
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                className="text-xs p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-royal-600 hover:bg-royal-500 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              Save Address
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative group">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-slate-900">{addr.fullName}</span>
                <button
                  onClick={() => handleDeleteAddress(addr._id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Delete address"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1">{addr.addressLine1}</p>
              <p className="text-xs text-slate-600">
                {addr.city}, {addr.state} - {addr.postalCode}
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-2">Ph: {addr.phone}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
