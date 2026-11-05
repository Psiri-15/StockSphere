import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, Lock, MapPin, Trash2, Plus, ShieldCheck, Check, Camera, UploadCloud, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CustomerProfile = () => {
  const { user, updateProfile, uploadAvatar } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Profile photo state
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoMsg({ type: 'error', text: 'Please select an image file (PNG, JPG, JPEG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoMsg({ type: 'error', text: 'Image size must be less than 5MB.' });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setPhotoMsg({ type: 'info', text: 'Previewing photo. Click "Save Photo" below to save changes.' });
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) return;
    setPhotoLoading(true);
    setPhotoMsg(null);
    try {
      await uploadAvatar(selectedFile);
      setPhotoMsg({ type: 'success', text: 'Profile photo updated successfully!' });
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setPhotoMsg({ type: 'error', text: err.response?.data?.message || 'Failed to upload photo.' });
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleCancelPreview = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPhotoMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      if (selectedFile) {
        await uploadAvatar(selectedFile);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
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
        {/* Personal Details & Profile Photo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-royal-600" />
              <span>Profile Details</span>
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-royal-50 text-royal-700 border border-royal-200/60">
              Customer
            </span>
          </div>

          {/* Profile Photo Upload & Preview Card */}
          <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Photo Avatar Preview */}
              <div className="relative group flex-shrink-0">
                <img
                  src={previewUrl || user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={user?.name || 'Customer Avatar'}
                  className="w-20 h-20 rounded-full object-cover border-2 border-royal-500 shadow-md ring-4 ring-royal-50 transition-transform group-hover:scale-102"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Choose new photo from device"
                  className="absolute bottom-0 right-0 p-1.5 bg-royal-600 hover:bg-royal-700 text-white rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Upload Options & Action Buttons */}
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <h4 className="text-xs font-bold text-slate-800">Profile Photo</h4>
                  {selectedFile ? (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                      Preview Mode
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-200/70 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Choose a picture from your device. You can preview it before saving.
                </p>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-royal-500 hover:bg-royal-50/50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-royal-600" />
                    <span>{selectedFile ? 'Choose Different Photo' : 'Upload Profile Photo'}</span>
                  </button>

                  {selectedFile && (
                    <>
                      <button
                        type="button"
                        onClick={handleSavePhoto}
                        disabled={photoLoading}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{photoLoading ? 'Saving...' : 'Save Photo'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPreview}
                        disabled={photoLoading}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Photo Feedback Status Message */}
            {photoMsg && (
              <div
                className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                  photoMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : photoMsg.type === 'info'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <span>{photoMsg.text}</span>
                <button
                  type="button"
                  onClick={() => setPhotoMsg(null)}
                  className="text-slate-400 hover:text-slate-600 ml-2"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {profileMsg && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold ${
                profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-royal-500 focus:border-royal-500 outline-hidden"
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
                placeholder="+91 98765 43210"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-royal-500 focus:border-royal-500 outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading || photoLoading}
              className="px-4 py-2.5 bg-navy-900 hover:bg-royal-600 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs disabled:opacity-50"
            >
              {profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}
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
