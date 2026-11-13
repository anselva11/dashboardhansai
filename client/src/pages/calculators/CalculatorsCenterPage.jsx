import React, { useState } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import {
  Calculator,
  Ship,
  Box,
  Repeat,
  TrendingUp,
  Percent,
  RefreshCw,
  Coins,
} from 'lucide-react';

export default function CalculatorsCenterPage() {
  const [activeTab, setActiveTab] = useState('ocean');

  // A. Ocean Freight
  const [ofForm, setOfForm] = useState({
    containerType: '40FT High Cube',
    quantity: 2,
    baseFreightRate: 1950,
    baf: 250,
    caf: 120,
    isps: 45,
    thc: 150,
    docFee: 75,
    otherCharges: 40,
  });
  const [ofResult, setOfResult] = useState(null);

  // B. FCL Landed Cost
  const [fclForm, setFclForm] = useState({
    containerType: '40FT High Cube',
    quantity: 1,
    freightRate: 2100,
    thcOrigin: 145,
    thcDestination: 180,
    trucking: 350,
    customs: 250,
    insurance: 150,
  });
  const [fclResult, setFclResult] = useState(null);

  // C. LCL W/M Calculator
  const [lclForm, setLclForm] = useState({
    grossWeightKg: 1450,
    cbm: 3.2,
    freightRatePerWm: 85,
    cfsCharge: 25,
    handlingFee: 35,
    docFee: 50,
    minimumCharge: 150,
  });
  const [lclResult, setLclResult] = useState(null);

  // D. CBM Calculator
  const [cbmForm, setCbmForm] = useState({
    lengthCm: 120,
    widthCm: 80,
    heightCm: 100,
    quantity: 25,
  });
  const [cbmResult, setCbmResult] = useState(null);

  // E. Currency Converter
  const [currAmount, setCurrAmount] = useState(1000);
  const [currBase, setCurrBase] = useState('USD');
  const [currTarget, setCurrTarget] = useState('IDR');
  const [currRate, setCurrRate] = useState(16250);

  // F. Profit Margin
  const [marginForm, setMarginForm] = useState({
    sellingPrice: 8500,
    purchaseCost: 5200,
    operationalCost: 800,
    taxRate: 11,
  });
  const [marginResult, setMarginResult] = useState(null);

  // Run initial calculations on demand
  const handleCalcOcean = async () => {
    try {
      const res = await api.post('/calculators/ocean-freight', ofForm);
      if (res.data?.success) setOfResult(res.data.result);
    } catch (e) { console.error(e); }
  };

  const handleCalcLCL = async () => {
    try {
      const res = await api.post('/calculators/lcl', lclForm);
      if (res.data?.success) setLclResult(res.data.result);
    } catch (e) { console.error(e); }
  };

  const handleCalcCBM = async () => {
    try {
      const res = await api.post('/calculators/cbm', cbmForm);
      if (res.data?.success) setCbmResult(res.data.result);
    } catch (e) { console.error(e); }
  };

  const handleCalcMargin = async () => {
    try {
      const res = await api.post('/calculators/profit-margin', marginForm);
      if (res.data?.success) setMarginResult(res.data.result);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
          <Calculator className="w-6 h-6 text-ocean-600" /> Maritime Logistics Calculators Center
        </h1>
        <p className="text-xs text-slate-500">
          Section 12: Ocean freight, FCL landed cost, LCL W/M revenue ton, volumetric CBM, currency converter, and margins.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('ocean')}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'ocean' ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Ocean Freight Calculator
        </button>
        <button
          onClick={() => setActiveTab('lcl')}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'lcl' ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          LCL W/M Calculator
        </button>
        <button
          onClick={() => setActiveTab('cbm')}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'cbm' ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          CBM Volumetric Calculator
        </button>
        <button
          onClick={() => setActiveTab('currency')}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'currency' ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Multi-Currency Converter
        </button>
        <button
          onClick={() => setActiveTab('margin')}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'margin' ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Profit Margin & Markup
        </button>
      </div>

      {/* TAB A: OCEAN FREIGHT */}
      {activeTab === 'ocean' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
              Ocean Freight Surcharges Breakdown
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Container Type</label>
                <select
                  value={ofForm.containerType}
                  onChange={(e) => setOfForm({ ...ofForm, containerType: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="20FT Standard">20FT Standard</option>
                  <option value="40FT Standard">40FT Standard</option>
                  <option value="40FT High Cube">40FT High Cube</option>
                  <option value="40FT Refrigerated">40FT Refrigerated</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={ofForm.quantity}
                  onChange={(e) => setOfForm({ ...ofForm, quantity: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Base Ocean Freight ($)</label>
                <input
                  type="number"
                  value={ofForm.baseFreightRate}
                  onChange={(e) => setOfForm({ ...ofForm, baseFreightRate: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">BAF (Bunker Adj.) ($)</label>
                <input
                  type="number"
                  value={ofForm.baf}
                  onChange={(e) => setOfForm({ ...ofForm, baf: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">CAF (Currency Adj.) ($)</label>
                <input
                  type="number"
                  value={ofForm.caf}
                  onChange={(e) => setOfForm({ ...ofForm, caf: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">THC Origin ($)</label>
                <input
                  type="number"
                  value={ofForm.thc}
                  onChange={(e) => setOfForm({ ...ofForm, thc: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">ISPS Port Security ($)</label>
                <input
                  type="number"
                  value={ofForm.isps}
                  onChange={(e) => setOfForm({ ...ofForm, isps: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Documentation Fee ($)</label>
                <input
                  type="number"
                  value={ofForm.docFee}
                  onChange={(e) => setOfForm({ ...ofForm, docFee: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleCalcOcean}
              className="w-full py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg transition-colors mt-2"
            >
              Calculate Ocean Freight
            </button>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 font-mono space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900 uppercase font-sans mb-3">Freight Valuation</h3>
              {ofResult ? (
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Rate Per Unit:</span><strong>${ofResult.ratePerUnit}</strong></div>
                  <div className="flex justify-between"><span>Base Freight:</span><span>${ofResult.breakdown?.freight}</span></div>
                  <div className="flex justify-between"><span>Total BAF Surcharges:</span><span>+${ofResult.breakdown?.baf}</span></div>
                  <div className="flex justify-between"><span>Total CAF Surcharges:</span><span>+${ofResult.breakdown?.caf}</span></div>
                  <div className="flex justify-between"><span>Total THC Charges:</span><span>+${ofResult.breakdown?.thc}</span></div>
                  <div className="flex justify-between"><span>Documentation Fee:</span><span>+${ofResult.breakdown?.docFee}</span></div>
                  <div className="pt-3 border-t flex justify-between font-bold text-base text-navy-900 font-sans">
                    <span>Grand Total Freight:</span>
                    <span className="font-mono text-ocean-700 text-lg">${ofResult.grandTotal} USD</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 font-sans text-xs">Click calculate to view comprehensive freight statement.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB B: LCL W/M */}
      {activeTab === 'lcl' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
              LCL Weight / Measure (W/M) Parameters
            </h3>
            <p className="text-slate-500">
              International Revenue Ton rule: 1 CBM = 1,000 KG (whichever yields greater freight rate).
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gross Weight (KG)</label>
                <input
                  type="number"
                  value={lclForm.grossWeightKg}
                  onChange={(e) => setLclForm({ ...lclForm, grossWeightKg: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cargo Volume (CBM)</label>
                <input
                  type="number"
                  step="0.1"
                  value={lclForm.cbm}
                  onChange={(e) => setLclForm({ ...lclForm, cbm: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rate per W/M ($ USD)</label>
                <input
                  type="number"
                  value={lclForm.freightRatePerWm}
                  onChange={(e) => setLclForm({ ...lclForm, freightRatePerWm: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">CFS Destuffing Rate ($)</label>
                <input
                  type="number"
                  value={lclForm.cfsCharge}
                  onChange={(e) => setLclForm({ ...lclForm, cfsCharge: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleCalcLCL}
              className="w-full py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg transition-colors mt-2"
            >
              Evaluate W/M & Calculate LCL Cost
            </button>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 font-mono space-y-3">
            <h3 className="text-sm font-bold text-navy-900 uppercase font-sans">Revenue Ton Assessment</h3>
            {lclResult ? (
              <div className="space-y-2">
                <div className="p-3 bg-white rounded-xl border flex items-center justify-between">
                  <span className="font-sans font-bold text-slate-700">Applied Basis:</span>
                  <Badge variant="ocean">{lclResult.basisApplied}</Badge>
                </div>
                <div className="flex justify-between"><span>Weight in Metric Ton:</span><strong>{lclResult.weightMT} MT</strong></div>
                <div className="flex justify-between"><span>Volume in CBM:</span><strong>{lclResult.cbm} CBM</strong></div>
                <div className="flex justify-between"><span>Chargeable Revenue Ton:</span><strong>{lclResult.chargeableRevenueTon} RT</strong></div>
                <div className="flex justify-between"><span>Freight Subtotal:</span><span>${lclResult.freightSubtotal}</span></div>
                <div className="flex justify-between"><span>CFS Charges:</span><span>${lclResult.cfsSubtotal}</span></div>
                <div className="pt-2 border-t flex justify-between font-bold text-base text-navy-900 font-sans">
                  <span>Total Landed LCL Cost:</span>
                  <span className="font-mono text-ocean-700 text-lg">${lclResult.totalLCLCost} USD</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 font-sans text-xs">Run evaluation to view chargeable revenue ton assessment.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB C: CBM CALCULATOR */}
      {activeTab === 'cbm' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
            CBM Volumetric Formula: (Length &times; Width &times; Height &times; Qty) / 1,000,000
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Length (cm)</label>
              <input
                type="number"
                value={cbmForm.lengthCm}
                onChange={(e) => setCbmForm({ ...cbmForm, lengthCm: Number(e.target.value) })}
                className="w-full p-2 border rounded font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Width (cm)</label>
              <input
                type="number"
                value={cbmForm.widthCm}
                onChange={(e) => setCbmForm({ ...cbmForm, widthCm: Number(e.target.value) })}
                className="w-full p-2 border rounded font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={cbmForm.heightCm}
                onChange={(e) => setCbmForm({ ...cbmForm, heightCm: Number(e.target.value) })}
                className="w-full p-2 border rounded font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Package Qty</label>
              <input
                type="number"
                value={cbmForm.quantity}
                onChange={(e) => setCbmForm({ ...cbmForm, quantity: Number(e.target.value) })}
                className="w-full p-2 border rounded font-mono font-bold text-ocean-700"
              />
            </div>
          </div>

          <button
            onClick={handleCalcCBM}
            className="w-full py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg transition-colors"
          >
            Compute Total Volume (CBM)
          </button>

          {cbmResult && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Consignment Volume</span>
              <span className="text-3xl font-black text-navy-900 font-mono block">{cbmResult.totalCbm} CBM</span>
              <span className="text-slate-500 font-mono text-[11px] block">({cbmResult.cbmPerPiece} CBM per carton)</span>
            </div>
          )}
        </div>
      )}

      {/* TAB D: CURRENCY CONVERTER */}
      {activeTab === 'currency' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" /> Maritime Foreign Exchange Converter
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Amount</label>
              <input
                type="number"
                value={currAmount}
                onChange={(e) => setCurrAmount(Number(e.target.value))}
                className="w-full p-2 border rounded font-mono font-bold text-base"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Exchange Rate (USD to IDR)</label>
              <input
                type="number"
                value={currRate}
                onChange={(e) => setCurrRate(Number(e.target.value))}
                className="w-full p-2 border rounded font-mono font-bold text-base"
              />
            </div>
          </div>

          <div className="p-5 bg-gradient-to-r from-navy-900 to-ocean-800 text-white rounded-xl text-center space-y-1">
            <span className="text-xs text-slate-300 font-mono">${currAmount.toLocaleString()} USD equals</span>
            <h2 className="text-3xl font-black font-mono">
              Rp {(currAmount * currRate).toLocaleString()} IDR
            </h2>
          </div>
        </div>
      )}

      {/* TAB E: MARGIN CALCULATOR */}
      {activeTab === 'margin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
              Commercial Price & Margin Inputs
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Selling Price ($)</label>
                <input
                  type="number"
                  value={marginForm.sellingPrice}
                  onChange={(e) => setMarginForm({ ...marginForm, sellingPrice: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono font-bold text-emerald-700"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Direct Purchase Cost ($)</label>
                <input
                  type="number"
                  value={marginForm.purchaseCost}
                  onChange={(e) => setMarginForm({ ...marginForm, purchaseCost: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Operating Overhead / Handling ($)</label>
                <input
                  type="number"
                  value={marginForm.operationalCost}
                  onChange={(e) => setMarginForm({ ...marginForm, operationalCost: Number(e.target.value) })}
                  className="w-full p-2 border rounded font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleCalcMargin}
              className="w-full py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg transition-colors mt-2"
            >
              Analyze Profit Margin
            </button>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 font-mono space-y-3">
            <h3 className="text-sm font-bold text-navy-900 uppercase font-sans">Margin & Markup Analytics</h3>
            {marginResult ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-white rounded-xl border">
                    <span className="text-[10px] text-slate-400 font-bold uppercase font-sans block">Gross Profit</span>
                    <span className="text-xl font-black text-navy-900 mt-1 block">${marginResult.grossProfit}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase font-sans block">Net Profit</span>
                    <span className="text-xl font-black text-emerald-700 mt-1 block">${marginResult.netProfit}</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border space-y-2">
                  <div className="flex justify-between font-sans">
                    <span className="font-bold text-slate-700">Profit Margin %:</span>
                    <strong className="text-ocean-700 font-mono text-base">{marginResult.marginPercent}%</strong>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span className="font-bold text-slate-700">Cost Markup %:</span>
                    <strong className="text-slate-800 font-mono">{marginResult.markupPercent}%</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 font-sans text-xs">Run analysis to view profit margin & markup breakdown.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

