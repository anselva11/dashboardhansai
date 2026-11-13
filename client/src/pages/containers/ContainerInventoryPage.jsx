import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ExportButton from '../../components/common/ExportButton';
import { Box, Search, Plus, Filter, Wrench, Shield, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function ContainerInventoryPage() {
  const [containers, setContainers] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalCount: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    containerNumber: '',
    containerType: '40FT High Cube',
    purchasePrice: 4200,
    condition: 'Cargo Worthy (CW)',
    currentLocation: 'Jakarta Tanjung Priok Depot',
    status: 'Available',
    notes: '',
  });

  useEffect(() => {
    fetchContainers();
  }, [pagination.page, status, type]);

  const fetchContainers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });
      if (search) params.append('search', search);
      if (status !== 'All') params.append('status', status);
      if (type !== 'All') params.append('type', type);

      const res = await api.get(`/containers/inventory?${params.toString()}`);
      if (res.data?.success) {
        setContainers(res.data.containers);
        setMetrics(res.data.metrics);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchContainers();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/containers/inventory', formData);
      setShowModal(false);
      fetchContainers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create container');
    }
  };

  const exportHeaders = [
    { label: 'Container #', key: 'containerNumber' },
    { label: 'Type', key: 'containerType' },
    { label: 'Condition', key: 'condition' },
    { label: 'Location', key: 'currentLocation' },
    { label: 'Purchase Price ($)', key: 'purchasePrice' },
    { label: 'Current Value ($)', key: 'currentValue' },
    { label: 'Status', key: 'status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <Box className="w-6 h-6 text-ocean-600" /> Container Inventory Management
          </h1>
          <p className="text-xs text-slate-500">
            Centralized depot database of 100 ISO containers with ISO/IICL-6 inspection telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            title="Container Inventory Register"
            filename="hansai_containers"
            headers={exportHeaders}
            data={containers}
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Container</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Fleet Units</span>
          <span className="text-xl font-black text-navy-900 font-mono mt-0.5 block">{metrics.totalUnits || 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-emerald-600 font-bold uppercase block">Available in Depot</span>
          <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">{metrics.availableUnits || 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-amber-600 font-bold uppercase block">Currently Rented</span>
          <span className="text-xl font-black text-amber-700 font-mono mt-0.5 block">{metrics.rentedUnits || 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-rose-600 font-bold uppercase block">In Maintenance</span>
          <span className="text-xl font-black text-rose-700 font-mono mt-0.5 block">{metrics.maintenanceUnits || 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-purple-600 font-bold uppercase block">Units Sold</span>
          <span className="text-xl font-black text-purple-700 font-mono mt-0.5 block">{metrics.soldUnits || 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-ocean-600 font-bold uppercase block">Inventory Value</span>
          <span className="text-xl font-black text-ocean-700 font-mono mt-0.5 block">${Number(metrics.totalValuation || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Container Number, Depot Location, Notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-ocean-500 font-mono"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Rented">Rented</option>
            <option value="In Transit">In Transit</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Sold">Sold</option>
          </select>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
          >
            <option value="All">All Container Types</option>
            <option value="20FT Standard">20FT Standard</option>
            <option value="40FT Standard">40FT Standard</option>
            <option value="40FT High Cube">40FT High Cube</option>
            <option value="20FT Refrigerated">20FT Refrigerated</option>
            <option value="40FT Refrigerated">40FT Refrigerated</option>
            <option value="Open Top">Open Top</option>
            <option value="Flat Rack">Flat Rack</option>
          </select>
        </div>
      </div>

      {/* Containers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Container #</th>
                <th className="py-3 px-4">Type & Dimension</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Current Depot Location</th>
                <th className="py-3 px-4 text-right">Valuation</th>
                <th className="py-3 px-4">Last Inspection</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">Loading container inventory...</td>
                </tr>
              ) : containers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-navy-900">{c.containerNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{c.containerType}</td>
                  <td className="py-3 px-4">
                    <Badge variant={c.condition.includes('Brand') || c.condition.includes('IICL') ? 'success' : 'primary'} size="xs">
                      {c.condition}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{c.currentLocation}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">${c.currentValue?.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{c.lastInspection ? dayjs(c.lastInspection).format('DD MMM YYYY') : 'N/A'}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      variant={
                        c.status === 'Available'
                          ? 'success'
                          : c.status === 'Rented'
                          ? 'warning'
                          : c.status === 'Sold'
                          ? 'purple'
                          : 'danger'
                      }
                      size="xs"
                    >
                      {c.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} units)</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page <= 1}
              className="px-2.5 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-2.5 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Container Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register Container into Database" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Container Number *</label>
            <input
              type="text"
              required
              value={formData.containerNumber}
              onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value })}
              placeholder="e.g. HNSU-205100-8"
              className="w-full p-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Type</label>
              <select
                value={formData.containerType}
                onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="20FT Standard">20FT Standard</option>
                <option value="40FT Standard">40FT Standard</option>
                <option value="40FT High Cube">40FT High Cube</option>
                <option value="20FT Refrigerated">20FT Refrigerated</option>
                <option value="40FT Refrigerated">40FT Refrigerated</option>
                <option value="Open Top">Open Top</option>
                <option value="Flat Rack">Flat Rack</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="Brand New">Brand New</option>
                <option value="IICL Standard">IICL Standard</option>
                <option value="Cargo Worthy (CW)">Cargo Worthy (CW)</option>
                <option value="Wind & Water Tight (WWT)">Wind & Water Tight (WWT)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Current Depot Location</label>
            <input
              type="text"
              required
              value={formData.currentLocation}
              onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Purchase Price ($)</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="Available">Available</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg"
            >
              Save Container
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

