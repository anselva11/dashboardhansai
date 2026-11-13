import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import {
  Anchor,
  Ship,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  FileText,
  Wrench,
  Compass,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';

const TYPE_COLORS = ['#102A43', '#176B87', '#23A6C7', '#486581', '#627D98', '#15966B', '#D97706'];

export default function VesselDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vessels/dashboard');
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

  const { kpis = {}, charts = {}, tables = {} } = data;

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
          <Compass className="w-6 h-6 text-ocean-600" /> Vessel Trading & Fleet Executive Dashboard
        </h1>
        <p className="text-xs text-slate-500">
          Module 21: High-level intelligence covering fleet inventory, vessel acquisitions, realized trading profits, and surveys.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Fleet Asset Value"
          value={`$${Number(kpis.currentFleetAssetValue || 0).toLocaleString()}`}
          subtext="29 Owned Commercial Vessels"
          icon={Anchor}
          color="navy"
        />
        <StatCard
          title="Total Vessel Purchases"
          value={`$${Number(kpis.totalAcquisitionValue || 0).toLocaleString()}`}
          subtext={`${kpis.totalPurchases} Acquisitions Executed`}
          icon={ShoppingBag}
          color="ocean"
        />
        <StatCard
          title="Total Vessel Sales Revenue"
          value={`$${Number(kpis.totalSalesRevenue || 0).toLocaleString()}`}
          subtext={`${kpis.totalSales} Vessels Divested`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Realized Trading Profit"
          value={`+$${Number(kpis.realizedTradingProfit || 0).toLocaleString()}`}
          subtext="Net Commercial Gain"
          icon={DollarSign}
          color="emerald"
          trend={22.4}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vessel Distribution by Type */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Vessel Distribution by 7 Categories</h3>
            <span className="text-xs text-slate-400 font-mono">29 Total Vessels</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.vesselDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(charts.vesselDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} Vessels`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
            {(charts.vesselDistribution || []).map((t, idx) => (
              <div key={t.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[idx % TYPE_COLORS.length] }} />
                <span className="text-slate-600 truncate">{t.name}:</span>
                <span className="font-bold text-navy-900 font-mono">{t.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Status Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Operational & Fleet Readiness</h3>
            <span className="text-xs text-slate-400 font-mono">Fleet Utilization</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.operationalStatusDistribution || []} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#176B87" radius={[6, 6, 0, 0]} name="Vessels" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Average Purchase Price: ${Number(kpis.avgPurchasePrice || 0).toLocaleString()}</span>
            <span>Average Selling Price: ${Number(kpis.avgSellingPrice || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* TABLES: AVAILABLE FOR SALE & EXPIRING DOCUMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vessels Available for Sale */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
              <Anchor className="w-4 h-4 text-ocean-600" /> Vessels Currently Listed For Sale
            </h3>
            <Badge variant="warning" size="xs">{(tables.vesselsForSale || []).length} Available</Badge>
          </div>

          <div className="divide-y divide-slate-100">
            {(tables.vesselsForSale || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No vessels currently on sale market.</p>
            ) : (
              (tables.vesselsForSale || []).map((v) => (
                <div key={v.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800">{v.vesselName}</h5>
                    <p className="text-[11px] text-slate-500">
                      {v.vesselType} &bull; Built {v.yearBuilt} ({v.countryOfBuild})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 block">${Number(v.currentEstimatedValue).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">{v.currentLocation}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Certificate Expiration Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Certificate Expiration Alerts
            </h3>
            <Badge variant="danger" size="xs">Urgent Action</Badge>
          </div>

          <div className="divide-y divide-slate-100">
            {(tables.expiringDocuments || []).slice(0, 5).map((doc) => (
              <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <h5 className="font-bold text-slate-800">{doc.documentType}</h5>
                  <p className="text-[11px] text-slate-500">Vessel: {doc.vessel?.vesselName}</p>
                </div>
                <div className="text-right">
                  <Badge variant={doc.status === 'Expired' ? 'danger' : 'warning'} size="xs">
                    {doc.status}
                  </Badge>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    Expiry: {dayjs(doc.expiryDate).format('DD MMM YYYY')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

