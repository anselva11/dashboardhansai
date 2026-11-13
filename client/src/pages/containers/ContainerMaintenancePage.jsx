import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Box,
  TrendingDown,
} from 'lucide-react';
import dayjs from 'dayjs';

export default function ContainerMaintenancePage() {
  const [maintenances, setMaintenances] = useState([]);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [totalCost, setTotalCost] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    containerId: '',
    serviceType: 'PTI Inspection & Cleaning',
    cost: 450,
    serviceDate: new Date().toISOString().slice(0, 10),
    completionDate: new Date().toISOString().slice(0, 10),
    serviceProvider: 'PT Samudera Container Depot Services',
    status: 'Completed',
    notes: 'ISO structural check, corner casting inspection, and steam cleaning completed.',
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, cRes] = await Promise.all([
        api.get('/containers/maintenance?limit=100'),
        api.get('/containers/inventory?limit=100'),
      ]);
      setMaintenances(mRes.data.maintenances || []);
      setTotalCost(mRes.data.totalCost || 0);
      setContainers(cRes.data.containers || []);
    } catch (err) {
      console.error('Failed to load container maintenance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/containers/maintenance', form);
      setShowModal(false);
      setForm({
        containerId: '',
        serviceType: 'PTI Inspection & Cleaning',
        cost: 450,
        serviceDate: new Date().toISOString().slice(0, 10),
        completionDate: new Date().toISOString().slice(0, 10),
        serviceProvider: 'PT Samudera Container Depot Services',
        status: 'Completed',
        notes: '',
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record maintenance');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = maintenances.filter((m) => {
    const matchSearch =
      m.container?.containerNumber?.toLowerCase().includes(search.toLowerCase()) ||
      m.serviceType?.toLowerCase().includes(search.toLowerCase()) ||
      m.serviceProvider?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || m.serviceType === typeFilter;
    const matchStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const scheduledCount = maintenances.filter((m) => m.status === 'Scheduled').length;
  const inProgressCount = maintenances.filter((m) => m.status === 'In Progress').length;
  const completedCount = maintenances.filter((m) => m.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-ocean-600" />
            Container Maintenance & Depot Repairs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Structural overhaul, pre-trip inspections (PTI), Reefer servicing, and IICL repair tracking
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record Maintenance
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Spent</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            ${totalCost.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            <span>Across 20+ service jobs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Jobs</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{completedCount}</div>
          <div className="text-xs text-slate-500 mt-1">Returned to available stock</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Progress</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{inProgressCount}</div>
          <div className="text-xs text-amber-600 mt-1 font-medium">Under active depot repair</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Scheduled PTI</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{scheduledCount}</div>
          <div className="text-xs text-slate-500 mt-1">Upcoming scheduled servicing</div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search container number, type, vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 bg-white"
            >
              <option value="All">All Service Types</option>
              <option value="PTI Inspection & Cleaning">PTI Inspection & Cleaning</option>
              <option value="Container Structural Repair">Container Structural Repair</option>
              <option value="Reefer Unit Servicing">Reefer Unit Servicing</option>
              <option value="CSC Plate Recertification">CSC Plate Recertification</option>
              <option value="Painting & Decal Refurbishment">Painting & Decal Refurbishment</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 bg-white"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Container</th>
                <th className="py-3 px-4">Service Type</th>
                <th className="py-3 px-4">Provider / Depot</th>
                <th className="py-3 px-4">Service Date</th>
                <th className="py-3 px-4">Completion</th>
                <th className="py-3 px-4 text-right">Cost (USD)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    Loading maintenance logs...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-ocean-700 flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-slate-400" />
                      {item.container?.containerNumber || 'Fleet Batch Service'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{item.serviceType}</td>
                    <td className="py-3 px-4 text-slate-600">{item.serviceProvider}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {dayjs(item.serviceDate).format('DD MMM YYYY')}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {item.completionDate ? dayjs(item.completionDate).format('DD MMM YYYY') : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      ${Number(item.cost).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          item.status === 'Completed'
                            ? 'success'
                            : item.status === 'In Progress'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={item.notes}>
                      {item.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Maintenance Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Record Container Maintenance & Repair"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Container</label>
              <select
                value={form.containerId}
                onChange={(e) => setForm({ ...form, containerId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 bg-white"
                required
              >
                <option value="">-- Choose Container --</option>
                {containers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.containerNumber} - {c.containerType} ({c.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type</label>
              <select
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 bg-white"
              >
                <option value="PTI Inspection & Cleaning">PTI Inspection & Cleaning</option>
                <option value="Container Structural Repair">Container Structural Repair</option>
                <option value="Reefer Unit Servicing">Reefer Unit Servicing</option>
                <option value="CSC Plate Recertification">CSC Plate Recertification</option>
                <option value="Painting & Decal Refurbishment">Painting & Decal Refurbishment</option>
                <option value="Floorboard & Lashing Ring Replacement">Floorboard & Lashing Ring Replacement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Provider / Depot</label>
              <input
                type="text"
                value={form.serviceProvider}
                onChange={(e) => setForm({ ...form, serviceProvider: e.target.value })}
                placeholder="e.g. PT Samudera Container Depot Services"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Repair Cost (USD)</label>
              <input
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Date</label>
              <input
                type="date"
                value={form.serviceDate}
                onChange={(e) => setForm({ ...form, serviceDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Completion Date</label>
              <input
                type="date"
                value={form.completionDate}
                onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 bg-white"
              >
                <option value="Completed">Completed (Unit returns to Available)</option>
                <option value="In Progress">In Progress (Marks container Under Maintenance)</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Depot Work Order / Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="ISO certification details, repair parts, remarks"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-ocean-600 hover:bg-ocean-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Maintenance Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

