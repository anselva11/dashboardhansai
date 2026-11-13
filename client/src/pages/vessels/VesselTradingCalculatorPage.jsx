import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { Calculator, DollarSign, TrendingUp, RefreshCw, Save, ShieldAlert, CheckCircle } from 'lucide-react';

export default function VesselTradingCalculatorPage() {
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(16250);

  // Inputs
  const [purchasePrice, setPurchasePrice] = useState(2500000);
  const [surveyCost, setSurveyCost] = useState(18000);
  const [inspectionCost, setInspectionCost] = useState(12000);
  const [legalCost, setLegalCost] = useState(15000);
  const [registrationCost, setRegistrationCost] = useState(10000);
  const [deliveryCost, setDeliveryCost] = useState(35000);
  const [repairCost, setRepairCost] = useState(45000);
  const [otherAcquisitionCosts, setOtherAcquisitionCosts] = useState(10000);

  const [sellingPrice, setSellingPrice] = useState(3400000);
  const [brokerCommission, setBrokerCommission] = useState(85000);
  const [salesSurveyCost, setSalesSurveyCost] = useState(10000);
  const [salesLegalCost, setSalesLegalCost] = useState(15000);
  const [salesDocumentationCost, setSalesDocumentationCost] = useState(8000);
  const [salesDeliveryCost, setSalesDeliveryCost] = useState(25000);
  const [otherSalesExpenses, setOtherSalesExpenses] = useState(12000);

  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    recalculate();
  }, [
    purchasePrice,
    surveyCost,
    inspectionCost,
    legalCost,
    registrationCost,
    deliveryCost,
    repairCost,
    otherAcquisitionCosts,
    sellingPrice,
    brokerCommission,
    salesSurveyCost,
    salesLegalCost,
    salesDocumentationCost,
    salesDeliveryCost,
    otherSalesExpenses,
    currency,
    exchangeRate,
  ]);

  const recalculate = async () => {
    try {
      const payload = {
        purchasePrice,
        surveyCost,
        inspectionCost,
        legalCost,
        registrationCost,
        deliveryCost,
        repairCost,
        otherAcquisitionCosts,
        sellingPrice,
        brokerCommission,
        salesSurveyCost,
        salesLegalCost,
        salesDocumentationCost,
        salesDeliveryCost,
        otherSalesExpenses,
        currency,
        exchangeRate,
        saveHistory: false,
      };

      const res = await api.post('/calculators/vessel-profit', payload);
      if (res.data?.success) {
        setResult(res.data.result);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveToHistory = async () => {
    try {
      setSaving(true);
      await api.post('/calculators/vessel-profit', {
        purchasePrice,
        surveyCost,
        inspectionCost,
        legalCost,
        registrationCost,
        deliveryCost,
        repairCost,
        otherAcquisitionCosts,
        sellingPrice,
        brokerCommission,
        salesSurveyCost,
        salesLegalCost,
        salesDocumentationCost,
        salesDeliveryCost,
        otherSalesExpenses,
        currency,
        exchangeRate,
        saveHistory: true,
      });
      setSaveMessage('Calculation saved to audit history!');
      setTimeout(() => setSaveMessage(null), 2500);
    } catch (e) {
      alert('Failed to save calculation history');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-ocean-600" /> Vessel Purchase & Sales Trading Profit Calculator
          </h1>
          <p className="text-xs text-slate-500">
            Module 21-H: Interactive Net Profit, ROI %, Break-even price engine supporting multi-currency valuations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold">
            <span>Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent font-bold text-navy-900 focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="IDR">IDR (Rp)</option>
              <option value="SGD">SGD (S$)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <button
            onClick={handleSaveToHistory}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Calculation'}</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {saveMessage}
        </div>
      )}

      {/* KPI RESULTS HIGHLIGHT */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Acquisition Cost</span>
            <span className="text-2xl font-black text-navy-900 font-mono mt-1 block">
              ${result.totalAcquisitionCost?.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">Includes all surveyor & legal dues</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-emerald-600 font-bold uppercase block">Net Trading Profit</span>
            <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
              +${result.netTradingProfit?.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">After all selling commissions</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-ocean-600 font-bold uppercase block">Return on Investment (ROI)</span>
            <span className="text-2xl font-black text-ocean-700 font-mono mt-1 block">
              {result.roiPercentage}%
            </span>
            <span className="text-[10px] text-slate-400">Net Profit / Acquisition Cost</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-amber-600 font-bold uppercase block">Break-even Selling Price</span>
            <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
              ${result.breakEvenSellingPrice?.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">Zero-profit hurdle threshold</span>
          </div>
        </div>
      )}

      {/* INPUT FORM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Purchase Acquisition Inputs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
              1. Vessel Purchase & Acquisition Inputs
            </h3>
            <Badge variant="ocean">Acquisition Phase</Badge>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Agreed Vessel Purchase Price ($ USD) *
              </label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-navy-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pre-purchase Survey Cost ($)</label>
                <input
                  type="number"
                  value={surveyCost}
                  onChange={(e) => setSurveyCost(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Class / Technical Inspection ($)</label>
                <input
                  type="number"
                  value={inspectionCost}
                  onChange={(e) => setInspectionCost(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Legal & Notary Fees ($)</label>
                <input
                  type="number"
                  value={legalCost}
                  onChange={(e) => setLegalCost(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Flag State Registration Fees ($)</label>
                <input
                  type="number"
                  value={registrationCost}
                  onChange={(e) => setRegistrationCost(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Delivery / Towage Cost ($)</label>
                <input
                  type="number"
                  value={deliveryCost}
                  onChange={(e) => setDeliveryCost(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Repair & Handover Drydock ($)</label>
                <input
                  type="number"
                  value={repairCost}
                  onChange={(e) => setRepairCost(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sales & Divestment Inputs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
              2. Vessel Sales & Divestment Inputs
            </h3>
            <Badge variant="success">Divestment Phase</Badge>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Target Selling Price ($ USD) *
              </label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Broker Commission ($)</label>
                <input
                  type="number"
                  value={brokerCommission}
                  onChange={(e) => setBrokerCommission(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sales Survey / Condition ($)</label>
                <input
                  type="number"
                  value={salesSurveyCost}
                  onChange={(e) => setSalesSurveyCost(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">MOA Legal Drafting ($)</label>
                <input
                  type="number"
                  value={salesLegalCost}
                  onChange={(e) => setSalesLegalCost(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Deletion & Transfer Fees ($)</label>
                <input
                  type="number"
                  value={salesDocumentationCost}
                  onChange={(e) => setSalesDocumentationCost(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Buyer Handover Delivery ($)</label>
                <input
                  type="number"
                  value={salesDeliveryCost}
                  onChange={(e) => setSalesDeliveryCost(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Other Sales Expenses ($)</label>
                <input
                  type="number"
                  value={otherSalesExpenses}
                  onChange={(e) => setOtherSalesExpenses(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED FORMULA AUDIT TABLE */}
      {result && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <h4 className="text-sm font-black text-navy-900 uppercase tracking-wider">
            Audited Mathematical Breakdown
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block font-sans">Acquisition Valuation:</span>
              <div className="flex justify-between"><span>Base Purchase:</span><strong>${purchasePrice.toLocaleString()}</strong></div>
              <div className="flex justify-between text-slate-500"><span>Survey & Inspect:</span><span>+${(surveyCost + inspectionCost).toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-500"><span>Legal & Registration:</span><span>+${(legalCost + registrationCost).toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-500"><span>Delivery & Repair:</span><span>+${(deliveryCost + repairCost).toLocaleString()}</span></div>
              <div className="pt-2 border-t flex justify-between font-bold text-navy-900">
                <span>Total Acquisition:</span>
                <span>${result.totalAcquisitionCost?.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block font-sans">Profit & Return Metrics:</span>
              <div className="flex justify-between"><span>Gross Trading Profit:</span><strong>${result.grossTradingProfit?.toLocaleString()}</strong></div>
              <div className="flex justify-between text-rose-600"><span>Total Sales Expenses:</span><span>-${result.totalSalesExpenses?.toLocaleString()}</span></div>
              <div className="flex justify-between text-emerald-700 font-bold"><span>Net Trading Profit:</span><span>+${result.netTradingProfit?.toLocaleString()}</span></div>
              <div className="flex justify-between text-ocean-700 font-bold"><span>ROI Percentage:</span><span>{result.roiPercentage}%</span></div>
              <div className="pt-2 border-t flex justify-between font-bold text-amber-700">
                <span>Break-Even Price:</span>
                <span>${result.breakEvenSellingPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

