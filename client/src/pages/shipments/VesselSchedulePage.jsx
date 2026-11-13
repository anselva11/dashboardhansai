import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Calendar, Table, Plus, Anchor, Clock, MapPin, Ship } from 'lucide-react';
import dayjs from 'dayjs';

export default function VesselSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // table or calendar
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    vesselId: '',
    voyageNumber: 'VOY-2026-15E',
    originPort: 'Jakarta (Tanjung Priok)',
    destinationPort: 'Port of Singapore',
    etd: new Date().toISOString().slice(0, 10),
    eta: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
    notes: '',
  });

  useEffect(() => {
    fetchSchedules();
    fetchVessels();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vessels/schedules');
      if (res.data?.success) setSchedules(res.data.schedules);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVessels = async () => {
    try {
      const res = await api.get('/vessels?limit=100');
      if (res.data?.success) {
        setVessels(res.data.vessels);
        if (res.data.vessels.length > 0) {
          setFormData((prev) => ({ ...prev, vesselId: res.data.vessels[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vessels/schedules', formData);
      setShowModal(false);
      fetchSchedules();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create schedule');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-ocean-600" /> Vessel & Shipping Schedules
          </h1>
          <p className="text-xs text-slate-500">
            Live voyage rotations, port calls, ETD/ETA timetables, and transit delays.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center text-xs font-bold">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-white shadow text-navy-900' : 'text-slate-500 hover:text-navy-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" /> Table View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'calendar' ? 'bg-white shadow text-navy-900' : 'text-slate-500 hover:text-navy-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Calendar Format
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Voyage</span>
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Schedule #</th>
                  <th className="py-3 px-4">Vessel & Type</th>
                  <th className="py-3 px-4">Voyage #</th>
                  <th className="py-3 px-4">Origin Port (POL)</th>
                  <th className="py-3 px-4">Destination (POD)</th>
                  <th className="py-3 px-4">ETD Departure</th>
                  <th className="py-3 px-4">ETA Arrival</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-navy-900">{sch.scheduleNumber}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{sch.vesselName}</span>
                      <span className="text-[10px] text-ocean-600 font-medium">{sch.vessel?.vesselType || 'Fleet Vessel'}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">{sch.voyageNumber}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{sch.originPort}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{sch.destinationPort}</td>
                    <td className="py-3 px-4 font-mono text-slate-800 font-semibold">{dayjs(sch.etd).format('DD MMM YYYY, HH:mm')}</td>
                    <td className="py-3 px-4 font-mono text-slate-800 font-semibold">{dayjs(sch.eta).format('DD MMM YYYY, HH:mm')}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={sch.status === 'Sailing' ? 'ocean' : sch.status === 'Arrived' ? 'success' : 'warning'} size="xs">
                        {sch.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar view format */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((sch) => (
            <div key={sch.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-400">{sch.scheduleNumber}</span>
                <Badge variant={sch.status === 'Sailing' ? 'ocean' : 'success'} size="xs">
                  {sch.status}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-black text-navy-900">{sch.vesselName}</h4>
                <p className="text-[11px] text-ocean-600 font-mono font-semibold">{sch.voyageNumber}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">From:</span>
                  <span className="font-bold text-slate-800">{sch.originPort}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">To:</span>
                  <span className="font-bold text-slate-800">{sch.destinationPort}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">ETD</span>
                  <span className="font-bold text-slate-800">{dayjs(sch.etd).format('DD MMM YYYY')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">ETA</span>
                  <span className="font-bold text-slate-800">{dayjs(sch.eta).format('DD MMM YYYY')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Voyage Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Schedule New Vessel Voyage" maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Select Vessel *</label>
            <select
              required
              value={formData.vesselId}
              onChange={(e) => setFormData({ ...formData, vesselId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500"
            >
              {vessels.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vesselName} ({v.vesselType})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Voyage Number *</label>
              <input
                type="text"
                required
                value={formData.voyageNumber}
                onChange={(e) => setFormData({ ...formData, voyageNumber: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Origin Port *</label>
              <input
                type="text"
                required
                value={formData.originPort}
                onChange={(e) => setFormData({ ...formData, originPort: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Destination Port *</label>
              <input
                type="text"
                required
                value={formData.destinationPort}
                onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">ETD Date *</label>
              <input
                type="datetime-local"
                required
                value={formData.etd}
                onChange={(e) => setFormData({ ...formData, etd: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

