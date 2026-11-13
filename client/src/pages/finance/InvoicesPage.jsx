import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ExportButton from '../../components/common/ExportButton';
import { Receipt, Search, Plus, Printer, DollarSign, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    customerId: '',
    invoiceType: 'Sales Invoice',
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    items: [{ description: 'Ocean Freight & Port Clearance Services', quantity: 1, unitPrice: 3200 }],
    notes: 'Standard shipping commercial invoice.',
  });

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/finance/invoices');
      if (res.data?.success) {
        setInvoices(res.data.invoices);
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/crm/customers?limit=100');
      if (res.data?.success) {
        setCustomers(res.data.customers);
        if (res.data.customers.length > 0) {
          setNewInvoiceForm((p) => ({ ...p, customerId: res.data.customers[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/finance/invoices/${selectedInvoice.id}/payments`, {
        amount: Number(paymentAmount),
        paymentMethod: 'Bank Transfer (TT)',
        referenceNumber: `TRF-REC-${Date.now().toString().slice(-6)}`,
      });
      setShowPaymentModal(false);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/invoices', newInvoiceForm);
      setShowCreateModal(false);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  const exportHeaders = [
    { label: 'Invoice #', key: 'invoiceNumber' },
    { label: 'Type', key: 'invoiceType' },
    { label: 'Customer / Supplier', key: 'customer', format: (c, row) => c?.companyName || row.supplier?.companyName || 'N/A' },
    { label: 'Issue Date', key: 'issueDate', format: (d) => dayjs(d).format('YYYY-MM-DD') },
    { label: 'Due Date', key: 'dueDate', format: (d) => dayjs(d).format('YYYY-MM-DD') },
    { label: 'Subtotal ($)', key: 'subtotal' },
    { label: 'Total ($)', key: 'totalAmount' },
    { label: 'Paid ($)', key: 'paidAmount' },
    { label: 'Balance Due ($)', key: 'balanceDue' },
    { label: 'Status', key: 'status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-ocean-600" /> Invoices & Commercial Accounts
          </h1>
          <p className="text-xs text-slate-500">
            Generate printable PDF commercial invoices, manage collections, and track accounts receivable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            title="Commercial Invoices Register"
            filename="hansai_invoices"
            headers={exportHeaders}
            data={invoices}
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Amount Invoiced</span>
          <span className="text-2xl font-black text-navy-900 font-mono mt-1 block">${Number(metrics.totalInvoiced || 0).toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-emerald-600 font-bold uppercase block">Total Amount Collected</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">${Number(metrics.totalCollected || 0).toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-rose-600 font-bold uppercase block">Outstanding Balance (AR)</span>
          <span className="text-2xl font-black text-rose-700 font-mono mt-1 block">${Number(metrics.totalOutstanding || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Invoice Type</th>
                <th className="py-3 px-4">Billed Party</th>
                <th className="py-3 px-4">Issue / Due Date</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-navy-900">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4">
                    <Badge variant="primary" size="xs">{inv.invoiceType}</Badge>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {inv.customer?.companyName || inv.supplier?.companyName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {dayjs(inv.issueDate).format('DD MMM')} &bull; Due: {dayjs(inv.dueDate).format('DD MMM YYYY')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ${Number(inv.totalAmount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-rose-700">
                    ${Number(inv.balanceDue).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'} size="xs">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setShowInvoiceModal(true);
                        }}
                        className="px-2.5 py-1 bg-ocean-50 hover:bg-ocean-100 text-ocean-700 font-bold rounded flex items-center gap-1 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print PDF
                      </button>

                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPaymentAmount(inv.balanceDue);
                            setShowPaymentModal(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded transition-colors"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable PDF Invoice Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          title={`Commercial Invoice — ${selectedInvoice.invoiceNumber}`}
          maxWidth="max-w-3xl"
        >
          <div className="p-6 bg-white space-y-6 text-xs text-slate-800 print:p-0">
            {/* Header branding */}
            <div className="flex items-start justify-between border-b pb-6 border-slate-200">
              <div>
                <h2 className="text-xl font-extrabold text-[#102A43] tracking-wider">HANSAI SHIPPING LINE</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Maritime Logistics, Container Leasing & Fleet Operations</p>
                <p className="text-[11px] text-slate-500">Tanjung Priok International Terminal, Jakarta 14310</p>
                <p className="text-[11px] text-slate-500 font-mono">Tax ID: 01.442.889.2-048.000 &bull; Web: www.hansai.com</p>
              </div>

              <div className="text-right font-mono">
                <span className="text-lg font-black text-[#102A43] block">{selectedInvoice.invoiceNumber}</span>
                <span className="text-[11px] text-slate-500 block">Date: {dayjs(selectedInvoice.issueDate).format('DD MMM YYYY')}</span>
                <span className="text-[11px] text-rose-600 font-bold block">Due: {dayjs(selectedInvoice.dueDate).format('DD MMM YYYY')}</span>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Billed To:</span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">
                  {selectedInvoice.customer?.companyName || selectedInvoice.supplier?.companyName}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">{selectedInvoice.customer?.address || 'Corporate Headquarters'}</p>
                <p className="text-[11px] text-slate-600">{selectedInvoice.customer?.email}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Remittance Details:</span>
                <p className="text-[11px] text-slate-800 font-semibold mt-1">Bank: Bank Central Asia (BCA) / Citibank</p>
                <p className="text-[11px] text-slate-600">A/C: 8820-192-881 (USD Account)</p>
                <p className="text-[11px] text-slate-600">Beneficiary: PT HANSAI SHIPPING LINE</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-[#102A43] text-white text-[11px] uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(selectedInvoice.items || []).map((it, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{it.description}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{it.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">${Number(it.unitPrice).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">${Number(it.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>${Number(selectedInvoice.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PPN / VAT (11%):</span>
                  <span>${Number(selectedInvoice.taxAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Paid to Date:</span>
                  <span className="text-emerald-700 font-bold">-${Number(selectedInvoice.paidAmount).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-black text-navy-900">
                  <span>Balance Due:</span>
                  <span className="text-rose-700">${Number(selectedInvoice.balanceDue).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-navy-900 text-white font-bold rounded-lg flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Print Commercial Invoice
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title={`Record Payment for ${selectedInvoice?.invoiceNumber}`} maxWidth="max-w-md">
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Payment Amount ($ USD) *</label>
            <input
              type="number"
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-lg"
            >
              Confirm Settlement
            </button>
          </div>
        </form>
      </Modal>

      {/* Issue Invoice Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Issue New Commercial Invoice" maxWidth="max-w-lg">
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Customer / Consignee *</label>
            <select
              required
              value={newInvoiceForm.customerId}
              onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, customerId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Invoice Type</label>
              <select
                value={newInvoiceForm.invoiceType}
                onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, invoiceType: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="Sales Invoice">Sales Invoice</option>
                <option value="Rental Invoice">Rental Invoice</option>
                <option value="Proforma Invoice">Proforma Invoice</option>
                <option value="Vessel Invoice">Vessel Invoice</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Due Date</label>
              <input
                type="date"
                required
                value={newInvoiceForm.dueDate}
                onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Service Description *</label>
            <input
              type="text"
              required
              value={newInvoiceForm.items[0].description}
              onChange={(e) => setNewInvoiceForm({
                ...newInvoiceForm,
                items: [{ ...newInvoiceForm.items[0], description: e.target.value }],
              })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Amount ($ USD) *</label>
            <input
              type="number"
              required
              value={newInvoiceForm.items[0].unitPrice}
              onChange={(e) => setNewInvoiceForm({
                ...newInvoiceForm,
                items: [{ ...newInvoiceForm.items[0], unitPrice: Number(e.target.value) }],
              })}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

