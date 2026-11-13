import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { FileText, Plus, AlertTriangle, ShieldCheck, Download, Calendar } from 'lucide-react';
import dayjs from 'dayjs';

export default function VesselDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    vesselId: '',
    documentType: 'Certificate of Registry (Surat Laut)',
    documentNumber: 'DOC-BKI-2026-REG-01',
    issueDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    issuingAuthority: 'Biro Klasifikasi Indonesia (BKI)',
    notes: 'Statutory certificate for international trading.',
  });

  useEffect(() => {
    fetchDocs();
    fetchVessels();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vessels/documents');
      if (res.data?.success) setDocuments(res.data.documents);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchVessels = async () => {
    try {
      const res = await api.get('/vessels?limit=100');
      if (res.data?.success) {
        setVessels(res.data.vessels);
        if (res.data.vessels.length > 0) setForm((p) => ({ ...p, vesselId: res.data.vessels[0].id }));
      }
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vessels/documents', form);
      setShowModal(false);
      fetchDocs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register document');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-ocean-600" /> Vessel Technical Documents & Class Certificates
          </h1>
          <p className="text-xs text-slate-500">
            Module 21-G: Statutory maritime certificates, SOLAS/MARPOL compliance, and automatic expiration alarms.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register Certificate</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Vessel Name</th>
                <th className="py-3 px-4">Certificate Name / Type</th>
                <th className="py-3 px-4">Doc / Cert #</th>
                <th className="py-3 px-4">Issuing Authority</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Expiration Date</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-navy-900">{d.vessel?.vesselName}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{d.documentType}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{d.documentNumber || 'N/A'}</td>
                  <td className="py-3 px-4 text-slate-700">{d.issuingAuthority}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{d.issueDate ? dayjs(d.issueDate).format('DD MMM YYYY') : '-'}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {d.expiryDate ? dayjs(d.expiryDate).format('DD MMM YYYY') : 'Permanent'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={d.status === 'Valid' ? 'success' : d.status === 'Expired' ? 'danger' : 'warning'} size="xs">
                      {d.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Document Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register Marine Document / Class Certificate" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Select Vessel *</label>
            <select
              required
              value={form.vesselId}
              onChange={(e) => setForm({ ...form, vesselId: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              {vessels.map((v) => (
                <option key={v.id} value={v.id}>{v.vesselName} ({v.vesselType})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Certificate Type *</label>
            <select
              value={form.documentType}
              onChange={(e) => setForm({ ...form, documentType: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="Certificate of Registry (Surat Laut)">Certificate of Registry (Surat Laut)</option>
              <option value="Certificate of Class (Hull & Machinery)">Certificate of Class (Hull & Machinery)</option>
              <option value="International Tonnage Certificate">International Tonnage Certificate</option>
              <option value="Safety Equipment Certificate">Safety Equipment Certificate</option>
              <option value="International Load Line Certificate">International Load Line Certificate</option>
              <option value="International Oil Pollution Prevention (IOPP)">IOPP Certificate</option>
              <option value="Protection & Indemnity (P&I) Insurance">P&I Insurance Cover</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Certificate Number</label>
              <input
                type="text"
                required
                value={form.documentNumber}
                onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                className="w-full p-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Issuing Authority</label>
              <input
                type="text"
                required
                value={form.issuingAuthority}
                onChange={(e) => setForm({ ...form, issuingAuthority: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Issue Date</label>
              <input
                type="date"
                required
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                className="w-full p-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Expiry Date</label>
              <input
                type="date"
                required
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full p-2 border rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg"
            >
              Register Certificate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

