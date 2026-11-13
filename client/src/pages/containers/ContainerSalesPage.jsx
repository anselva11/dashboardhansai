import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { TrendingUp, Plus, DollarSign, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';

export default function ContainerSalesPage() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [availableContainers, setAvailableContainers] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    buyerId: '',
    containerId: '',
    salesDate: new Date().toISOString().slice(0, 10),
    sellingPrice: 5800,
    deliveryCost: 200,
    otherCosts: 100,
    paymentStatus: 'Paid',
    notes: '',
  });

  useEffect(() => {
    fetchSales();
    fetchOptions();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/containers/sales');
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

  const fetchOptions = async () => {
    try {
      const [cRes, contRes] = await Promise.all([
        api.get('/crm/customers?limit=100'),
        api.get('/containers/inventory?status=Available&limit=100'),
      ]);
      if (cRes.data?.success) {
        setCustomers(cRes.data.customers);
        if (cRes.data.customers.length > 0) setForm((p) => ({ ...p, buyerId: cRes.data.customers[0].id }));
      }
      if (contRes.data?.success) {
        setAvailableContainers(contRes.data.containers);
        if (contRes.data.containers.length > 0) {
          setForm((p) => ({ ...p, containerId: contRes.data.containers[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectedContainer = availableContainers.find((c) => c.id === form.containerId);
  const acqCost = selectedContainer ? selectedContainer.purchasePrice : 3200;
  const netTradingProfit = Number(form.sellingPrice) - acqCost - Number(form.deliveryCost) - Number(form.otherCosts);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/containers/sales', form);
      setShowModal(false);
      fetchSales();
      fetchOptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record container sale');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-ocean-600" /> Container Sales & Trading
          </h1>
          <p className="text-xs text-slate-500">
            Realized Trading Profit calculation & automatic removal from available fleet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
            <span className="text-slate-400">Total Profit: </span>
            <span className="font-bold text-emerald-700 font-mono">${Number(metrics.totalProfit || 0).toLocaleString()}</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Container Sale</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Sale #</th>
                <th className="py-3 px-4">Buyer / Customer</th>
                <th className="py-3 px-4">Container #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Sales Date</th>
                <th className="py-3 px-4 text-right">Acquisition Cost</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Gross Trading Profit</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-navy-900">{s.saleNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{s.buyer?.companyName}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-ocean-700">{s.containerNumber}</td>
                  <td className="py-3 px-4 text-slate-700">{s.containerType}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{dayjs(s.salesDate).format('DD MMM YYYY')}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">${s.acquisitionCost?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">${s.sellingPrice?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                    +${s.grossProfit?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={s.paymentStatus === 'Paid' ? 'success' : 'warning'} size="xs">{s.paymentStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Execute Container Sale & Mark Sold" maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Buyer / Customer *</label>
            <select
              required
              value={form.buyerId}
              onChange={(e) => setForm({ ...form, buyerId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName} ({c.country})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Select Available Container for Sale *</label>
            <select
              required
              value={form.containerId}
              onChange={(e) => setForm({ ...form, containerId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono"
            >
              {availableContainers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.containerNumber} - {c.containerType} (Acquired: ${c.purchasePrice})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Note: System strictly prevents selling containers that are rented or already sold.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Selling Price ($) *</label>
              <input
                type="number"
                required
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Sales Delivery Cost ($)</label>
              <input
                type="number"
                value={form.deliveryCost}
                onChange={(e) => setForm({ ...form, deliveryCost: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
            <span className="font-bold text-[11px] uppercase block">Real-time Trading Profitability:</span>
            <div className="flex items-center justify-between font-mono">
              <span>Selling Price: ${Number(form.sellingPrice).toLocaleString()}</span>
              <span>Acquisition Cost: -${acqCost.toLocaleString()}</span>
            </div>
            <div className="pt-1 border-t border-emerald-200 flex items-center justify-between font-bold text-xs">
              <span>Net Trading Profit:</span>
              <span className="font-black text-sm text-emerald-800 font-mono">+${netTradingProfit.toLocaleString()}</span>
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
              Confirm Sale & Transfer Title
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

