import React, { useState, useEffect } from 'react';
import api from '../api/client';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Ship,
  Box,
  Repeat,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Anchor,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';

const DIVISION_COLORS = ['#102A43', '#176B87', '#23A6C7', '#627D98', '#9FB3C8'];
const STATUS_COLORS = ['#15966B', '#23A6C7', '#176B87', '#E6A23C', '#DC4C4C'];

export default function Dashboard() {
  const [period, setPeriod] = useState('This Year');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard?period=${encodeURIComponent(period)}`);
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => `$${Number(val || 0).toLocaleString()}`;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Real-time ERP Telemetry...
          </p>
        </div>
      </div>
    );
  }

  const { financialKPI = {}, operationalKPI = {}, charts = {}, recentShipments = [], recentTransactions = [], upcomingSchedules = [], paymentAlerts = [] } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            Executive Fleet & Commercial Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time multi-division metrics calculated live from PostgreSQL database.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1 uppercase tracking-wider">
            <Filter className="w-3 h-3" /> Period:
          </span>
          {['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                period === p
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: FINANCIAL KPIS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-navy-900 tracking-wider uppercase flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Financial Performance KPIs
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">Currency: USD</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(financialKPI.totalRevenue)}
            subtext="Consolidated corporate income"
            icon={TrendingUp}
            color="ocean"
            trend={14.8}
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(financialKPI.totalExpenses)}
            subtext="Fleet fuel, port & container costs"
            icon={DollarSign}
            color="rose"
            trend={-4.2}
          />
          <StatCard
            title="Gross Profit"
            value={formatCurrency(financialKPI.grossProfit)}
            subtext={`Margin: ${financialKPI.totalRevenue > 0 ? (((financialKPI.grossProfit) / financialKPI.totalRevenue) * 100).toFixed(1) : 0}%`}
            icon={TrendingUp}
            color="emerald"
            trend={18.5}
          />
          <StatCard
            title="Cash Balance"
            value={formatCurrency(financialKPI.cashBalance)}
            subtext="Available treasury reserves"
            icon={CreditCard}
            color="navy"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accounts Receivable (AR)</p>
              <p className="text-lg font-black text-navy-900 font-mono mt-0.5">{formatCurrency(financialKPI.accountsReceivable)}</p>
            </div>
            <Badge variant="ocean" size="sm">Active Receivables</Badge>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accounts Payable (AP)</p>
              <p className="text-lg font-black text-rose-700 font-mono mt-0.5">{formatCurrency(financialKPI.accountsPayable)}</p>
            </div>
            <Badge variant="danger" size="sm">Payable Obligations</Badge>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Invoices</p>
              <p className="text-lg font-black text-amber-700 font-mono mt-0.5">{financialKPI.outstandingInvoicesCount} Invoices</p>
            </div>
            <Badge variant="warning" size="sm">Action Required</Badge>
          </div>
        </div>
      </div>

      {/* SECTION 2: OPERATIONAL KPIS */}
      <div>
        <h2 className="text-xs font-bold text-navy-900 tracking-wider uppercase flex items-center gap-1.5 mb-3">
          <Ship className="w-4 h-4 text-ocean-600" /> Operational & Fleet Telemetry
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Shipments</p>
            <p className="text-xl font-extrabold text-navy-900 font-mono mt-1">{operationalKPI.totalShipments}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Active</p>
            <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1">{operationalKPI.activeShipments}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold text-ocean-600 uppercase">Delivered</p>
            <p className="text-xl font-extrabold text-ocean-700 font-mono mt-1">{operationalKPI.completedShipments}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold text-rose-600 uppercase">Delayed</p>
            <p className="text-xl font-extrabold text-rose-700 font-mono mt-1">{operationalKPI.delayedShipments}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Containers</p>
            <p className="text-xl font-extrabold text-navy-900 font-mono mt-1">{operationalKPI.totalContainers}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold text-ocean-600 uppercase">Available</p>
            <p className="text-xl font-extrabold text-ocean-700 font-mono mt-1">{operationalKPI.availableContainers}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold text-amber-600 uppercase">Rented</p>
            <p className="text-xl font-extrabold text-amber-700 font-mono mt-1">{operationalKPI.rentedContainers}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold text-purple-600 uppercase">Fleet Vessels</p>
            <p className="text-xl font-extrabold text-purple-700 font-mono mt-1">{operationalKPI.totalFleet}</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: CHARTS & VISUALIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue vs Expense (2 cols) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Monthly Revenue vs. Expenses</h3>
              <p className="text-xs text-slate-400">Cashflow & operational disbursement trend</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-semibold text-ocean-600">
                <span className="w-2.5 h-2.5 rounded-full bg-ocean-600"></span> Revenue
              </span>
              <span className="flex items-center gap-1 font-semibold text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Expenses
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#176B87" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expense" fill="#DC4C4C" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Business Division (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-navy-900">Revenue by Division</h3>
            <p className="text-xs text-slate-400">Commercial contribution breakdown</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.divisionRevenue || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts.divisionRevenue || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DIVISION_COLORS[index % DIVISION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {(charts.divisionRevenue || []).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 truncate max-w-[160px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: DIVISION_COLORS[idx % DIVISION_COLORS.length] }}
                  />
                  {item.name}
                </span>
                <span className="font-bold text-navy-900 font-mono">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: RECENT SHIPMENTS & UPCOMING SCHEDULES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Shipments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
              <Ship className="w-4 h-4 text-ocean-600" /> Active Shipments
            </h3>
            <a href="/operations/shipments" className="text-xs font-bold text-ocean-600 hover:text-ocean-700">
              View All &rarr;
            </a>
          </div>

          <div className="divide-y divide-slate-100">
            {recentShipments.slice(0, 5).map((shp) => (
              <div key={shp.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-navy-900">{shp.shipmentNumber}</span>
                    <Badge variant={shp.status === 'Delivered' ? 'success' : 'ocean'} size="xs">
                      {shp.status}
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{shp.commodity} &bull; {shp.customer?.companyName}</p>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-slate-700 block">{shp.pol.split(' ')[0]} &rarr; {shp.pod.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-400 font-mono">ETD: {dayjs(shp.etd).format('DD MMM')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Vessel Schedules */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
              <Anchor className="w-4 h-4 text-ocean-600" /> Upcoming Vessel Schedules
            </h3>
            <a href="/operations/vessel-schedule" className="text-xs font-bold text-ocean-600 hover:text-ocean-700">
              View Schedules &rarr;
            </a>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingSchedules.slice(0, 5).map((sch) => (
              <div key={sch.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900">{sch.vesselName}</span>
                    <Badge variant="primary" size="xs">{sch.voyageNumber}</Badge>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{sch.originPort} &rarr; {sch.destinationPort}</p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-ocean-700 font-bold block">{dayjs(sch.etd).format('DD MMM YYYY')}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">{sch.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5: OUTSTANDING PAYMENT ALERTS & RECENT TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Outstanding Receivables & Payment Alerts
            </h3>
            <Badge variant="warning" size="xs">{paymentAlerts.length} Overdue</Badge>
          </div>

          <div className="divide-y divide-slate-100">
            {paymentAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No overdue invoices currently logged.</p>
            ) : (
              paymentAlerts.map((alt) => (
                <div key={alt.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-rose-700">{alt.invoiceNumber}</span>
                    <p className="text-slate-600 font-medium">{alt.entityName}</p>
                    <span className="text-[10px] text-rose-600 font-semibold">{alt.daysOverdue} days overdue</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-slate-900 text-sm block">${Number(alt.amount).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">Due: {dayjs(alt.dueDate).format('DD MMM YYYY')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Financial Transactions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-ocean-600" /> Recent Financial Ledger
            </h3>
            <a href="/finance/transactions" className="text-xs font-bold text-ocean-600 hover:text-ocean-700">
              View Ledger &rarr;
            </a>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="truncate max-w-[240px]">
                  <p className="font-bold text-slate-800 truncate">{tx.description}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{dayjs(tx.date).format('DD MMM YYYY')} &bull; {tx.division}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`font-mono font-bold text-xs ${tx.type === 'Income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {tx.type === 'Income' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{tx.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

