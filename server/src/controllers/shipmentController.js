import prisma from '../config/prisma.js';
import { logAudit } from '../middleware/audit.js';

const TRACKING_STAGES = [
  'Warehouse Preparation',
  'Stuffing',
  'Documentation',
  'Customs Clearance Origin',
  'Gate In',
  'Vessel Departure',
  'In Transit',
  'Vessel Arrival',
  'Customs Clearance Destination',
  'Container Release',
  'Final Delivery',
  'Proof of Delivery',
];

export const getShipments = async (req, res) => {
  try {
    const { search, status, type, pol, pod, page = 1, limit = 15 } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { shipmentNumber: { contains: search } },
        { bookingNumber: { contains: search } },
        { blNumber: { contains: search } },
        { commodity: { contains: search } },
        { vesselName: { contains: search } },
        { containerNumber: { contains: search } },
        { customer: { companyName: { contains: search } } },
      ];
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    if (type && type !== 'All') {
      if (type === 'FCL') {
        where.containerType = { not: 'LCL Cargo' };
      } else if (type === 'LCL') {
        where.containerType = 'LCL Cargo';
      }
    }

    if (pol && pol !== 'All') where.pol = { contains: pol };
    if (pod && pod !== 'All') where.pod = { contains: pod };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [shipments, totalCount] = await Promise.all([
      prisma.shipment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, companyName: true, email: true, phone: true } },
          supplier: { select: { id: true, companyName: true } },
          trackingStages: { orderBy: { stageOrder: 'asc' } },
        },
      }),
      prisma.shipment.count({ where }),
    ]);

    return res.json({
      success: true,
      shipments,
      pagination: {
        page: parseInt(page),
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch shipments', error: err.message });
  }
};

export const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        customer: true,
        supplier: true,
        trackingStages: { orderBy: { stageOrder: 'asc' } },
        thcTransactions: true,
        documents: true,
      },
    });

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    return res.json({ success: true, shipment });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving shipment', error: err.message });
  }
};

export const createShipment = async (req, res) => {
  try {
    const {
      customerId,
      supplierId,
      commodity,
      hsCode,
      quantity = 1,
      grossWeight,
      netWeight,
      volumeCbm,
      containerNumber,
      containerType,
      incoterms = 'FOB',
      pol,
      pod,
      finalDestination,
      shippingLine = 'HANSAI SHIPPING LINE',
      vesselName,
      voyageNumber,
      bookingNumber,
      blNumber,
      etd,
      eta,
      freightCost = 0,
      thcOrigin = 0,
      thcDestination = 0,
      insurance = 0,
      customsCharges = 0,
      otherExpenses = 0,
      sellingRate = 0,
      notes,
    } = req.body;

    const count = await prisma.shipment.count();
    const shipmentNumber = `SHP-2026-${String(count + 1).padStart(4, '0')}`;
    const totalCost = Number(freightCost) + Number(thcOrigin) + Number(thcDestination) + Number(insurance) + Number(customsCharges) + Number(otherExpenses);

    const newShipment = await prisma.shipment.create({
      data: {
        shipmentNumber,
        customerId,
        supplierId: supplierId || null,
        commodity,
        hsCode,
        quantity: Number(quantity),
        grossWeight: Number(grossWeight || 0),
        netWeight: Number(netWeight || 0),
        volumeCbm: Number(volumeCbm || 0),
        containerNumber,
        containerType,
        incoterms,
        pol,
        pod,
        finalDestination: finalDestination || pod,
        shippingLine,
        vesselName,
        voyageNumber,
        bookingNumber: bookingNumber || `BKG-HNS-${202600 + count + 1}`,
        blNumber: blNumber || `HNSU-BL-${2026000 + count + 1}`,
        etd: new Date(etd),
        eta: new Date(eta),
        freightCost: Number(freightCost),
        thcOrigin: Number(thcOrigin),
        thcDestination: Number(thcDestination),
        insurance: Number(insurance),
        customsCharges: Number(customsCharges),
        otherExpenses: Number(otherExpenses),
        totalCost,
        sellingRate: Number(sellingRate || totalCost * 1.25),
        status: 'Booking Confirmed',
        notes,
      },
    });

    // Create default 12 stages
    for (let i = 0; i < TRACKING_STAGES.length; i++) {
      await prisma.shipmentTracking.create({
        data: {
          shipmentId: newShipment.id,
          stageOrder: i + 1,
          stageName: TRACKING_STAGES[i],
          status: i === 0 ? 'In Progress' : 'Pending',
          location: i <= 4 ? pol : (i >= 8 ? pod : 'In Transit'),
          timestamp: i === 0 ? new Date() : null,
          updatedBy: req.user?.name || 'Operations Staff',
        },
      });
    }

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE',
      module: 'Shipment',
      recordId: newShipment.id,
      details: `Created new shipment ${shipmentNumber} for commodity ${commodity}`,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      shipment: newShipment,
    });
  } catch (err) {
    console.error('Shipment creation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create shipment', error: err.message });
  }
};

export const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.etd) updateData.etd = new Date(updateData.etd);
    if (updateData.eta) updateData.eta = new Date(updateData.eta);
    if (updateData.actualDeparture) updateData.actualDeparture = new Date(updateData.actualDeparture);
    if (updateData.actualArrival) updateData.actualArrival = new Date(updateData.actualArrival);

    // Recalculate total cost if cost fields provided
    if (updateData.freightCost !== undefined || updateData.thcOrigin !== undefined) {
      const current = await prisma.shipment.findUnique({ where: { id } });
      const f = updateData.freightCost !== undefined ? Number(updateData.freightCost) : current.freightCost;
      const to = updateData.thcOrigin !== undefined ? Number(updateData.thcOrigin) : current.thcOrigin;
      const td = updateData.thcDestination !== undefined ? Number(updateData.thcDestination) : current.thcDestination;
      const ins = updateData.insurance !== undefined ? Number(updateData.insurance) : current.insurance;
      const c = updateData.customsCharges !== undefined ? Number(updateData.customsCharges) : current.customsCharges;
      const o = updateData.otherExpenses !== undefined ? Number(updateData.otherExpenses) : current.otherExpenses;
      updateData.totalCost = f + to + td + ins + c + o;
    }

    const updated = await prisma.shipment.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'UPDATE',
      module: 'Shipment',
      recordId: id,
      details: `Updated shipment ${updated.shipmentNumber}`,
      req,
    });

    return res.json({ success: true, message: 'Shipment updated successfully', shipment: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update shipment', error: err.message });
  }
};

export const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await prisma.shipment.findUnique({ where: { id } });

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    await prisma.shipment.delete({ where: { id } });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'DELETE',
      module: 'Shipment',
      recordId: id,
      details: `Deleted shipment ${shipment.shipmentNumber} with commodity ${shipment.commodity}`,
      req,
    });

    return res.json({ success: true, message: `Shipment ${shipment.shipmentNumber} deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete shipment', error: err.message });
  }
};

export const updateTrackingStage = async (req, res) => {
  try {
    const { shipmentId, stageOrder } = req.params;
    const { status, location, notes, timestamp } = req.body;

    const stage = await prisma.shipmentTracking.findFirst({
      where: { shipmentId, stageOrder: parseInt(stageOrder) },
    });

    if (!stage) {
      return res.status(404).json({ success: false, message: 'Tracking stage not found' });
    }

    const updatedStage = await prisma.shipmentTracking.update({
      where: { id: stage.id },
      data: {
        status: status || stage.status,
        location: location !== undefined ? location : stage.location,
        notes: notes !== undefined ? notes : stage.notes,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        updatedBy: req.user?.name || 'Operations Staff',
      },
    });

    // Check if stage is stage 12 and completed, mark shipment Delivered
    if (parseInt(stageOrder) === 12 && status === 'Completed') {
      await prisma.shipment.update({
        where: { id: shipmentId },
        data: { status: 'Delivered', actualArrival: new Date() },
      });
    }

    return res.json({ success: true, message: 'Tracking stage updated', stage: updatedStage });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update tracking stage', error: err.message });
  }
};

