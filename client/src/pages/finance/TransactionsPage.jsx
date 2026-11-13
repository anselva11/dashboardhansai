import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ExportButton from '../../components/common/ExportButton';
import { DollarSign, Search, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalCount: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [division, setDivision] = useState('All');
  const [type, setType] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    division: 'Shipping Line',
    type: 'Income',
    category: 'Ocean Freight',
    amount: 12500,
    currency: 'USD',
    exchangeRate: 16250,
    description: 'Freight collection - Asia-Middle East trade lane',
    paymentMethod: 'Bank Transfer',
  });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, division, type]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });
      if (search) params.append('search', search);
      if (division !== 'All') params.append('division', division);
      if (type !== 'All') params.append('type', type);

      const res = await api.get(`/finance/transactions?${params.toString()}`);
      if (res.data?.success) {
        setTransactions(res.data.transactions);
        setTotals(res.data.totals);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchTransactions();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/transactions', form);
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record transaction');
    }
  };

  const exportHeaders = [
    { label: 'Transaction #', key: 'transactionNumber' },
    { label: 'Date', key: 'date', format: (d) => dayjs(d).format('YYYY-MM-DD') },
    { label: 'Division', key: 'division' },
    { label: 'Type', key: 'type' },
    { label: 'Category', key: 'category' },
    { label: 'Amount ($)', key: 'amount' },
    { label: 'Amount (IDR)', key: 'amountIdr' },
    { label: 'Description', key: 'description' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-ocean-600" /> Financial Transactions Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Unified multi-division general ledger entries across all commercial transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            title="Financial Transactions Ledger"
            filename="hansai_transactions"
            headers={exportHeaders}
            data={transactions}
            orientation="landscape"
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-600 font-bold uppercase block">Total Cash Inflow</span>
            <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">+${Number(totals.totalIncome || 0).toLocaleString()}</span>
          </div>
          <Badge variant="success">Revenue Streams</Badge>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-rose-600 font-bold uppercase block">Total Cash Outflow</span>
            <span className="text-xl font-black text-rose-700 font-mono mt-0.5 block">-${Number(totals.totalExpense || 0).toLocaleString()}</span>
          </div>
          <Badge variant="danger">Disbursements</Badge>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-navy-900 font-bold uppercase block">Net Ledger Cashflow</span>
            <span className="text-xl font-black text-navy-900 font-mono mt-0.5 block">${Number(totals.netCashflow || 0).toLocaleString()}</span>
          </div>
          <Badge variant="ocean">Surplus Balance</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Transaction #, Description, Reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-ocean-500 font-mono"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={division}
            onChange={(e) => {
              setDivision(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
          >
            <option value="All">All Divisions</option>
            <option value="Shipping Line">Shipping Line</option>
            <option value="Container Rental">Container Rental</option>
            <option value="Container Trading">Container Trading</option>
            <option value="Vessel Trading">Vessel Trading</option>
          </select>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
          >
            <option value="All">All Types</option>
            <option value="Income">Income (+)</option>
            <option value="Expense">Expense (-)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">TRX #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Division</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount (USD)</th>
                <th className="py-3 px-4 text-right">Amount (IDR)</th>
                <th className="py-3 px-4 text-center">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">Loading ledger records...</td>
                </tr>
              ) : transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-navy-900">{t.transactionNumber}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{dayjs(t.date).format('DD MMM YYYY')}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{t.division}</td>
                  <td className="py-3 px-4">
                    <Badge variant="primary" size="xs">{t.category}</Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium truncate max-w-[280px]">{t.description}</td>
                  <td className={`py-3 px-4 text-right font-mono font-bold ${t.type === 'Income' ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {t.type === 'Income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400 text-[10px]">
                    Rp {Number(t.amountIdr).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={t.type === 'Income' ? 'success' : 'danger'} size="xs">{t.type}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} entries)</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page <= 1}
              className="px-2.5 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-2.5 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Record Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Ledger Transaction" maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Division</label>
              <select
                value={form.division}
                onChange={(e) => setForm({ ...form, division: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="Shipping Line">Shipping Line</option>
                <option value="Container Rental">Container Rental</option>
                <option value="Container Trading">Container Trading</option>
                <option value="Vessel Trading">Vessel Trading</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="Income">Income (+)</option>
                <option value="Expense">Expense (-)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
              <input
                type="text"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Amount ($ USD) *</label>
              <input
                type="number"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Description *</label>
            <input
              type="text"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
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
              className="px-4 py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg"
            >
              Post Transaction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

