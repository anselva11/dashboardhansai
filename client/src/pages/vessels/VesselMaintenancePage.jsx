import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Wrench, Plus, DollarSign, Calendar, ShieldCheck, Fuel, Users } from 'lucide-react';
import dayjs from 'dayjs';

export default function VesselMaintenancePage() {
  const [activeTab, setActiveTab] = useState('maintenance');
  const [maintenances, setMaintenances] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showMaintModal, setShowMaintModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);

  const [maintForm, setMaintForm] = useState({
    vesselId: '',
    maintenanceType: 'Annual Drydock & Hull Painting',
    title: 'Scheduled Special Survey Drydock',
    description: 'Hull sandblasting, sea valve overhaul, cathodic anode replacement.',
    serviceProvider: 'PT PAL Indonesia Shipyard',
    startDate: new Date().toISOString().slice(0, 10),
    completionDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    cost: 45000,
    status: 'In Progress',
  });

  const [expForm, setExpForm] = useState({
    vesselId: '',
    category: 'Fuel',
    description: 'Bunkering 35 MT MGO at Port of Tanjung Priok',
    date: new Date().toISOString().slice(0, 10),
    amount: 28500,
    vendor: 'PT Pertamina Marine',
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, eRes, vRes] = await Promise.all([
        api.get('/vessels/maintenance'),
        api.get('/vessels/expenses'),
        api.get('/vessels?limit=100'),
      ]);
      if (mRes.data?.success) setMaintenances(mRes.data.maintenances);
      if (eRes.data?.success) setExpenses(eRes.data.expenses);
      if (vRes.data?.success) {
        setVessels(vRes.data.vessels);
        if (vRes.data.vessels.length > 0) {
          setMaintForm((p) => ({ ...p, vesselId: vRes.data.vessels[0].id }));
          setExpForm((p) => ({ ...p, vesselId: vRes.data.vessels[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMaintSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vessels/maintenance', maintForm);
      setShowMaintModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record maintenance');
    }
  };

  const handleExpSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vessels/expenses', expForm);
      setShowExpModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record expense');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-ocean-600" /> Vessel Engineering & Maintenance
          </h1>
          <p className="text-xs text-slate-500">
            Module 21-F: Drydock cycles, Class special surveys, main engine overhauls, and bunkering expenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'maintenance' ? (
            <button
              onClick={() => setShowMaintModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Drydock / Maintenance</span>
            </button>
          ) : (
            <button
              onClick={() => setShowExpModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Record Operational Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'maintenance' ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Drydock & Engineering Maintenance ({maintenances.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'expenses' ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Vessel Operational Expenses (OPEX) ({expenses.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'maintenance' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Vessel</th>
                  <th className="py-3 px-4">Maintenance Program</th>
                  <th className="py-3 px-4">Shipyard / Contractor</th>
                  <th className="py-3 px-4">Timeline</th>
                  <th className="py-3 px-4 text-right">Cost (USD)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maintenances.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-navy-900">{m.vessel?.vesselName}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{m.title}</span>
                      <span className="text-[10px] text-ocean-600">{m.maintenanceType}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{m.serviceProvider}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {dayjs(m.startDate).format('DD MMM YYYY')} &rarr; {m.completionDate ? dayjs(m.completionDate).format('DD MMM YYYY') : 'In Dock'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">${m.cost?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={m.status === 'Completed' ? 'success' : 'warning'} size="xs">{m.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Vessel</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Disbursement Date</th>
                  <th className="py-3 px-4 text-right">Amount (USD)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-navy-900">{e.vessel?.vesselName}</td>
                    <td className="py-3 px-4">
                      <Badge variant="ocean" size="xs">{e.category}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{e.description}</td>
                    <td className="py-3 px-4 text-slate-600">{e.vendor}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{dayjs(e.date).format('DD MMM YYYY')}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">${e.amount?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="success" size="xs">{e.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      <Modal isOpen={showMaintModal} onClose={() => setShowMaintModal(false)} title="Schedule Vessel Drydock & Maintenance" maxWidth="max-w-xl">
        <form onSubmit={handleMaintSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Select Vessel *</label>
            <select
              required
              value={maintForm.vesselId}
              onChange={(e) => setMaintForm({ ...maintForm, vesselId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              {vessels.map((v) => (
                <option key={v.id} value={v.id}>{v.vesselName} ({v.vesselType})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Maintenance Type</label>
              <select
                value={maintForm.maintenanceType}
                onChange={(e) => setMaintForm({ ...maintForm, maintenanceType: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="Annual Drydock & Hull Painting">Annual Drydock & Hull Painting</option>
                <option value="Special Survey Drydock & Plate Gauging">Special Survey Drydock</option>
                <option value="Main Engine 12,000 Hours Major Overhaul">Main Engine Major Overhaul</option>
                <option value="Propeller & Shaft Inspection">Propeller & Shaft Inspection</option>
                <option value="Emergency Marine Repair">Emergency Marine Repair</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Shipyard / Service Provider</label>
              <input
                type="text"
                required
                value={maintForm.serviceProvider}
                onChange={(e) => setMaintForm({ ...maintForm, serviceProvider: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Project Title *</label>
            <input
              type="text"
              required
              value={maintForm.title}
              onChange={(e) => setMaintForm({ ...maintForm, title: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Estimated Cost ($ USD)</label>
              <input
                type="number"
                required
                value={maintForm.cost}
                onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Start Date</label>
              <input
                type="date"
                required
                value={maintForm.startDate}
                onChange={(e) => setMaintForm({ ...maintForm, startDate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowMaintModal(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={showExpModal} onClose={() => setShowExpModal(false)} title="Record Operational Disbursement (OPEX)" maxWidth="max-w-md">
        <form onSubmit={handleExpSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Select Vessel *</label>
            <select
              required
              value={expForm.vesselId}
              onChange={(e) => setExpForm({ ...expForm, vesselId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              {vessels.map((v) => (
                <option key={v.id} value={v.id}>{v.vesselName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={expForm.category}
                onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="Fuel">Fuel (Bunkering)</option>
                <option value="Lubricants">Lubricants</option>
                <option value="Crew Salaries">Crew Salaries</option>
                <option value="Port Charges">Port Charges</option>
                <option value="Insurance">Vessel Insurance</option>
                <option value="Spare Parts">Spare Parts</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Amount ($ USD) *</label>
              <input
                type="number"
                required
                value={expForm.amount}
                onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Description *</label>
            <input
              type="text"
              required
              value={expForm.description}
              onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowExpModal(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg"
            >
              Save Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

