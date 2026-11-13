import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import ExportButton from '../../components/common/ExportButton';
import ShipmentDetailModal from './ShipmentDetailModal';
import ShipmentFormModal from './ShipmentFormModal';
import {
  Ship,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import dayjs from 'dayjs';

export default function ShipmentList() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalCount: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');

  // Modals state
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);

  // CRM reference lists for modal dropdowns
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchShipments();
  }, [pagination.page, status, type]);

  useEffect(() => {
    fetchCrmData();
  }, []);

  const fetchCrmData = async () => {
    try {
      const [custRes, suppRes] = await Promise.all([
        api.get('/crm/customers?limit=100'),
        api.get('/crm/suppliers?limit=100'),
      ]);
      if (custRes.data?.success) setCustomers(custRes.data.customers);
      if (suppRes.data?.success) setSuppliers(suppRes.data.suppliers);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });
      if (search) params.append('search', search);
      if (status !== 'All') params.append('status', status);
      if (type !== 'All') params.append('type', type);

      const res = await api.get(`/shipments?${params.toString()}`);
      if (res.data?.success) {
        setShipments(res.data.shipments);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchShipments();
  };

  const handleDelete = async (id, number) => {
    if (!window.confirm(`Are you sure you want to delete shipment ${number}? This action is logged to the audit trail.`)) {
      return;
    }

    try {
      await api.delete(`/shipments/${id}`);
      fetchShipments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete shipment');
    }
  };

  const exportHeaders = [
    { label: 'Shipment #', key: 'shipmentNumber' },
    { label: 'B/L Number', key: 'blNumber' },
    { label: 'Customer', key: 'customer', format: (c) => c?.companyName || '' },
    { label: 'Commodity', key: 'commodity' },
    { label: 'Container', key: 'containerNumber' },
    { label: 'Type', key: 'containerType' },
    { label: 'POL', key: 'pol' },
    { label: 'POD', key: 'pod' },
    { label: 'ETD', key: 'etd', format: (d) => dayjs(d).format('YYYY-MM-DD') },
    { label: 'ETA', key: 'eta', format: (d) => dayjs(d).format('YYYY-MM-DD') },
    { label: 'Total Cost ($)', key: 'totalCost' },
    { label: 'Selling Rate ($)', key: 'sellingRate' },
    { label: 'Status', key: 'status' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <Ship className="w-6 h-6 text-ocean-600" /> Shipping Management
          </h1>
          <p className="text-xs text-slate-500">
            End-to-end commercial freight forwarding, container bookings, and B/L management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            title="Active Shipments Register"
            filename="hansai_shipments"
            headers={exportHeaders}
            data={shipments}
            orientation="landscape"
          />
          <button
            onClick={() => {
              setEditingShipment(null);
              setShowFormModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Shipment</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Shipment #, Customer, B/L, or Commodity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-ocean-500"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-semibold text-[11px] uppercase">Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Booking Confirmed">Booking Confirmed</option>
              <option value="In Transit">In Transit</option>
              <option value="Customs Cleared">Customs Cleared</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-semibold text-[11px] uppercase">Mode:</span>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
            >
              <option value="All">All Modes</option>
              <option value="FCL">FCL (Full Container)</option>
              <option value="LCL">LCL (Less Container)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Shipments Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Shipment & B/L</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Cargo & Container</th>
                <th className="py-3 px-4">Route (POL &rarr; POD)</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4 text-right">Selling Rate</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    Loading shipments...
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    No shipments found matching the query.
                  </td>
                </tr>
              ) : (
                shipments.map((shp) => (
                  <tr key={shp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-navy-900 block">{shp.shipmentNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">B/L: {shp.blNumber || 'Pending'}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{shp.customer?.companyName}</span>
                      <span className="text-[10px] text-slate-400">{shp.customer?.email}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block">{shp.commodity}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] text-ocean-700 font-semibold">{shp.containerNumber}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({shp.containerType})</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block truncate max-w-[180px]">
                        {shp.pol.split(',')[0]} &rarr; {shp.pod.split(',')[0]}
                      </span>
                      <span className="text-[10px] text-slate-400">Inco: {shp.incoterms}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-700 block">ETD: {dayjs(shp.etd).format('DD MMM YYYY')}</span>
                      <span className="font-mono text-slate-400 text-[10px] block">ETA: {dayjs(shp.eta).format('DD MMM YYYY')}</span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-black text-slate-900 text-sm block">
                        ${Number(shp.sellingRate).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Cost: ${Number(shp.totalCost).toLocaleString()}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={shp.status === 'Delivered' ? 'success' : (shp.status === 'Booking Confirmed' ? 'warning' : 'ocean')}
                        size="xs"
                      >
                        {shp.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedShipment(shp);
                            setShowDetailModal(true);
                          }}
                          title="View Details & 12-Stage Timeline"
                          className="p-1 rounded hover:bg-ocean-50 text-ocean-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingShipment(shp);
                            setShowFormModal(true);
                          }}
                          title="Edit Shipment"
                          className="p-1 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(shp.id, shp.shipmentNumber)}
                          title="Delete Shipment"
                          className="p-1 rounded hover:bg-rose-50 text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page <strong className="text-slate-800">{pagination.page}</strong> of <strong className="text-slate-800">{pagination.totalPages}</strong> ({pagination.totalCount} total shipments)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page <= 1}
              className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Shipment Detail Modal */}
      <ShipmentDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        shipment={selectedShipment}
        onUpdate={fetchShipments}
      />

      {/* Create / Edit Form Modal */}
      <ShipmentFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        shipment={editingShipment}
        onSaved={fetchShipments}
        customers={customers}
        suppliers={suppliers}
      />
    </div>
  );
}

