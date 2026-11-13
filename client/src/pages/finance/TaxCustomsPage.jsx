import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import { Percent, Calculator, DollarSign, ShieldAlert, CheckCircle, Save, Info } from 'lucide-react';

export default function TaxCustomsPage() {
  const [activeTab, setActiveTab] = useState('customs');

  // Customs Inputs
  const [fobValue, setFobValue] = useState(45000);
  const [freight, setFreight] = useState(3800);
  const [insurance, setInsurance] = useState(450);
  const [exchangeRate, setExchangeRate] = useState(16250);
  const [bmRate, setBmRate] = useState(5.0);
  const [ppnRate, setPpnRate] = useState(11.0);
  const [pphRate, setPphRate] = useState(2.5); // 2.5% API or 7.5% Non-API
  const [cukaiAmount, setCukaiAmount] = useState(0);

  const [customsResult, setCustomsResult] = useState(null);

  // THC Inputs
  const [thcRate, setThcRate] = useState(145);
  const [thcQuantity, setThcQuantity] = useState(4);
  const [additionalHandling, setAdditionalHandling] = useState(50);
  const [thcVatRate, setThcVatRate] = useState(11.0);
  const [thcResult, setThcResult] = useState(null);

  // Tax Configs Master
  const [taxConfigs, setTaxConfigs] = useState([]);

  useEffect(() => {
    calculateCustoms();
    calculateThc();
    fetchConfigs();
  }, [fobValue, freight, insurance, exchangeRate, bmRate, ppnRate, pphRate, cukaiAmount, thcRate, thcQuantity, additionalHandling, thcVatRate]);

  const calculateCustoms = async () => {
    try {
      const res = await api.post('/calculators/tax-customs', {
        fobValue,
        freight,
        insurance,
        exchangeRate,
        bmRate,
        ppnRate,
        pphRate,
        cukaiAmount,
      });
      if (res.data?.success) setCustomsResult(res.data.result);
    } catch (e) {
      console.error(e);
    }
  };

  const calculateThc = async () => {
    try {
      const res = await api.post('/calculators/thc', {
        ratePerContainer: thcRate,
        quantity: thcQuantity,
        additionalHandling,
        vatRate: thcVatRate,
      });
      if (res.data?.success) setThcResult(res.data.result);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConfigs = async () => {
    try {
      const res = await api.get('/system/tax-configs');
      if (res.data?.success) setTaxConfigs(res.data.configs);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
          <Percent className="w-6 h-6 text-ocean-600" /> Maritime Tax, Customs & THC Engine
        </h1>
        <p className="text-xs text-slate-500">
          Section 11: Indonesian Customs Tariff (CIF Bea Masuk, PPN Impor 11%, PPh 22) and Terminal Handling Charges.
        </p>
      </div>

      {/* Legal & Regulatory Disclaimer */}
      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p>
          <strong>Official Tariff Compliance Notice:</strong> Rates and valuations presented are mathematical estimates under Minister of Finance regulations (PMK). Official billing requires verification against verified HS code classifications and PPJK CEISA declarations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('customs')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'customs' ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Import Duty & Customs Calculator (CIF Bea Masuk)
        </button>
        <button
          onClick={() => setActiveTab('thc')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'thc' ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Terminal Handling Charges (THC) Calculator
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'config' ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Configurable Tax Rates Master
        </button>
      </div>

      {/* TAB 1: CUSTOMS */}
      {activeTab === 'customs' && customsResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">CIF Value (USD)</span>
              <span className="text-2xl font-black text-navy-900 font-mono mt-1 block">
                ${customsResult.cifUsd?.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">FOB + Freight + Insurance</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-ocean-600 font-bold uppercase block">Bea Masuk Duty (IDR)</span>
              <span className="text-2xl font-black text-ocean-700 font-mono mt-1 block">
                Rp {customsResult.beaMasuk?.amountIdr?.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Rate: {bmRate}% CIF</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-emerald-600 font-bold uppercase block">PPN Impor (11%)</span>
              <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
                Rp {customsResult.ppnImpor?.amountIdr?.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Nilai Impor Base</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-rose-600 font-bold uppercase block">Total Duties & Taxes</span>
              <span className="text-2xl font-black text-rose-700 font-mono mt-1 block">
                Rp {customsResult.totalDutiesAndTaxesIdr?.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">${customsResult.totalDutiesAndTaxesUsd?.toLocaleString()} USD</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* Input Controls */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
                Customs CIF Input Parameters
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">FOB Value ($ USD)</label>
                    <input
                      type="number"
                      value={fobValue}
                      onChange={(e) => setFobValue(Number(e.target.value))}
                      className="w-full p-2 border rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ocean Freight ($ USD)</label>
                    <input
                      type="number"
                      value={freight}
                      onChange={(e) => setFreight(Number(e.target.value))}
                      className="w-full p-2 border rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Marine Insurance ($)</label>
                    <input
                      type="number"
                      value={insurance}
                      onChange={(e) => setInsurance(Number(e.target.value))}
                      className="w-full p-2 border rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tax Exchange Rate (NDBM)</label>
                    <input
                      type="number"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(Number(e.target.value))}
                      className="w-full p-2 border rounded font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bea Masuk (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={bmRate}
                      onChange={(e) => setBmRate(Number(e.target.value))}
                      className="w-full p-1.5 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">PPN Impor (%)</label>
                    <input
                      type="number"
                      value={ppnRate}
                      onChange={(e) => setPpnRate(Number(e.target.value))}
                      className="w-full p-1.5 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">PPh 22 Impor (%)</label>
                    <select
                      value={pphRate}
                      onChange={(e) => setPphRate(Number(e.target.value))}
                      className="w-full p-1.5 border rounded font-mono text-[11px]"
                    >
                      <option value={2.5}>2.5% (With API)</option>
                      <option value={7.5}>7.5% (Non-API)</option>
                      <option value={0.5}>0.5% (Soy/Wheat/Flour)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 font-mono">
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider font-sans">
                Official Customs Assessment Structure
              </h3>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between"><span>CIF Customs Value (USD):</span><strong>${customsResult.cifUsd?.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>CIF Customs Value (IDR):</span><strong>Rp {customsResult.cifIdr?.toLocaleString()}</strong></div>
                <div className="flex justify-between text-ocean-700"><span>(+) Bea Masuk Duty ({bmRate}%):</span><strong>Rp {customsResult.beaMasuk?.amountIdr?.toLocaleString()}</strong></div>
                <div className="pt-1.5 border-t flex justify-between font-bold text-slate-900">
                  <span>Nilai Impor Base:</span>
                  <span>Rp {customsResult.nilaiImporIdr?.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-emerald-700"><span>PPN Impor (11% x Nilai Impor):</span><strong>Rp {customsResult.ppnImpor?.amountIdr?.toLocaleString()}</strong></div>
                <div className="flex justify-between text-purple-700"><span>PPh Pasal 22 ({pphRate}%):</span><strong>Rp {customsResult.pph22?.amountIdr?.toLocaleString()}</strong></div>
                <div className="pt-1.5 border-t flex justify-between font-bold text-rose-700 text-sm font-sans">
                  <span>Total Government Duties & Taxes:</span>
                  <span className="font-mono">Rp {customsResult.totalDutiesAndTaxesIdr?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THC */}
      {activeTab === 'thc' && thcResult && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
            Terminal Handling Charge (THC) Calculator Formula
          </h3>
          <p className="text-slate-500">
            Formula: Total THC = (Rate &times; Container Quantity) + Additional Handling + VAT
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">THC Rate per Container ($ USD)</label>
              <input
                type="number"
                value={thcRate}
                onChange={(e) => setThcRate(Number(e.target.value))}
                className="w-full p-2 border rounded font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Container Quantity</label>
              <input
                type="number"
                value={thcQuantity}
                onChange={(e) => setThcQuantity(Number(e.target.value))}
                className="w-full p-2 border rounded font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Additional Lift-On/Lift-Off ($)</label>
              <input
                type="number"
                value={additionalHandling}
                onChange={(e) => setAdditionalHandling(Number(e.target.value))}
                className="w-full p-2 border rounded font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Applicable Port VAT (%)</label>
              <input
                type="number"
                value={thcVatRate}
                onChange={(e) => setThcVatRate(Number(e.target.value))}
                className="w-full p-2 border rounded font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono space-y-1.5">
            <div className="flex justify-between"><span>Base THC ({thcQuantity} units):</span><strong>${thcResult.baseTHC}</strong></div>
            <div className="flex justify-between"><span>Handling Surcharge:</span><strong>+${thcResult.additionalHandling}</strong></div>
            <div className="flex justify-between"><span>VAT (11%):</span><strong>+${thcResult.vatAmount}</strong></div>
            <div className="pt-2 border-t flex justify-between font-black text-navy-900 text-sm font-sans">
              <span>Total Calculated THC:</span>
              <span className="font-mono text-base text-ocean-700">${thcResult.totalTHC} USD</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIG */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Tariff Rule Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Base Formula</th>
                <th className="py-3 px-4 text-right">Standard Rate</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {taxConfigs.map((tc) => (
                <tr key={tc.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-navy-900">{tc.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{tc.name}</td>
                  <td className="py-3 px-4"><Badge variant="primary" size="xs">{tc.category}</Badge></td>
                  <td className="py-3 px-4 font-mono text-slate-600">{tc.taxBaseFormula}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-ocean-700">{tc.ratePercent}%</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={tc.isActive ? 'success' : 'default'} size="xs">Active</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

