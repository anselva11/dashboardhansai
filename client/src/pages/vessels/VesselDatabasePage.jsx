import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ExportButton from '../../components/common/ExportButton';
import {
  Anchor,
  Search,
  Plus,
  Eye,
  Filter,
  Ship,
  Printer,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  Activity,
} from 'lucide-react';

const VESSEL_TYPES = [
  'All',
  'Tugboat',
  'Barge / Tongkang',
  'Oil Tanker',
  'Landing Craft Tank (LCT)',
  'Container Ship',
  'Bulk Carrier',
  'Fast Crew Boat (FCB)',
];

export default function VesselDatabasePage() {
  const [vessels, setVessels] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalCount: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [operationalStatus, setOperationalStatus] = useState('All');

  // Detail Modal
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add vessel form state
  const [form, setForm] = useState({
    vesselCode: '',
    vesselName: '',
    vesselType: 'Tugboat',
    imoNumber: '',
    registrationNumber: '',
    flagState: 'Indonesia',
    yearBuilt: 2020,
    shipyard: 'Batam Shipyard',
    countryOfBuild: 'Indonesia',
    classificationSociety: 'BKI',
    currentLocation: 'Port of Tanjung Priok, Jakarta',
    condition: 'Good',
    operationalStatus: 'Operational',
    purchasePrice: 1800000,
    currentEstimatedValue: 1700000,
    specs: {
      loa: 32.0,
      breadth: 9.5,
      depth: 4.5,
      draft: 3.5,
      gt: 280,
      dwt: 350,
      mainEngineMaker: 'Caterpillar',
      mainEnginePowerHp: 3200,
      serviceSpeed: 11.0,
      crewCapacity: 10,
    },
  });

  useEffect(() => {
    fetchVessels();
  }, [pagination.page, type, operationalStatus]);

  const fetchVessels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });
      if (search) params.append('search', search);
      if (type !== 'All') params.append('type', type);
      if (operationalStatus !== 'All') params.append('operationalStatus', operationalStatus);

      const res = await api.get(`/vessels?${params.toString()}`);
      if (res.data?.success) {
        setVessels(res.data.vessels);
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
    setPagination((p) => ({ ...p, page: 1 }));
    fetchVessels();
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vessels', form);
      setShowAddModal(false);
      fetchVessels();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create vessel');
    }
  };

  const exportHeaders = [
    { label: 'Vessel Code', key: 'vesselCode' },
    { label: 'Vessel Name', key: 'vesselName' },
    { label: 'Category', key: 'vesselType' },
    { label: 'Flag', key: 'flagState' },
    { label: 'Year Built', key: 'yearBuilt' },
    { label: 'Class', key: 'classificationSociety' },
    { label: 'Location', key: 'currentLocation' },
    { label: 'Asset Value ($)', key: 'currentEstimatedValue' },
    { label: 'Status', key: 'operationalStatus' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <Anchor className="w-6 h-6 text-ocean-600" /> Vessel Database & Fleet Registry
          </h1>
          <p className="text-xs text-slate-500">
            Centralized register across Tugboats, Barges, Tankers, LCTs, Container Ships, Bulkers, and Fast Crew Boats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            title="HANSAI Fleet Registry"
            filename="hansai_fleet"
            headers={exportHeaders}
            data={vessels}
            orientation="landscape"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vessel to Database</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Fleet</span>
          <span className="text-xl font-black text-navy-900 font-mono mt-0.5 block">{metrics.totalFleet || 29} Vessels</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-emerald-600 font-bold uppercase block">Operational</span>
          <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">{metrics.operationalCount || 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-amber-600 font-bold uppercase block">Listed For Sale</span>
          <span className="text-xl font-black text-amber-700 font-mono mt-0.5 block">{metrics.forSaleCount || 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-rose-600 font-bold uppercase block">In Maintenance</span>
          <span className="text-xl font-black text-rose-700 font-mono mt-0.5 block">{metrics.underMaintenanceCount || 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-purple-600 font-bold uppercase block">Vessels Sold</span>
          <span className="text-xl font-black text-purple-700 font-mono mt-0.5 block">{metrics.soldCount || 0}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-ocean-600 font-bold uppercase block">Current Fleet Value</span>
          <span className="text-xl font-black text-ocean-700 font-mono mt-0.5 block">${Number(metrics.totalFleetValue || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Filter Tabs by Category */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Vessel Name, Code, IMO, Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-ocean-500 font-mono"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
          >
            {VESSEL_TYPES.map((t) => (
              <option key={t} value={t}>{t === 'All' ? 'All 7 Vessel Types' : t}</option>
            ))}
          </select>

          <select
            value={operationalStatus}
            onChange={(e) => {
              setOperationalStatus(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
          >
            <option value="All">All Operational Statuses</option>
            <option value="Operational">Operational</option>
            <option value="Under Charter">Under Charter</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Under Survey">Under Survey</option>
            <option value="For Sale">For Sale</option>
            <option value="Sold">Sold</option>
          </select>
        </div>
      </div>

      {/* Vessels Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Vessel Code & Name</th>
                <th className="py-3 px-4">Type / Classification</th>
                <th className="py-3 px-4">Build Year & Shipyard</th>
                <th className="py-3 px-4">Key Technical Specs</th>
                <th className="py-3 px-4">Current Station</th>
                <th className="py-3 px-4 text-right">Asset Value</th>
                <th className="py-3 px-4 text-center">Operational Status</th>
                <th className="py-3 px-4 text-center">Particulars</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">Loading vessel database...</td>
                </tr>
              ) : vessels.map((v) => {
                let specSummary = 'N/A';
                if (v.specification) {
                  specSummary = `LOA: ${v.specification.loa || 0}m • GT: ${v.specification.gt || 0} • DWT: ${v.specification.dwt || 0}`;
                }

                return (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-navy-900 block text-xs">{v.vesselName}</span>
                      <span className="font-mono text-[10px] text-ocean-700 font-semibold">{v.vesselCode}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{v.vesselType}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Class: {v.classificationSociety || 'BKI'}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{v.yearBuilt}</span>
                      <span className="text-[10px] text-slate-400">{v.shipyard || v.countryOfBuild}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-700 font-mono text-[11px] block">{specSummary}</span>
                      {v.specification?.mainEngineMaker && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {v.specification.mainEngineMaker} ({v.specification.mainEnginePowerHp} HP)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-medium block truncate max-w-[160px]">{v.currentLocation}</span>
                      <span className="text-[10px] text-slate-400">Flag: {v.flagState}</span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold text-slate-900 text-xs block">
                        ${Number(v.currentEstimatedValue).toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          v.operationalStatus === 'Operational'
                            ? 'success'
                            : v.operationalStatus === 'For Sale'
                            ? 'warning'
                            : v.operationalStatus === 'Sold'
                            ? 'purple'
                            : 'ocean'
                        }
                        size="xs"
                      >
                        {v.operationalStatus}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedVessel(v);
                          setShowDetailModal(true);
                        }}
                        className="px-2.5 py-1 bg-ocean-50 hover:bg-ocean-100 text-ocean-700 font-bold rounded flex items-center gap-1 mx-auto transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Specs</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} fleet units)</span>
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

      {/* Vessel Technical Specs Detail Modal */}
      {selectedVessel && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Vessel Particulars — ${selectedVessel.vesselName}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6 text-xs">
            {/* Header Particulars */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-navy-900 to-ocean-800 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-lg font-black font-mono tracking-tight block">{selectedVessel.vesselName}</span>
                <p className="text-xs text-slate-300 mt-0.5">
                  Code: <span className="font-mono text-white font-bold">{selectedVessel.vesselCode}</span> &bull; Type: {selectedVessel.vesselType}
                </p>
                <p className="text-[11px] text-slate-300">
                  IMO: {selectedVessel.imoNumber || 'Domestic'} &bull; Reg: {selectedVessel.registrationNumber || 'N/A'} &bull; Flag: {selectedVessel.flagState}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 backdrop-blur-sm"
                >
                  <Printer className="w-4 h-4" /> Print Ship Particulars
                </button>
              </div>
            </div>

            {/* General & Commercial Specs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-navy-900 uppercase text-[11px] block">General Information</span>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between"><span>Year Built:</span><strong className="font-mono">{selectedVessel.yearBuilt}</strong></div>
                  <div className="flex justify-between"><span>Builder / Shipyard:</span><span>{selectedVessel.shipyard || 'N/A'}</span></div>
                  <div className="flex justify-between"><span>Country:</span><span>{selectedVessel.countryOfBuild}</span></div>
                  <div className="flex justify-between"><span>Classification:</span><strong className="font-mono">{selectedVessel.classificationSociety}</strong></div>
                  <div className="flex justify-between"><span>Condition:</span><Badge variant="primary" size="xs">{selectedVessel.condition}</Badge></div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-navy-900 uppercase text-[11px] block">Dimensions & Tonnage</span>
                <div className="space-y-1.5 text-slate-700 font-mono">
                  <div className="flex justify-between"><span>Length Overall (LOA):</span><strong>{selectedVessel.specification?.loa || 0} m</strong></div>
                  <div className="flex justify-between"><span>Breadth Moulded:</span><strong>{selectedVessel.specification?.breadth || 0} m</strong></div>
                  <div className="flex justify-between"><span>Depth Moulded:</span><strong>{selectedVessel.specification?.depth || 0} m</strong></div>
                  <div className="flex justify-between"><span>Draft:</span><strong>{selectedVessel.specification?.draft || 0} m</strong></div>
                  <div className="flex justify-between"><span>Gross Tonnage (GT):</span><strong>{selectedVessel.specification?.gt || 0}</strong></div>
                  <div className="flex justify-between"><span>Deadweight (DWT):</span><strong>{selectedVessel.specification?.dwt || 0} MT</strong></div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-navy-900 uppercase text-[11px] block">Propulsion & Machinery</span>
                <div className="space-y-1.5 text-slate-700 font-mono">
                  <div className="flex justify-between"><span>Main Engine:</span><strong>{selectedVessel.specification?.mainEngineMaker || 'N/A'}</strong></div>
                  <div className="flex justify-between"><span>Engine Power:</span><strong>{selectedVessel.specification?.mainEnginePowerHp || 0} HP</strong></div>
                  <div className="flex justify-between"><span>Service Speed:</span><strong>{selectedVessel.specification?.serviceSpeed || 0} Knots</strong></div>
                  <div className="flex justify-between"><span>Max Speed:</span><strong>{selectedVessel.specification?.maxSpeed || 0} Knots</strong></div>
                  <div className="flex justify-between"><span>Fuel Type:</span><strong>{selectedVessel.specification?.fuelType || 'MGO'}</strong></div>
                  <div className="flex justify-between"><span>Crew Capacity:</span><strong>{selectedVessel.specification?.crewCapacity || 0} Persons</strong></div>
                </div>
              </div>
            </div>

            {/* Type-Specific Technical Attributes */}
            {selectedVessel.specification?.specificSpecsJson && (
              <div className="bg-ocean-50/50 p-4 rounded-xl border border-ocean-200 space-y-2">
                <span className="font-bold text-ocean-900 uppercase text-[11px] block flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-ocean-600" /> Specialized Type Specifications: {selectedVessel.vesselType}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                  {Object.entries(JSON.parse(selectedVessel.specification.specificSpecsJson)).map(([key, val]) => (
                    <div key={key} className="bg-white p-2.5 rounded-lg border border-ocean-200/60">
                      <span className="text-[10px] text-slate-400 uppercase block">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <strong className="text-slate-800 block mt-0.5">{String(val)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add Vessel Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register Vessel into Fleet Database" maxWidth="max-w-2xl">
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Vessel Code *</label>
              <input
                type="text"
                required
                value={form.vesselCode}
                onChange={(e) => setForm({ ...form, vesselCode: e.target.value })}
                placeholder="VSL-TGB-06"
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Vessel Name *</label>
              <input
                type="text"
                required
                value={form.vesselName}
                onChange={(e) => setForm({ ...form, vesselName: e.target.value })}
                placeholder="TB HANSAI TITAN 06"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Category / Type *</label>
              <select
                value={form.vesselType}
                onChange={(e) => setForm({ ...form, vesselType: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="Tugboat">Tugboat</option>
                <option value="Barge / Tongkang">Barge / Tongkang</option>
                <option value="Oil Tanker">Oil Tanker</option>
                <option value="Landing Craft Tank (LCT)">Landing Craft Tank (LCT)</option>
                <option value="Container Ship">Container Ship</option>
                <option value="Bulk Carrier">Bulk Carrier</option>
                <option value="Fast Crew Boat (FCB)">Fast Crew Boat (FCB)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Year Built *</label>
              <input
                type="number"
                required
                value={form.yearBuilt}
                onChange={(e) => setForm({ ...form, yearBuilt: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Length Overall (LOA m)</label>
              <input
                type="number"
                step="0.1"
                value={form.specs.loa}
                onChange={(e) => setForm({ ...form, specs: { ...form.specs, loa: e.target.value } })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Breadth (m)</label>
              <input
                type="number"
                step="0.1"
                value={form.specs.breadth}
                onChange={(e) => setForm({ ...form, specs: { ...form.specs, breadth: e.target.value } })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Gross Tonnage (GT)</label>
              <input
                type="number"
                value={form.specs.gt}
                onChange={(e) => setForm({ ...form, specs: { ...form.specs, gt: e.target.value } })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg"
            >
              Save Vessel Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

