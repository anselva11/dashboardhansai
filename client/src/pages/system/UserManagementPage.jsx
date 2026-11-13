import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Users, Plus, Shield, CheckCircle2, XCircle, Key } from 'lucide-react';

const SYSTEM_ROLES = [
  'Super Admin',
  'Administrator',
  'Finance Manager',
  'Shipping Manager',
  'Container Manager',
  'Operational Staff',
  'Viewer',
];

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Operational Staff',
    department: 'Operations',
    phone: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/system/users');
      if (res.data?.success) setUsers(res.data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/system/roles');
      if (res.data?.success) setRoles(res.data.roles);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/system/users', form);
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await api.put(`/system/users/${user.id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (e) {
      alert('Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-ocean-600" /> User Management & Access Control
          </h1>
          <p className="text-xs text-slate-500">
            Section 3: Enterprise Role-Based Access Control (RBAC) across 7 specialized management tiers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Role permission cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {SYSTEM_ROLES.map((r) => (
          <div key={r} className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <Shield className="w-4 h-4 mx-auto text-ocean-600 mb-1" />
            <h5 className="font-bold text-slate-800 text-[11px] truncate">{r}</h5>
            <span className="text-[10px] text-slate-400">
              {users.filter((u) => u.role === r).length} Active
            </span>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Corporate Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-navy-900">{u.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{u.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role === 'Super Admin' ? 'purple' : u.role.includes('Manager') ? 'ocean' : 'primary'} size="xs">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{u.department || 'Operations'}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{u.phone || 'N/A'}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={u.isActive ? 'success' : 'danger'} size="xs">
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleUserStatus(u)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${
                        u.isActive
                          ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                          : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create System User Account" maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Corporate Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Password *</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full p-2 border rounded-lg font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">System Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                {SYSTEM_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Department</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg"
            >
              Save User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

