import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ExportButton from '../../components/common/ExportButton';
import { Building2, Search, Plus, MapPin, Phone, Mail } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    country: 'Indonesia',
    serviceType: 'Shipyard',
    paymentTerms: 'Net 30',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/crm/suppliers?search=${encodeURIComponent(search)}`);
      if (res.data?.success) setSuppliers(res.data.suppliers);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSuppliers();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/crm/suppliers', form);
      setShowModal(false);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add supplier');
    }
  };

  const exportHeaders = [
    { label: 'Company Name', key: 'companyName' },
    { label: 'Contact Person', key: 'contactPerson' },
    { label: 'Email', key: 'email' },
    { label: 'Service Type', key: 'serviceType' },
    { label: 'Country', key: 'country' },
    { label: 'Payment Terms', key: 'paymentTerms' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-ocean-600" /> Marine Suppliers & Vendor Network
          </h1>
          <p className="text-xs text-slate-500">
            Shipyards, bunker suppliers, container depots, classification societies, and feeder lines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton title="Supplier Vendor Register" filename="hansai_suppliers" headers={exportHeaders} data={suppliers} />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Supplier, Service Type, Country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-ocean-500"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Vendor / Supplier</th>
                <th className="py-3 px-4">Service Domain</th>
                <th className="py-3 px-4">Key Contact</th>
                <th className="py-3 px-4">Country & Location</th>
                <th className="py-3 px-4">Payment Terms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-navy-900 text-xs">{s.companyName}</td>
                  <td className="py-3 px-4">
                    <Badge variant="ocean" size="xs">{s.serviceType}</Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    <span className="block font-semibold">{s.contactPerson}</span>
                    <span className="text-[10px] text-slate-400">{s.email}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <span className="font-semibold block">{s.country}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[200px] block">{s.address}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">{s.paymentTerms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register Marine Vendor / Supplier" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Service Type</label>
              <select
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="Shipyard">Shipyard</option>
                <option value="Container Depot">Container Depot</option>
                <option value="Shipping Line">Shipping Line</option>
                <option value="Feeder">Feeder Feeder</option>
                <option value="Surveyor">Surveyor & Class</option>
                <option value="Trucking">Trucking</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Payment Terms</label>
              <select
                value={form.paymentTerms}
                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="COD / Pre-bunker">COD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

