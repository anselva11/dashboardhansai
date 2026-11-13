import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Anchor,
  FileCheck2,
} from 'lucide-react';
import dayjs from 'dayjs';

export default function VesselSurveysPage() {
  const [surveys, setSurveys] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    vesselId: '',
    surveyType: 'Annual Class Survey',
    surveyorName: 'Capt. R. Suhartono, C.Eng',
    surveyorCompany: 'Biro Klasifikasi Indonesia (BKI)',
    surveyDate: new Date().toISOString().slice(0, 10),
    nextSurveyDueDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    resultStatus: 'Passed',
    findings: 'Hull plating thickness measurements within permissible limits. Main engine emergency shutdown tests verified.',
    recommendations: 'Continue periodic oil analysis. Schedule intermediate propeller shaft survey before Q4 2027.',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, vRes] = await Promise.all([
        api.get('/vessels/surveys'),
        api.get('/vessels?limit=100'),
      ]);
      setSurveys(sRes.data.surveys || []);
      setVessels(vRes.data.vessels || []);
    } catch (err) {
      console.error('Failed to load surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/vessels/surveys', form);
      setShowModal(false);
      setForm({
        vesselId: '',
        surveyType: 'Annual Class Survey',
        surveyorName: 'Capt. R. Suhartono, C.Eng',
        surveyorCompany: 'Biro Klasifikasi Indonesia (BKI)',
        surveyDate: new Date().toISOString().slice(0, 10),
        nextSurveyDueDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
        resultStatus: 'Passed',
        findings: '',
        recommendations: '',
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record survey');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = surveys.filter((s) => {
    const matchSearch =
      s.vessel?.vesselName?.toLowerCase().includes(search.toLowerCase()) ||
      s.surveyType?.toLowerCase().includes(search.toLowerCase()) ||
      s.surveyorCompany?.toLowerCase().includes(search.toLowerCase()) ||
      s.surveyorName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = resultFilter === 'All' || s.resultStatus === resultFilter;
    return matchSearch && matchStatus;
  });

  const passedCount = surveys.filter((s) => s.resultStatus === 'Passed').length;
  const conditionCount = surveys.filter((s) => s.resultStatus === 'Passed with Conditions').length;
  const rectificationCount = surveys.filter((s) => s.resultStatus === 'Rectification Required').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-ocean-600" />
            Vessel Surveys & Classification Compliance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            BKI, ABS, BV, and Lloyd's Register survey inspections, hull assessments, and statutory compliance
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Survey Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Surveys</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{surveys.length}</div>
          <div className="text-xs text-slate-500 mt-1">Conducted on active fleet</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Passed Surveys</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{passedCount}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Fully Class Compliant</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">With Conditions</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{conditionCount}</div>
          <div className="text-xs text-amber-600 mt-1 font-medium">Follow-up due in 90 days</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Action Required</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{rectificationCount}</div>
          <div className="text-xs text-rose-600 mt-1 font-medium">Drydock rectification mandatory</div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vessel, surveyor, classification society..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 bg-white"
            >
              <option value="All">All Results</option>
              <option value="Passed">Passed</option>
              <option value="Passed with Conditions">Passed with Conditions</option>
              <option value="Rectification Required">Rectification Required</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Vessel</th>
                <th className="py-3 px-4">Survey Type</th>
                <th className="py-3 px-4">Classification / Surveyor</th>
                <th className="py-3 px-4">Survey Date</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4 text-center">Result</th>
                <th className="py-3 px-4">Findings & Recommendations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Loading survey records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No survey records found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Anchor className="w-3.5 h-3.5 text-ocean-600" />
                        {item.vessel?.vesselName || 'HANSAI Fleet Vessel'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.vessel?.vesselCode}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{item.surveyType}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{item.surveyorCompany}</div>
                      <div className="text-[11px] text-slate-500">{item.surveyorName}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {dayjs(item.surveyDate).format('DD MMM YYYY')}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {item.nextSurveyDueDate ? dayjs(item.nextSurveyDueDate).format('DD MMM YYYY') : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          item.resultStatus === 'Passed'
                            ? 'success'
                            : item.resultStatus === 'Passed with Conditions'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {item.resultStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm">
                      <div className="truncate text-slate-800 font-medium" title={item.findings}>
                        {item.findings || 'No adverse findings recorded.'}
                      </div>
                      {item.recommendations && (
                        <div className="text-[11px] text-slate-500 truncate" title={item.recommendations}>
                          Rec: {item.recommendations}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Survey Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Register Vessel Classification Survey Report"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Fleet Vessel</label>
              <select
                value={form.vesselId}
                onChange={(e) => setForm({ ...form, vesselId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 bg-white"
                required
              >
                <option value="">-- Choose Vessel --</option>
                {vessels.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vesselName} ({v.vesselType}) - {v.vesselCode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Survey Type</label>
              <select
                value={form.surveyType}
                onChange={(e) => setForm({ ...form, surveyType: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 bg-white"
              >
                <option value="Annual Class Survey">Annual Class Survey</option>
                <option value="Intermediate Survey">Intermediate Survey</option>
                <option value="Special Survey (Drydock)">Special Survey (Drydock)</option>
                <option value="Continuous Machinery Survey (CMS)">Continuous Machinery Survey (CMS)</option>
                <option value="UWILD (Underwater Inspection in Lieu of Drydocking)">
                  UWILD (Underwater Inspection)
                </option>
                <option value="Safety Equipment Survey">Safety Equipment Survey</option>
                <option value="Load Line Survey">Load Line Survey</option>
                <option value="Pre-Purchase Condition Survey">Pre-Purchase Condition Survey</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Surveyor Name</label>
              <input
                type="text"
                value={form.surveyorName}
                onChange={(e) => setForm({ ...form, surveyorName: e.target.value })}
                placeholder="e.g. Capt. R. Suhartono, C.Eng"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Classification Society / Firm</label>
              <select
                value={form.surveyorCompany}
                onChange={(e) => setForm({ ...form, surveyorCompany: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 bg-white"
              >
                <option value="Biro Klasifikasi Indonesia (BKI)">Biro Klasifikasi Indonesia (BKI)</option>
                <option value="American Bureau of Shipping (ABS)">American Bureau of Shipping (ABS)</option>
                <option value="Bureau Veritas (BV)">Bureau Veritas (BV)</option>
                <option value="Lloyd's Register (LR)">Lloyd's Register (LR)</option>
                <option value="Nippon Kaiji Kyokai (ClassNK)">Nippon Kaiji Kyokai (ClassNK)</option>
                <option value="Independent Marine Surveyor">Independent Marine Surveyor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Survey Date</label>
              <input
                type="date"
                value={form.surveyDate}
                onChange={(e) => setForm({ ...form, surveyDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Next Survey Due Date</label>
              <input
                type="date"
                value={form.nextSurveyDueDate}
                onChange={(e) => setForm({ ...form, nextSurveyDueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Survey Result</label>
              <select
                value={form.resultStatus}
                onChange={(e) => setForm({ ...form, resultStatus: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 bg-white"
              >
                <option value="Passed">Passed (Certificate Endorsed)</option>
                <option value="Passed with Conditions">Passed with Conditions (Follow-up Required)</option>
                <option value="Rectification Required">Rectification Required (Class Suspension Pending)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Key Findings & Measurements</label>
              <textarea
                rows="2"
                value={form.findings}
                onChange={(e) => setForm({ ...form, findings: e.target.value })}
                placeholder="Ultrasonic thickness measurements, hull condition, machinery testing remarks..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Surveyor Recommendations</label>
              <textarea
                rows="2"
                value={form.recommendations}
                onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                placeholder="Recommendations, required repairs before next endorsement..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-ocean-600 hover:bg-ocean-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Survey Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

