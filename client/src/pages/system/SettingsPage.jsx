import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Settings, RefreshCw, DollarSign, Percent, Shield, Key, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [rates, setRates] = useState([]);
  const [taxConfigs, setTaxConfigs] = useState([]);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState(null);

  // Profile password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);

  useEffect(() => {
    fetchRates();
    fetchTaxConfigs();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await api.get('/system/exchange-rates');
      if (res.data?.success) setRates(res.data.rates);
    } catch (e) { console.error(e); }
  };

  const fetchTaxConfigs = async () => {
    try {
      const res = await api.get('/system/tax-configs');
      if (res.data?.success) setTaxConfigs(res.data.configs);
    } catch (e) { console.error(e); }
  };

  const handleUpdateRate = async (targetCurrency, newRate) => {
    try {
      await api.put('/system/exchange-rates', { targetCurrency, rate: Number(newRate) });
      fetchRates();
    } catch (e) {
      alert('Failed to update rate');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/me', { currentPassword, newPassword });
      setPasswordMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('CRITICAL ACTION: Reset demo database back to default demonstration records? This replaces customized records with the seed demo set.')) {
      return;
    }

    try {
      setResetting(true);
      const res = await api.post('/system/reset-demo-data');
      if (res.data?.success) {
        setMessage('Demo database successfully re-seeded!');
        setTimeout(() => {
          setMessage(null);
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-ocean-600" /> Platform Settings & Master Data
        </h1>
        <p className="text-xs text-slate-500">
          Configure foreign currency parities, taxation rules, user security, and demonstration controls.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Exchange Rates Master */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5 uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Foreign Exchange Rates (Base USD)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Live Parity</span>
          </div>

          <div className="divide-y divide-slate-100">
            {rates.map((r) => (
              <div key={r.targetCurrency} className="py-2 flex items-center justify-between">
                <span className="font-bold text-slate-800">1 USD = {r.targetCurrency}</span>
                <input
                  type="number"
                  defaultValue={r.rate}
                  onBlur={(e) => handleUpdateRate(r.targetCurrency, e.target.value)}
                  className="w-28 p-1 text-right border rounded font-mono font-bold text-navy-900 focus:bg-ocean-50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* User Password & Security */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Key className="w-4 h-4 text-ocean-600" /> Change Security Password
            </h3>
            <span className="text-[10px] text-slate-400">Account: {user?.email}</span>
          </div>

          {passwordMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-bold">
              {passwordMsg}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded-lg font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Safe Demo Data Reset Section */}
      <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
          <span>Demonstration Environment & Reset Utility</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
          Restricted to authorized system administrators. This operation safely truncates the database and re-seeds it with 30 realistic shipments, 100 containers, 29 vessels, 120+ financial transactions, and test users.
        </p>

        <button
          onClick={handleResetDemoData}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting Database...' : 'Execute Pristine Demo Reset'}</span>
        </button>
      </div>
    </div>
  );
}

