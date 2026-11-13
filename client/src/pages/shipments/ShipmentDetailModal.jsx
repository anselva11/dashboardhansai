import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import api from '../../api/client';
import dayjs from 'dayjs';
import {
  Ship,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  Printer,
  FileText,
} from 'lucide-react';

export default function ShipmentDetailModal({ isOpen, onClose, shipment, onUpdate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [updatingStage, setUpdatingStage] = useState(null);

  if (!shipment) return null;

  const handleAdvanceStage = async (stageOrder) => {
    try {
      setUpdatingStage(stageOrder);
      const res = await api.put(`/shipments/${shipment.id}/tracking/${stageOrder}`, {
        status: 'Completed',
        timestamp: new Date(),
        location: shipment.pod,
        notes: 'Stage updated and verified by operations officer.',
      });
      if (res.data?.success && onUpdate) {
        onUpdate();
      }
    } catch (err) {
      alert('Failed to update stage');
    } finally {
      setUpdatingStage(null);
    }
  };

  const printBillOfLading = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Shipment ${shipment.shipmentNumber}`} maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-navy-900 to-ocean-800 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black font-mono tracking-tight">{shipment.shipmentNumber}</span>
              <span className="px-2 py-0.5 rounded bg-ocean-500/40 text-ocean-200 text-xs font-bold uppercase">
                {shipment.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              B/L: <span className="font-mono text-white">{shipment.blNumber || 'Pending'}</span> &bull; Booking: {shipment.bookingNumber}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={printBillOfLading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print B/L Document</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'overview' ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Cargo
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'tracking' ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            12-Stage Tracking Timeline
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'financials' ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Freight & Landed Cost Breakdown
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Ship className="w-4 h-4 text-ocean-600" /> Vessel & Voyage Schedule
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Vessel Name</span>
                  <span className="font-semibold text-slate-900">{shipment.vesselName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Voyage</span>
                  <span className="font-semibold text-slate-900">{shipment.voyageNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Port of Loading (POL)</span>
                  <span className="font-semibold text-slate-900">{shipment.pol}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Port of Discharge (POD)</span>
                  <span className="font-semibold text-slate-900">{shipment.pod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">ETD Departure</span>
                  <span className="font-semibold text-slate-900 font-mono">{dayjs(shipment.etd).format('DD MMM YYYY')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">ETA Arrival</span>
                  <span className="font-semibold text-slate-900 font-mono">{dayjs(shipment.eta).format('DD MMM YYYY')}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-ocean-600" /> Commodity & Container Specs
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Commodity</span>
                  <span className="font-semibold text-slate-900">{shipment.commodity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">HS Code</span>
                  <span className="font-semibold text-slate-900 font-mono">{shipment.hsCode || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Container Number</span>
                  <span className="font-semibold text-navy-900 font-mono">{shipment.containerNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Container Type</span>
                  <span className="font-semibold text-slate-900">{shipment.containerType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Gross Weight</span>
                  <span className="font-semibold text-slate-900 font-mono">{shipment.grossWeight?.toLocaleString()} KG</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Volume (CBM)</span>
                  <span className="font-semibold text-slate-900 font-mono">{shipment.volumeCbm} CBM</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] mb-2">
                Commercial Parties & Incoterms
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Customer / Consignee</span>
                  <span className="font-bold text-slate-900">{shipment.customer?.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Supplier / Shipper</span>
                  <span className="font-bold text-slate-900">{shipment.supplier?.companyName || 'Factory Direct'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Incoterms</span>
                  <Badge variant="ocean">{shipment.incoterms}</Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 12-Stage Tracking Timeline */}
        {activeTab === 'tracking' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Complete international shipping pipeline from origin preparation to proof of delivery.
            </p>

            <div className="relative pl-6 border-l-2 border-ocean-200 space-y-4 ml-2">
              {(shipment.trackingStages || []).map((stage) => {
                const isCompleted = stage.status === 'Completed';
                const isInProgress = stage.status === 'In Progress';

                return (
                  <div key={stage.id} className="relative group">
                    {/* Circle icon */}
                    <div
                      className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : isInProgress
                          ? 'bg-ocean-500 text-white border-ocean-600 ring-4 ring-ocean-100'
                          : 'bg-white text-slate-400 border-slate-300'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : stage.stageOrder}
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-800 text-xs">
                            Stage {stage.stageOrder}: {stage.stageName}
                          </h5>
                          <Badge variant={isCompleted ? 'success' : (isInProgress ? 'ocean' : 'default')} size="xs">
                            {stage.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Location: <span className="font-medium text-slate-700">{stage.location || 'Depot'}</span>
                          {stage.timestamp && ` • ${dayjs(stage.timestamp).format('DD MMM YYYY, HH:mm')}`}
                        </p>
                      </div>

                      {!isCompleted && (
                        <button
                          onClick={() => handleAdvanceStage(stage.stageOrder)}
                          disabled={updatingStage === stage.stageOrder}
                          className="px-2.5 py-1 bg-ocean-600 hover:bg-ocean-700 text-white rounded text-[11px] font-bold shadow-sm transition-all disabled:opacity-50"
                        >
                          {updatingStage === stage.stageOrder ? 'Updating...' : 'Mark Completed'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Financials */}
        {activeTab === 'financials' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">Cost vs. Revenue Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Total Operational Cost</span>
                  <span className="text-base font-black text-rose-700 font-mono mt-1 block">
                    ${Number(shipment.totalCost).toLocaleString()}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Selling Freight Rate</span>
                  <span className="text-base font-black text-emerald-700 font-mono mt-1 block">
                    ${Number(shipment.sellingRate).toLocaleString()}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Estimated Net Profit</span>
                  <span className="text-base font-black text-navy-900 font-mono mt-1 block">
                    ${(Number(shipment.sellingRate) - Number(shipment.totalCost)).toLocaleString()}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Profit Margin</span>
                  <span className="text-base font-black text-ocean-700 font-mono mt-1 block">
                    {shipment.sellingRate > 0
                      ? (((shipment.sellingRate - shipment.totalCost) / shipment.sellingRate) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Cost Component</th>
                    <th className="py-2.5 px-4 text-right">Amount (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-4 text-slate-600">Base Ocean Freight Cost</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">${shipment.freightCost?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-600">Terminal Handling Charge (THC Origin)</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">${shipment.thcOrigin?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-600">Terminal Handling Charge (THC Destination)</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">${shipment.thcDestination?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-600">Marine Cargo Insurance</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">${shipment.insurance?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-600">Customs Clearance & Documentation Charges</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">${shipment.customsCharges?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-600">Other Local Port Disbursements</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">${shipment.otherExpenses?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

