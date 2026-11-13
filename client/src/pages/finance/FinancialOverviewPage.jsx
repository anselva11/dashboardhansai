import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { DollarSign, TrendingUp, CreditCard, ArrowRight, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinancialOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard?period=This Year');
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

  const { financialKPI = {}, charts = {} } = data;

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-ocean-600" /> Financial Overview & Treasury
        </h1>
        <p className="text-xs text-slate-500">
          Executive financial performance across shipping, container leasing, equipment trading, and vessel brokerage.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Consolidated Revenue"
          value={`$${Number(financialKPI.totalRevenue).toLocaleString()}`}
          subtext="Commercial freight & asset sales"
          icon={TrendingUp}
          color="ocean"
        />
        <StatCard
          title="Operating Expenses"
          value={`$${Number(financialKPI.totalExpenses).toLocaleString()}`}
          subtext="Bunkers, port dues, & depot repair"
          icon={DollarSign}
          color="rose"
        />
        <StatCard
          title="Gross Operating Profit"
          value={`$${Number(financialKPI.grossProfit).toLocaleString()}`}
          subtext="Net operational margin"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Cash Balance Reserve"
          value={`$${Number(financialKPI.cashBalance).toLocaleString()}`}
          subtext="Citibank & BCA Nostro"
          icon={CreditCard}
          color="navy"
        />
      </div>

      {/* Cashflow Growth Trend */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy-900">Annual Cash Inflow vs Outflow Trajectory</h3>
          <span className="text-xs text-slate-400 font-mono">Fiscal Year 2026</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#176B87" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#176B87" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, '']} />
              <Area type="monotone" dataKey="revenue" stroke="#176B87" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
              <Area type="monotone" dataKey="expense" stroke="#DC4C4C" strokeWidth={2} fillOpacity={0.1} fill="#DC4C4C" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

