import React, { useState } from 'react';
import ExportButton from '../../components/common/ExportButton';
import Badge from '../../components/common/Badge';
import { BarChart3, FileSpreadsheet, FileText, Filter, Calendar, Download } from 'lucide-react';

const REPORT_CATALOG = [
  { id: 'monthly_revenue', title: 'Monthly Revenue Report', division: 'Consolidated', desc: 'Detailed commercial revenue by division and transaction code.' },
  { id: 'monthly_expense', title: 'Monthly Expense Report', division: 'Consolidated', desc: 'Bunker fuel, port charges, maintenance, and fleet disbursements.' },
  { id: 'profit_loss', title: 'Profit & Loss Statement (P&L)', division: 'Consolidated', desc: 'Comprehensive income statement separated by corporate divisions.' },
  { id: 'cashflow', title: 'Cashflow & Treasury Statement', division: 'Treasury', desc: 'Inflow, outflow, and rolling closing cash reserves.' },
  { id: 'shipping_perf', title: 'Shipping Performance Report', division: 'Shipping Line', desc: 'On-time voyage completion, port turnaround times, and cargo volumes.' },
  { id: 'container_inv', title: 'Container Inventory & Valuation', division: 'Container Business', desc: '100 ISO containers categorized by type, condition, and depreciation.' },
  { id: 'rental_perf', title: 'Container Rental Performance', division: 'Container Business', desc: 'Contract durations, monthly leasing yield, late penalties, and deposits.' },
  { id: 'container_trade', title: 'Container Trading Profitability', division: 'Container Business', desc: 'Acquisition costs vs resale proceeds and gross margins.' },
  { id: 'vessel_trading', title: 'Vessel Fleet Trading Report', division: 'Vessel Management', desc: 'Module 21 fleet assets, acquisitions, divestments, and realized gain.' },
  { id: 'tax_thc', title: 'Tax, Duty & THC Audit Report', division: 'Finance & Customs', desc: 'Bea Masuk, PPN Impor 11%, PPh 22, and port terminal handling charges.' },
  { id: 'ar_aging', title: 'Customer Outstanding Aging (AR)', division: 'Finance', desc: 'Unpaid customer receivables grouped by 30/60/90 days.' },
  { id: 'ap_aging', title: 'Supplier Accounts Payable (AP)', division: 'Finance', desc: 'Pending vendor disbursements to shipyards, depots, and feeders.' },
];

export default function ReportsAnalyticsPage() {
  const [filterDivision, setFilterDivision] = useState('All');
  const [search, setSearch] = useState('');

  const filteredReports = REPORT_CATALOG.filter((r) => {
    const matchDiv = filterDivision === 'All' || r.division.includes(filterDivision);
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.desc.toLowerCase().includes(search.toLowerCase());
    return matchDiv && matchSearch;
  });

  const dummyData = [
    { period: 'Jan 2026', division: 'Shipping Line', amount: 148000, status: 'Audited' },
    { period: 'Feb 2026', division: 'Container Rental', amount: 89000, status: 'Audited' },
    { period: 'Mar 2026', division: 'Container Trading', amount: 125000, status: 'Audited' },
    { period: 'Apr 2026', division: 'Vessel Trading', amount: 480000, status: 'Audited' },
  ];

  const dummyHeaders = [
    { label: 'Fiscal Period', key: 'period' },
    { label: 'Corporate Division', key: 'division' },
    { label: 'Amount ($ USD)', key: 'amount' },
    { label: 'Audit Status', key: 'status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-ocean-600" /> Enterprise Reports & Analytics Center
          </h1>
          <p className="text-xs text-slate-500">
            Section 15: Generate official commercial statements with one-click Excel (.xlsx) and PDF exports.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={filterDivision}
            onChange={(e) => setFilterDivision(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg bg-white font-semibold text-slate-700"
          >
            <option value="All">All Divisions</option>
            <option value="Shipping Line">Shipping Line</option>
            <option value="Container">Container Business</option>
            <option value="Vessel">Vessel Management</option>
            <option value="Finance">Finance & Treasury</option>
          </select>
        </div>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((rep) => (
          <div key={rep.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="ocean" size="xs">{rep.division}</Badge>
                <span className="text-[10px] text-slate-400 font-mono">CODE: {rep.id.toUpperCase()}</span>
              </div>
              <h3 className="text-sm font-bold text-navy-900">{rep.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{rep.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">Format: XLSX / PDF</span>
              <ExportButton
                title={rep.title}
                filename={`hansai_${rep.id}`}
                headers={dummyHeaders}
                data={dummyData}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

