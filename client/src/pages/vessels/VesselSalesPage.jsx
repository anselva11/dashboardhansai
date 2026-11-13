import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { TrendingUp, Plus, DollarSign, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function VesselSalesPage() {
  const [sales, setSales] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    vesselId: '',
    buyer: 'PT Pelayaran Nusantara Bahari',
    broker: 'Braemar ACM Shipbroking',
    sellingPrice: 2800000,
    currency: 'USD',
    exchangeRate: 16250,
    surveyCost: 10000,
    commission: 70000,
    legalFees: 15000,
    documentationFees: 5000,
    deliveryCost: 25000,
    otherCosts: 5000,
    accumulatedDepreciation: 350000,
    notes: 'Sold under Memorandum of Agreement and Bill of Sale.',
  });

  useEffect(() => {
    fetchSales();
    fetchVessels();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vessels/sales');
      if (res.data?.success) {
        setSales(res.data.sales);
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
      const res = await api.get('/vessels?operationalStatus=For Sale&limit=100');
      if (res.data?.success) {
        setVessels(res.data.vessels);
        if (res.data.vessels.length > 0) setForm((p) => ({ ...p, vesselId: res.data.vessels[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectedVessel = vessels.find((v) => v.id === form.vesselId);
  const acqCost = selectedVessel ? selectedVessel.purchasePrice : 2000000;
  const salesExpenses =
    Number(form.commission) +
    Number(form.surveyCost) +
    Number(form.legalFees) +
    Number(form.documentationFees) +
    Number(form.deliveryCost) +
    Number(form.otherCosts);

  // Formulas (Section 21-D)
  const netTradingProfit = Number(form.sellingPrice) - acqCost - salesExpenses;
  const bookValue = Math.max(0, acqCost - Number(form.accumulatedDepreciation));
  const accountingGainLoss = Number(form.sellingPrice) - salesExpenses - bookValue;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vessels/sales', form);
      setShowModal(false);
      fetchSales();
      fetchVessels();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record vessel sale');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-ocean-600" /> Vessel Sales & Title Disposal
          </h1>
          <p className="text-xs text-slate-500">
            Module 21-D: Distinguishes Realized Commercial Trading Profit from Accounting Disposal Gain/Loss.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
            <span className="text-slate-400">Total Profit Realized: </span>
            <span className="font-bold text-emerald-700 font-mono">+${Number(metrics.realizedTradingProfit || 0).toLocaleString()}</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Vessel Sale</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Sale #</th>
                <th className="py-3 px-4">Vessel Name & Type</th>
                <th className="py-3 px-4">Buyer / New Owner</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Original Cost</th>
                <th className="py-3 px-4 text-right">Realized Trading Profit</th>
                <th className="py-3 px-4 text-right">Accounting Gain/Loss</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map((vs) => (
                <tr key={vs.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-navy-900">{vs.saleNumber}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{vs.vesselName}</span>
                    <span className="text-[10px] text-ocean-600 font-medium">{vs.vesselType}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{vs.buyer}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{dayjs(vs.salesDate).format('DD MMM YYYY')}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">${vs.sellingPrice?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">${vs.originalAcquisitionCost?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                    +${vs.realizedTradingProfit?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-ocean-800">
                    ${vs.accountingGainLoss?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="purple" size="xs">SOLD & TRANSFERRED</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Execute Vessel Sale & Transfer Title" maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Select Vessel Listed for Sale *</label>
            <select
              required
              value={form.vesselId}
              onChange={(e) => setForm({ ...form, vesselId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              {vessels.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vesselName} ({v.vesselType}) &bull; Valued: ${v.currentEstimatedValue}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Buyer / New Owner *</label>
              <input
                type="text"
                required
                value={form.buyer}
                onChange={(e) => setForm({ ...form, buyer: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Selling Price ($ USD) *</label>
              <input
                type="number"
                required
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Broker Commission ($)</label>
              <input
                type="number"
                value={form.commission}
                onChange={(e) => setForm({ ...form, commission: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Accumulated Depreciation ($)</label>
              <input
                type="number"
                value={form.accumulatedDepreciation}
                onChange={(e) => setForm({ ...form, accumulatedDepreciation: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Dual Profitability Engine */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-navy-900 uppercase text-[11px] block">
              Commercial Trading vs. Accounting Asset Disposal (Section 21-D)
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">1. Realized Trading Profit</span>
                <span className="text-base font-black text-emerald-900 font-mono mt-1 block">
                  +${netTradingProfit.toLocaleString()}
                </span>
                <p className="text-[10px] text-emerald-700 mt-0.5">Selling Price - Original Cost - Expenses</p>
              </div>

              <div className="bg-ocean-50 p-3 rounded-lg border border-ocean-200">
                <span className="text-[10px] text-ocean-800 uppercase font-bold block">2. Accounting Gain / (Loss)</span>
                <span className="text-base font-black text-ocean-900 font-mono mt-1 block">
                  ${accountingGainLoss.toLocaleString()}
                </span>
                <p className="text-[10px] text-ocean-700 mt-0.5">Selling Price - Expenses - Net Book Value</p>
              </div>
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
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg"
            >
              Execute MOA & Mark Vessel SOLD
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

