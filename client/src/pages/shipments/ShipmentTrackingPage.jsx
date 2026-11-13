import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import { Navigation, Search, CheckCircle2, Clock, MapPin, Ship, ArrowRight, ShieldCheck } from 'lucide-react';
import dayjs from 'dayjs';

export default function ShipmentTrackingPage() {
  const [query, setQuery] = useState('SHP-2026-0001');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/shipments?search=${encodeURIComponent(query.trim())}&limit=1`);
      if (res.data?.shipments?.length > 0) {
        // Fetch full shipment with all 12 stages
        const full = await api.get(`/shipments/${res.data.shipments[0].id}`);
        setShipment(full.data.shipment);
      } else {
        setError(`No shipment found matching "${query}". Try searching "SHP-2026-0001" or a B/L number.`);
        setShipment(null);
      }
    } catch (err) {
      setError('Failed to fetch tracking data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
          <Navigation className="w-6 h-6 text-ocean-600" /> Real-time Cargo & Shipment Tracking
        </h1>
        <p className="text-xs text-slate-500">
          Track cargo milestone progression across all 12 statutory international checkpoints.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Shipment Number (e.g. SHP-2026-0001) or B/L Number..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-navy-900 hover:bg-ocean-600 text-white text-xs font-bold rounded-lg shadow transition-colors disabled:opacity-50"
          >
            {loading ? 'Locating...' : 'Track Cargo'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
          {error}
        </div>
      )}

      {/* Shipment Details & Timeline */}
      {shipment && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black font-mono text-navy-900">{shipment.shipmentNumber}</span>
                  <Badge variant={shipment.status === 'Delivered' ? 'success' : 'ocean'}>
                    {shipment.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  B/L: <span className="font-mono font-bold text-slate-700">{shipment.blNumber}</span> &bull; Consignee:{' '}
                  <span className="font-semibold text-slate-800">{shipment.customer?.companyName}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">ETD Departure</span>
                  <span className="font-bold text-navy-900">{dayjs(shipment.etd).format('DD MMM YYYY')}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">ETA Arrival</span>
                  <span className="font-bold text-navy-900">{dayjs(shipment.eta).format('DD MMM YYYY')}</span>
                </div>
              </div>
            </div>

            {/* Route summary */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-ocean-50 border border-ocean-200 text-ocean-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Origin Port</span>
                  <p className="font-bold text-slate-800">{shipment.pol}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-200 text-navy-800 flex items-center justify-center shrink-0">
                  <Ship className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Vessel & Voyage</span>
                  <p className="font-bold text-slate-800">{shipment.vesselName}</p>
                  <span className="text-[10px] text-slate-400 font-mono">Voyage {shipment.voyageNumber}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Destination Port</span>
                  <p className="font-bold text-slate-800">{shipment.pod}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 12-Stage Visual Progress Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-ocean-600" /> 12 International Checkpoint Stages
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(shipment.trackingStages || []).map((st) => {
                const isDone = st.status === 'Completed';
                const isCurr = st.status === 'In Progress';

                return (
                  <div
                    key={st.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isDone
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isCurr
                        ? 'bg-ocean-50/60 border-ocean-300 ring-2 ring-ocean-200'
                        : 'bg-slate-50/60 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white border border-slate-200 font-mono">
                        {st.stageOrder}
                      </span>
                      <Badge variant={isDone ? 'success' : isCurr ? 'ocean' : 'default'} size="xs">
                        {st.status}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs">{st.stageName}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {st.location || 'Terminal Checkpoint'}
                    </p>
                    {st.timestamp && (
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                        {dayjs(st.timestamp).format('DD MMM YYYY, HH:mm')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

