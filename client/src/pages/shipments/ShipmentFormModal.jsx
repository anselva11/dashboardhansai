import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../api/client';

export default function ShipmentFormModal({ isOpen, onClose, shipment, onSaved, customers = [], suppliers = [] }) {
  const [formData, setFormData] = useState({
    customerId: '',
    supplierId: '',
    commodity: '',
    hsCode: '',
    quantity: 1,
    grossWeight: '',
    netWeight: '',
    volumeCbm: '',
    containerNumber: '',
    containerType: '40FT High Cube',
    incoterms: 'FOB',
    pol: 'Port of Tanjung Priok, Jakarta',
    pod: 'Port of Singapore',
    finalDestination: '',
    vesselName: 'MV HANSAI PACIFIC',
    voyageNumber: 'VOY-2026-08E',
    bookingNumber: '',
    blNumber: '',
    etd: new Date().toISOString().slice(0, 10),
    eta: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
    freightCost: 1800,
    thcOrigin: 145,
    thcDestination: 180,
    insurance: 120,
    customsCharges: 200,
    otherExpenses: 100,
    sellingRate: 3200,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (shipment) {
      setFormData({
        customerId: shipment.customerId || '',
        supplierId: shipment.supplierId || '',
        commodity: shipment.commodity || '',
        hsCode: shipment.hsCode || '',
        quantity: shipment.quantity || 1,
        grossWeight: shipment.grossWeight || '',
        netWeight: shipment.netWeight || '',
        volumeCbm: shipment.volumeCbm || '',
        containerNumber: shipment.containerNumber || '',
        containerType: shipment.containerType || '40FT High Cube',
        incoterms: shipment.incoterms || 'FOB',
        pol: shipment.pol || '',
        pod: shipment.pod || '',
        finalDestination: shipment.finalDestination || '',
        vesselName: shipment.vesselName || '',
        voyageNumber: shipment.voyageNumber || '',
        bookingNumber: shipment.bookingNumber || '',
        blNumber: shipment.blNumber || '',
        etd: shipment.etd ? new Date(shipment.etd).toISOString().slice(0, 10) : '',
        eta: shipment.eta ? new Date(shipment.eta).toISOString().slice(0, 10) : '',
        freightCost: shipment.freightCost || 0,
        thcOrigin: shipment.thcOrigin || 0,
        thcDestination: shipment.thcDestination || 0,
        insurance: shipment.insurance || 0,
        customsCharges: shipment.customsCharges || 0,
        otherExpenses: shipment.otherExpenses || 0,
        sellingRate: shipment.sellingRate || 0,
        notes: shipment.notes || '',
      });
    } else if (customers.length > 0) {
      setFormData((prev) => ({ ...prev, customerId: customers[0].id }));
    }
  }, [shipment, customers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (shipment) {
        await api.put(`/shipments/${shipment.id}`, formData);
      } else {
        await api.post('/shipments', formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save shipment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={shipment ? `Edit Shipment ${shipment.shipmentNumber}` : 'Create New International Shipment'} maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Customer / Consignee *</label>
            <select
              name="customerId"
              required
              value={formData.customerId}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500"
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.country})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Supplier / Shipper</label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.companyName} ({s.country})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Commodity Name *</label>
            <input
              type="text"
              name="commodity"
              required
              value={formData.commodity}
              onChange={handleChange}
              placeholder="e.g. Industrial Machinery"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">HS Code (Tariff)</label>
            <input
              type="text"
              name="hsCode"
              value={formData.hsCode}
              onChange={handleChange}
              placeholder="e.g. 8471.30.20"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Container Type</label>
            <select
              name="containerType"
              value={formData.containerType}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500"
            >
              <option value="20FT Standard">20FT Standard</option>
              <option value="40FT Standard">40FT Standard</option>
              <option value="40FT High Cube">40FT High Cube</option>
              <option value="20FT Refrigerated">20FT Refrigerated</option>
              <option value="40FT Refrigerated">40FT Refrigerated</option>
              <option value="Open Top">Open Top</option>
              <option value="Flat Rack">Flat Rack</option>
              <option value="LCL Cargo">LCL Consolidation</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Container Number</label>
            <input
              type="text"
              name="containerNumber"
              value={formData.containerNumber}
              onChange={handleChange}
              placeholder="e.g. HNSU-204812-4"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Gross Weight (KG)</label>
            <input
              type="number"
              name="grossWeight"
              value={formData.grossWeight}
              onChange={handleChange}
              placeholder="18000"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Volume (CBM)</label>
            <input
              type="number"
              step="0.1"
              name="volumeCbm"
              value={formData.volumeCbm}
              onChange={handleChange}
              placeholder="48.5"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Port of Loading (POL) *</label>
            <input
              type="text"
              name="pol"
              required
              value={formData.pol}
              onChange={handleChange}
              placeholder="e.g. Tanjung Priok, Jakarta"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Port of Discharge (POD) *</label>
            <input
              type="text"
              name="pod"
              required
              value={formData.pod}
              onChange={handleChange}
              placeholder="e.g. Port of Singapore"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Vessel Name</label>
            <input
              type="text"
              name="vesselName"
              value={formData.vesselName}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Voyage Number</label>
            <input
              type="text"
              name="voyageNumber"
              value={formData.voyageNumber}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">ETD Date *</label>
            <input
              type="date"
              name="etd"
              required
              value={formData.etd}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">ETA Date *</label>
            <input
              type="date"
              name="eta"
              required
              value={formData.eta}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Freight Cost (USD)</label>
            <input
              type="number"
              name="freightCost"
              value={formData.freightCost}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Selling Freight Rate (USD)</label>
            <input
              type="number"
              name="sellingRate"
              value={formData.sellingRate}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500 font-mono font-bold text-emerald-700"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Operation Notes</label>
          <textarea
            name="notes"
            rows="2"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Special cargo handling instructions..."
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-ocean-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-navy-900 hover:bg-ocean-600 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : shipment ? 'Update Shipment' : 'Create Shipment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

