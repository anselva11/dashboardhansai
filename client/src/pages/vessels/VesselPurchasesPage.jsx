import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { ShoppingBag, Plus, DollarSign, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';

export default function VesselPurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    vesselId: '',
    seller: 'Ocean Trans Holdings Ltd',
    broker: 'Clarksons Marine Brokers',
    purchasePrice: 2200000,
    currency: 'USD',
    exchangeRate: 16250,
    surveyCost: 15000,
    inspectionCost: 10000,
    legalFees: 15000,
    documentationCost: 8000,
    registrationFees: 12000,
    deliveryCost: 25000,
    repairCost: 35000,
    otherCosts: 10000,
    depositAmount: 440000,
    paidAmount: 2330000,
    notes: 'Acquisition under Norwegian Saleform 2012 (NSF 2012).',
  });

  useEffect(() => {
    fetchPurchases();
    fetchVessels();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vessels/purchases');
      if (res.data?.success) {
        setPurchases(res.data.purchases);
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVessels = async () => {
    try {
      const res = await api.get('/vessels?limit=100');
      if (res.data?.success) {
        setVessels(res.data.vessels);
        if (res.data.vessels.length > 0) setForm((p) => ({ ...p, vesselId: res.data.vessels[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const calculatedTotalAcquisition =
    Number(form.purchasePrice) +
    Number(form.surveyCost) +
    Number(form.inspectionCost) +
    Number(form.legalFees) +
    Number(form.documentationCost) +
    Number(form.registrationFees) +
    Number(form.deliveryCost) +
    Number(form.repairCost) +
    Number(form.otherCosts);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vessels/purchases', form);
      setShowModal(false);
      fetchPurchases();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record vessel purchase');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-ocean-600" /> Vessel Purchase & Fleet Acquisition
          </h1>
          <p className="text-xs text-slate-500">
            Module 21-C: Comprehensive Total Acquisition Cost formula, escrow deposits, and Protocol of Delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
            <span className="text-slate-400">Total Capital Spent: </span>
            <span className="font-bold text-slate-900 font-mono">${Number(metrics.totalSpent || 0).toLocaleString()}</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Vessel Acquisition</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Purchase #</th>
                <th className="py-3 px-4">Vessel Name & Type</th>
                <th className="py-3 px-4">Seller / Previous Owner</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Purchase Price</th>
                <th className="py-3 px-4 text-right">Total Acquisition Cost</th>
                <th className="py-3 px-4 text-center">Handover</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.map((vp) => (
                <tr key={vp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-navy-900">{vp.purchaseNumber}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{vp.vesselName}</span>
                    <span className="text-[10px] text-ocean-600 font-medium">{vp.vesselType}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{vp.seller}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{dayjs(vp.purchaseDate).format('DD MMM YYYY')}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">${vp.purchasePrice?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-navy-900">${vp.totalAcquisitionCost?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="success" size="xs">{vp.handoverStatus}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={vp.paymentStatus === 'Completed' ? 'success' : 'warning'} size="xs">{vp.paymentStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Purchase Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Vessel Purchase (NSF 2012 Agreement)" maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Select Vessel to Acquire *</label>
            <select
              required
              value={form.vesselId}
              onChange={(e) => setForm({ ...form, vesselId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              {vessels.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vesselName} ({v.vesselType}) &bull; Current Status: {v.operationalStatus}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Seller / Registered Owner *</label>
              <input
                type="text"
                required
                value={form.seller}
                onChange={(e) => setForm({ ...form, seller: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Maritime Broker / Agent</label>
              <input
                type="text"
                value={form.broker}
                onChange={(e) => setForm({ ...form, broker: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Agreed Purchase Price ($ USD) *</label>
              <input
                type="number"
                required
                value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Escrow Deposit ($ USD)</label>
              <input
                type="number"
                value={form.depositAmount}
                onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Acquisition Cost Breakdown Formula */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-navy-900 uppercase text-[11px] block">
              Total Acquisition Cost Formula (Section 21-C)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 uppercase block">Survey Cost ($)</label>
                <input
                  type="number"
                  value={form.surveyCost}
                  onChange={(e) => setForm({ ...form, surveyCost: e.target.value })}
                  className="w-full p-1.5 border rounded font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase block">Inspection ($)</label>
                <input
                  type="number"
                  value={form.inspectionCost}
                  onChange={(e) => setForm({ ...form, inspectionCost: e.target.value })}
                  className="w-full p-1.5 border rounded font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase block">Legal / Notary ($)</label>
                <input
                  type="number"
                  value={form.legalFees}
                  onChange={(e) => setForm({ ...form, legalFees: e.target.value })}
                  className="w-full p-1.5 border rounded font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase block">Registration ($)</label>
                <input
                  type="number"
                  value={form.registrationFees}
                  onChange={(e) => setForm({ ...form, registrationFees: e.target.value })}
                  className="w-full p-1.5 border rounded font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase block">Delivery / Towage ($)</label>
                <input
                  type="number"
                  value={form.deliveryCost}
                  onChange={(e) => setForm({ ...form, deliveryCost: e.target.value })}
                  className="w-full p-1.5 border rounded font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase block">Repair & Dock ($)</label>
                <input
                  type="number"
                  value={form.repairCost}
                  onChange={(e) => setForm({ ...form, repairCost: e.target.value })}
                  className="w-full p-1.5 border rounded font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold">
              <span className="text-slate-800">Total Calculated Acquisition Cost:</span>
              <span className="text-base font-black text-navy-900 font-mono">${calculatedTotalAcquisition.toLocaleString()}</span>
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
              Execute Protocol of Delivery & Add to Fleet
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

