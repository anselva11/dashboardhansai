import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import ExportButton from '../../components/common/ExportButton';
import { TrendingUp, DollarSign, PieChart as PieIcon, BarChart3, Filter } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ProfitLossPage() {
  const [data, setData] = useState(null);
  const [division, setDivision] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPL();
  }, [division]);

  const fetchPL = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/finance/profit-loss?division=${encodeURIComponent(division)}`);
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
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

  const { summary = {}, revenueBreakdown = [], expenseBreakdown = [], monthlyBreakdown = [], divisionComparison = [] } = data;

  const exportHeaders = [
    { label: 'Category', key: 'category' },
    { label: 'Amount ($)', key: 'amount' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" /> Corporate Profit & Loss Statement
          </h1>
          <p className="text-xs text-slate-500">
            Multi-division P&L report for Shipping Line, Container Rental, Container Trading, and Vessel Trading.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            title={`Profit and Loss Statement (${division})`}
            filename="hansai_pnl"
            headers={exportHeaders}
            data={[...revenueBreakdown, ...expenseBreakdown]}
          />
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold">
            <span className="text-slate-400">Division:</span>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="bg-transparent font-bold text-navy-900 focus:outline-none"
            >
              <option value="All">All Divisions (Consolidated)</option>
              <option value="Shipping Line">Shipping Line</option>
              <option value="Container Rental">Container Rental</option>
              <option value="Container Trading">Container Trading</option>
              <option value="Vessel Trading">Vessel Trading</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Operating Revenue</span>
          <span className="text-2xl font-black text-navy-900 font-mono mt-1 block">${summary.totalRevenue?.toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-rose-600 font-bold uppercase block">Total Operating Expenses</span>
          <span className="text-2xl font-black text-rose-700 font-mono mt-1 block">${summary.totalExpense?.toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-emerald-600 font-bold uppercase block">Net Operating Profit</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">+${summary.netProfit?.toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-ocean-600 font-bold uppercase block">Profit Margin</span>
          <span className="text-2xl font-black text-ocean-700 font-mono mt-1 block">{summary.profitMargin}%</span>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-navy-900">Monthly Net Profit Trend ({division})</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, '']} />
              <Bar dataKey="revenue" fill="#176B87" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#DC4C4C" name="Expenses" radius={[4, 4, 0, 0]} />
              <Bar dataKey="netProfit" fill="#15966B" name="Net Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Division Comparison Breakdown */}
      {division === 'All' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-navy-900">Division Profitability Comparison</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {divisionComparison.map((d) => (
              <div key={d.division} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-navy-900 block text-sm">{d.division}</span>
                <div className="flex justify-between text-slate-600">
                  <span>Revenue:</span>
                  <strong className="font-mono">${d.revenue.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Expenses:</span>
                  <strong className="font-mono">-${d.expense.toLocaleString()}</strong>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-700">
                  <span>Net Profit:</span>
                  <strong className="font-mono text-sm">+${d.netProfit.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Revenue and Expense Line Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Revenue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
            <h4 className="font-bold text-emerald-900 uppercase tracking-wider text-[11px]">Revenue Streams</h4>
            <span className="font-mono font-bold text-emerald-800 text-sm">${summary.totalRevenue?.toLocaleString()}</span>
          </div>
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-100">
              {revenueBreakdown.map((r) => (
                <tr key={r.category} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{r.category}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">${r.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
            <h4 className="font-bold text-rose-900 uppercase tracking-wider text-[11px]">Expense Line Items</h4>
            <span className="font-mono font-bold text-rose-800 text-sm">${summary.totalExpense?.toLocaleString()}</span>
          </div>
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-100">
              {expenseBreakdown.map((e) => (
                <tr key={e.category} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{e.category}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700">${e.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

