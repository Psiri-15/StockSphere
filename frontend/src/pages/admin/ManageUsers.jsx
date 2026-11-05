import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Shield, UserX, UserCheck, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/admin/users?role=${roleFilter}&search=${search}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (id, currentStatus, name) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} user "${name}"?`)) return;

    try {
      const res = await api.put(`/admin/users/${id}/status`);
      if (res.data.success) {
        setUsers(users.map((u) => (u._id === id ? { ...u, isActive: res.data.isActive } : u)));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving platform accounts..." />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Users Directory</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Inspect registered accounts, manage access permissions, and activate/deactivate accounts
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-royal-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          <div className="flex items-center space-x-2 text-xs self-start sm:self-auto">
            <span className="font-semibold text-slate-500">Filter Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-700"
            >
              <option value="">All Roles ({users.length})</option>
              <option value="Customer">Customers</option>
              <option value="Seller">Sellers</option>
              <option value="Admin">Admins</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">User</th>
                <th className="py-3 px-5">Email Address</th>
                <th className="py-3 px-5">Assigned Role</th>
                <th className="py-3 px-5">Store Affiliation</th>
                <th className="py-3 px-5">Account Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3.5 px-5">
                    <StatusBadge status={u.role} />
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {u.role === 'Seller' ? (
                      <span className="font-bold text-slate-800">
                        {u.sellerDetails?.storeName || 'N/A'}
                      </span>
                    ) : (
                      <span className="text-slate-400">&mdash;</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {u.role !== 'Admin' && (
                      <button
                        onClick={() => handleToggleStatus(u._id, u.isActive, u.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          u.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
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

export default ManageUsers;
