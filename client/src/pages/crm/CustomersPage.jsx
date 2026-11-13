import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ExportButton from '../../components/common/ExportButton';
import { Users, Search, Plus, Mail, Phone, MapPin, DollarSign } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
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
    customerType: 'Corporate',
    creditLimit: 250000,
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/crm/customers?search=${encodeURIComponent(search)}`);
      if (res.data?.success) {
        setCustomers(res.data.customers);
        setTotalOutstanding(res.data.totalOutstanding);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/crm/customers', form);
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add customer');
    }
  };

  const exportHeaders = [
    { label: 'Company Name', key: 'companyName' },
    { label: 'Contact Person', key: 'contactPerson' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Country', key: 'country' },
    { label: 'Type', key: 'customerType' },
    { label: 'Outstanding ($)', key: 'outstandingBalance' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-ocean-600" /> Customer Relationship Management (CRM)
          </h1>
          <p className="text-xs text-slate-500">
            Corporate accounts, freight forwarders, credit ceilings, and outstanding commercial balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton title="Customer Accounts Register" filename="hansai_customers" headers={exportHeaders} data={customers} />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Corporate Clients</span>
          <span className="text-2xl font-black text-navy-900 font-mono mt-1 block">{customers.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-ocean-600 font-bold uppercase block">International Coverage</span>
          <span className="text-2xl font-black text-ocean-700 font-mono mt-1 block">7 Countries</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-rose-600 font-bold uppercase block">Total Customer Receivables</span>
          <span className="text-2xl font-black text-rose-700 font-mono mt-1 block">${totalOutstanding.toLocaleString()}</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Company, Contact, Email, Country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-ocean-500"
          />
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Country & Address</th>
                <th className="py-3 px-4">Account Type</th>
                <th className="py-3 px-4 text-right">Credit Ceiling</th>
                <th className="py-3 px-4 text-right">Outstanding Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-navy-900 text-xs">{c.companyName}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    <span className="block font-semibold">{c.contactPerson}</span>
                    <span className="text-[10px] text-slate-400">{c.email}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]">
                    <span className="font-semibold text-slate-800 block">{c.country}</span>
                    <span className="text-[10px] text-slate-400">{c.address}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="ocean" size="xs">{c.customerType}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">${Number(c.creditLimit).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-rose-700">
                    ${Number(c.outstandingBalance).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register Corporate Customer" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Registered Address</label>
            <textarea
              rows="2"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
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
              Save Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

