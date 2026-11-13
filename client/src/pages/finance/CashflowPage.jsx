import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import { Repeat, DollarSign, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CashflowPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCashflow();
  }, []);

  const fetchCashflow = async () => {
    setLoading(true);
    try {
      const res = await api.get('/finance/cashflow');
      if (res.data?.success) setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { currentCashBalance = 0, monthlyCashflow = [] } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <Repeat className="w-6 h-6 text-ocean-600" /> Cashflow & Treasury Statement
          </h1>
          <p className="text-xs text-slate-500">
            Realized cash receipts, operational disbursements, and monthly closing liquidity.
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm font-mono text-xs">
          <span className="text-slate-400">Closing Treasury Reserve: </span>
          <span className="font-black text-navy-900 text-sm ml-1">${currentCashBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Cashflow Growth Line Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-navy-900">Closing Cash Liquidity Trend</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyCashflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, '']} />
              <Line type="monotone" dataKey="closingBalance" stroke="#176B87" strokeWidth={3} dot={{ r: 4 }} name="Closing Balance" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cashflow Monthly Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
            <tr>
              <th className="py-3 px-4">Fiscal Month</th>
              <th className="py-3 px-4 text-right">Cash Inflow (+)</th>
              <th className="py-3 px-4 text-right">Cash Outflow (-)</th>
              <th className="py-3 px-4 text-right">Net Cashflow</th>
              <th className="py-3 px-4 text-right">Closing Cash Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {monthlyCashflow.map((m) => (
              <tr key={m.month} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-4 font-bold text-slate-800 font-sans">{m.month}</td>
                <td className="py-2.5 px-4 text-right font-bold text-emerald-700">+${Math.round(m.inflow).toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right font-bold text-rose-700">-${Math.round(m.outflow).toLocaleString()}</td>
                <td className={`py-2.5 px-4 text-right font-black ${m.netCashflow >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {m.netCashflow >= 0 ? '+' : '-'}${Math.abs(Math.round(m.netCashflow)).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right font-black text-navy-900">${Math.round(m.closingBalance).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

