import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Repeat, Search, Plus, RotateCcw, DollarSign, AlertCircle, Clock } from 'lucide-react';
import dayjs from 'dayjs';

export default function ContainerRentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  const [availableContainers, setAvailableContainers] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Create form state
  const [createForm, setCreateForm] = useState({
    customerId: '',
    containerId: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
    rateType: 'Monthly',
    rentalRate: 220,
    depositAmount: 350,
    lateFeePerDay: 15,
    damageCharges: 0,
    notes: '',
  });

  // Return form state
  const [returnForm, setReturnForm] = useState({
    returnDate: new Date().toISOString().slice(0, 10),
    damageCharges: 0,
    notes: '',
  });

  useEffect(() => {
    fetchRentals();
    fetchOptions();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/containers/rentals');
      if (res.data?.success) {
        setRentals(res.data.rentals);
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [cRes, contRes] = await Promise.all([
        api.get('/crm/customers?limit=100'),
        api.get('/containers/inventory?status=Available&limit=100'),
      ]);
      if (cRes.data?.success) setCustomers(cRes.data.customers);
      if (contRes.data?.success) {
        setAvailableContainers(contRes.data.containers);
        if (contRes.data.containers.length > 0) {
          setCreateForm((p) => ({ ...p, containerId: contRes.data.containers[0].id }));
        }
      }
      if (cRes.data?.customers?.length > 0) {
        setCreateForm((p) => ({ ...p, customerId: cRes.data.customers[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/containers/rentals', createForm);
      setShowCreateModal(false);
      fetchRentals();
      fetchOptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create rental');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/containers/rentals/${selectedRental.id}/return`, returnForm);
      setShowReturnModal(false);
      fetchRentals();
      fetchOptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return container');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <Repeat className="w-6 h-6 text-ocean-600" /> Container Rental Management
          </h1>
          <p className="text-xs text-slate-500">
            Commercial leasing agreements, automated overdue fee engine, and return inspections.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Rental Contract</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-ocean-600 uppercase block">Active Contracts</span>
          <span className="text-2xl font-black text-navy-900 font-mono mt-1 block">{metrics.activeCount || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-rose-600 uppercase block">Overdue Rentals</span>
          <span className="text-2xl font-black text-rose-700 font-mono mt-1 block">{metrics.overdueCount || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-emerald-600 uppercase block">Collected Revenue</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">${Number(metrics.totalPaid || 0).toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-amber-600 uppercase block">Outstanding Balance</span>
          <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">${Number(metrics.totalOutstanding || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Rentals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Contract #</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Container #</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Monthly Rate</th>
                <th className="py-3 px-4 text-right">Billed / Paid</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rentals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-navy-900">{r.contractNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{r.customer?.companyName}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold text-ocean-700 block">{r.container?.containerNumber}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({r.container?.containerType})</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {dayjs(r.startDate).format('DD MMM')} &rarr; {dayjs(r.endDate).format('DD MMM YYYY')}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">${r.rentalRate}/mo</td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono font-bold text-slate-900 block">${Number(r.totalRentalAmount).toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-600 font-mono">Paid: ${Number(r.paidAmount).toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-rose-700">
                    ${Number(r.outstandingAmount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={r.status === 'Active' ? 'ocean' : r.status === 'Returned' ? 'success' : 'danger'} size="xs">
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.status === 'Active' || r.status === 'Overdue' ? (
                      <button
                        onClick={() => {
                          setSelectedRental(r);
                          setShowReturnModal(true);
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded font-bold text-[11px] transition-colors"
                      >
                        Return Container
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">Returned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Rental Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Issue New Container Rental Contract" maxWidth="max-w-xl">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Customer *</label>
            <select
              required
              value={createForm.customerId}
              onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Select Available Container *</label>
            <select
              required
              value={createForm.containerId}
              onChange={(e) => setCreateForm({ ...createForm, containerId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono"
            >
              {availableContainers.map((c) => (
                <option key={c.id} value={c.id}>{c.containerNumber} - {c.containerType} ({c.currentLocation})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={createForm.startDate}
                onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">End Date *</label>
              <input
                type="date"
                required
                value={createForm.endDate}
                onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Rental Rate ($/month) *</label>
              <input
                type="number"
                required
                value={createForm.rentalRate}
                onChange={(e) => setCreateForm({ ...createForm, rentalRate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Security Deposit ($)</label>
              <input
                type="number"
                value={createForm.depositAmount}
                onChange={(e) => setCreateForm({ ...createForm, depositAmount: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg"
            >
              Execute Rental Contract
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Container Modal */}
      <Modal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} title={`Return Container ${selectedRental?.container?.containerNumber}`} maxWidth="max-w-md">
        <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Actual Return Date</label>
            <input
              type="date"
              required
              value={returnForm.returnDate}
              onChange={(e) => setReturnForm({ ...returnForm, returnDate: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Inspection Damage Charges ($)</label>
            <input
              type="number"
              value={returnForm.damageCharges}
              onChange={(e) => setReturnForm({ ...returnForm, damageCharges: e.target.value })}
              placeholder="0"
              className="w-full p-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Depot Return Inspection Notes</label>
            <textarea
              rows="3"
              value={returnForm.notes}
              onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
              placeholder="Visual inspection passed. Floor and corner castings verified intact."
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowReturnModal(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
            >
              Confirm Return & Calculate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

