import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { ShoppingBag, Plus, DollarSign } from 'lucide-react';
import dayjs from 'dayjs';

export default function ContainerPurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    supplierId: '',
    containerNumber: '',
    containerType: '40FT High Cube',
    condition: 'Brand New',
    purchasePrice: 4200,
    transportationCost: 200,
    inspectionCost: 100,
    repairCost: 0,
    otherCosts: 50,
    currentLocation: 'Jakarta Tanjung Priok Depot',
    notes: '',
  });

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/containers/purchases');
      if (res.data?.success) {
        setPurchases(res.data.purchases);
        setTotalSpent(res.data.totalSpent);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/crm/suppliers?limit=100');
      if (res.data?.success) {
        setSuppliers(res.data.suppliers);
        if (res.data.suppliers.length > 0) {
          setForm((p) => ({ ...p, supplierId: res.data.suppliers[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalAcquisition =
    Number(form.purchasePrice) +
    Number(form.transportationCost) +
    Number(form.inspectionCost) +
    Number(form.repairCost) +
    Number(form.otherCosts);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/containers/purchases', form);
      setShowModal(false);
      fetchPurchases();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record purchase');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-ocean-600" /> Container Acquisition & Purchases
          </h1>
          <p className="text-xs text-slate-500">
            Total Acquisition Cost formula engine with automatic fleet inventory replenishment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
            <span className="text-slate-400">Total Spent: </span>
            <span className="font-bold text-slate-900">${totalSpent.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Container Purchase</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Purchase #</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Container #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Base Price</th>
                <th className="py-3 px-4 text-right">Total Acquisition Cost</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-navy-900">{p.purchaseNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{p.supplier?.companyName}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-ocean-700">{p.containerNumber}</td>
                  <td className="py-3 px-4 text-slate-700">{p.containerType}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{dayjs(p.purchaseDate).format('DD MMM YYYY')}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">${p.purchasePrice?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-navy-900">${p.totalAcquisitionCost?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={p.paymentStatus === 'Paid' ? 'success' : 'warning'} size="xs">{p.paymentStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Purchase Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Container Purchase & Add to Inventory" maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Supplier *</label>
            <select
              required
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.companyName} ({s.country})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Container Number *</label>
              <input
                type="text"
                required
                value={form.containerNumber}
                onChange={(e) => setForm({ ...form, containerNumber: e.target.value })}
                placeholder="HNSU-205900-1"
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Type</label>
              <select
                value={form.containerType}
                onChange={(e) => setForm({ ...form, containerType: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="20FT Standard">20FT Standard</option>
                <option value="40FT Standard">40FT Standard</option>
                <option value="40FT High Cube">40FT High Cube</option>
                <option value="20FT Refrigerated">20FT Refrigerated</option>
                <option value="40FT Refrigerated">40FT Refrigerated</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-navy-900 block uppercase text-[11px]">Total Acquisition Cost Breakdown</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase">Base Price ($)</label>
                <input
                  type="number"
                  required
                  value={form.purchasePrice}
                  onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                  className="w-full p-1.5 border rounded font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase">Transport ($)</label>
                <input
                  type="number"
                  value={form.transportationCost}
                  onChange={(e) => setForm({ ...form, transportationCost: e.target.value })}
                  className="w-full p-1.5 border rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase">Inspection ($)</label>
                <input
                  type="number"
                  value={form.inspectionCost}
                  onChange={(e) => setForm({ ...form, inspectionCost: e.target.value })}
                  className="w-full p-1.5 border rounded font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold">
              <span className="text-slate-700">Calculated Total Acquisition Cost:</span>
              <span className="text-sm font-black text-navy-900 font-mono">${totalAcquisition.toLocaleString()}</span>
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
              Confirm Purchase & Receive
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

