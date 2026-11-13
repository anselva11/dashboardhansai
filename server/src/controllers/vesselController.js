import prisma from '../config/prisma.js';
import dayjs from 'dayjs';
import { logAudit } from '../middleware/audit.js';

// =================== VESSEL DATABASE & SPECS ===================

export const getVessels = async (req, res) => {
  try {
    const { search, type, operationalStatus, ownershipStatus, flagState, page = 1, limit = 20 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { vesselName: { contains: search } },
        { vesselCode: { contains: search } },
        { imoNumber: { contains: search } },
        { registrationNumber: { contains: search } },
        { currentLocation: { contains: search } },
      ];
    }

    if (type && type !== 'All') where.vesselType = type;
    if (operationalStatus && operationalStatus !== 'All') where.operationalStatus = operationalStatus;
    if (ownershipStatus && ownershipStatus !== 'All') where.ownershipStatus = ownershipStatus;
    if (flagState && flagState !== 'All') where.flagState = flagState;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [vessels, totalCount] = await Promise.all([
      prisma.vessel.findMany({
        where,
        skip,
        take,
        orderBy: { vesselCode: 'asc' },
        include: {
          specification: true,
          documents: { where: { status: { in: ['Expiring Soon', 'Expired'] } } },
          maintenances: { take: 1, orderBy: { startDate: 'desc' } },
        },
      }),
      prisma.vessel.count({ where }),
    ]);

    // Aggregate fleet metrics
    const totalFleet = await prisma.vessel.count();
    const ownedFleet = await prisma.vessel.count({ where: { ownershipStatus: 'Owned' } });
    const operationalCount = await prisma.vessel.count({ where: { operationalStatus: 'Operational' } });
    const forSaleCount = await prisma.vessel.count({ where: { operationalStatus: 'For Sale' } });
    const underMaintenanceCount = await prisma.vessel.count({ where: { operationalStatus: 'Under Maintenance' } });
    const soldCount = await prisma.vessel.count({ where: { operationalStatus: 'Sold' } });

    const totalFleetValue = await prisma.vessel.aggregate({
      _sum: { currentEstimatedValue: true, purchasePrice: true },
      where: { operationalStatus: { not: 'Sold' } },
    });

    return res.json({
      success: true,
      vessels,
      metrics: {
        totalFleet,
        ownedFleet,
        operationalCount,
        forSaleCount,
        underMaintenanceCount,
        soldCount,
        totalFleetValue: totalFleetValue._sum.currentEstimatedValue || 0,
        totalAcquisitionCost: totalFleetValue._sum.purchasePrice || 0,
      },
      pagination: {
        page: parseInt(page),
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vessels', error: err.message });
  }
};

export const getVesselById = async (req, res) => {
  try {
    const { id } = req.params;
    const vessel = await prisma.vessel.findUnique({
      where: { id },
      include: {
        specification: true,
        purchases: { orderBy: { purchaseDate: 'desc' } },
        sales: { orderBy: { salesDate: 'desc' } },
        maintenances: { orderBy: { startDate: 'desc' } },
        operationalExpenses: { take: 20, orderBy: { date: 'desc' } },
        documents: { orderBy: { expiryDate: 'asc' } },
        surveys: { orderBy: { surveyDate: 'desc' } },
        schedules: { take: 10, orderBy: { etd: 'desc' } },
      },
    });

    if (!vessel) {
      return res.status(404).json({ success: false, message: 'Vessel not found' });
    }

    return res.json({ success: true, vessel });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving vessel', error: err.message });
  }
};

export const createVessel = async (req, res) => {
  try {
    const {
      vesselCode,
      vesselName,
      vesselType,
      imoNumber,
      registrationNumber,
      flagState = 'Indonesia',
      yearBuilt,
      shipyard,
      countryOfBuild,
      classificationSociety,
      previousName,
      ownershipStatus = 'Owned',
      currentLocation,
      condition = 'Good',
      operationalStatus = 'Operational',
      purchasePrice = 0,
      currentEstimatedValue = 0,
      specs = {},
      typeSpecificSpecs = {},
    } = req.body;

    const existing = await prisma.vessel.findUnique({ where: { vesselCode } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Vessel code ${vesselCode} already exists.` });
    }

    const newVessel = await prisma.$transaction(async (tx) => {
      const v = await tx.vessel.create({
        data: {
          vesselCode,
          vesselName,
          vesselType,
          imoNumber,
          registrationNumber,
          flagState,
          yearBuilt: Number(yearBuilt),
          shipyard,
          countryOfBuild,
          classificationSociety,
          previousName,
          ownershipStatus,
          currentLocation,
          condition,
          operationalStatus,
          purchasePrice: Number(purchasePrice),
          currentEstimatedValue: Number(currentEstimatedValue || purchasePrice),
        },
      });

      await tx.vesselSpecification.create({
        data: {
          vesselId: v.id,
          loa: specs.loa ? Number(specs.loa) : null,
          lbp: specs.lbp ? Number(specs.lbp) : null,
          breadth: specs.breadth ? Number(specs.breadth) : null,
          depth: specs.depth ? Number(specs.depth) : null,
          draft: specs.draft ? Number(specs.draft) : null,
          gt: specs.gt ? Number(specs.gt) : null,
          nt: specs.nt ? Number(specs.nt) : null,
          dwt: specs.dwt ? Number(specs.dwt) : null,
          lightshipWeight: specs.lightshipWeight ? Number(specs.lightshipWeight) : null,
          mainEngineMaker: specs.mainEngineMaker,
          mainEngineModel: specs.mainEngineModel,
          mainEnginePowerHp: specs.mainEnginePowerHp ? Number(specs.mainEnginePowerHp) : null,
          mainEngineCount: specs.mainEngineCount ? Number(specs.mainEngineCount) : 1,
          auxEngine: specs.auxEngine,
          fuelType: specs.fuelType || 'MGO',
          fuelConsumption: specs.fuelConsumption ? Number(specs.fuelConsumption) : null,
          serviceSpeed: specs.serviceSpeed ? Number(specs.serviceSpeed) : null,
          maxSpeed: specs.maxSpeed ? Number(specs.maxSpeed) : null,
          crewCapacity: specs.crewCapacity ? Number(specs.crewCapacity) : null,
          classificationStatus: specs.classificationStatus || 'In Class',
          specificSpecsJson: JSON.stringify(typeSpecificSpecs),
        },
      });

      return v;
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE',
      module: 'Vessel Management',
      recordId: newVessel.id,
      details: `Added new vessel ${vesselName} (${vesselType}) to fleet database.`,
      req,
    });

    return res.status(201).json({ success: true, message: 'Vessel added successfully', vessel: newVessel });
  } catch (err) {
    console.error('Create vessel error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create vessel record', error: err.message });
  }
};

export const updateVessel = async (req, res) => {
  try {
    const { id } = req.params;
    const { specs, typeSpecificSpecs, ...vesselData } = req.body;

    if (vesselData.yearBuilt) vesselData.yearBuilt = Number(vesselData.yearBuilt);
    if (vesselData.purchasePrice !== undefined) vesselData.purchasePrice = Number(vesselData.purchasePrice);
    if (vesselData.currentEstimatedValue !== undefined) vesselData.currentEstimatedValue = Number(vesselData.currentEstimatedValue);

    const updated = await prisma.$transaction(async (tx) => {
      const v = await tx.vessel.update({
        where: { id },
        data: vesselData,
      });

      if (specs || typeSpecificSpecs) {
        const specUpdate = {};
        if (specs) {
          if (specs.loa !== undefined) specUpdate.loa = Number(specs.loa);
          if (specs.breadth !== undefined) specUpdate.breadth = Number(specs.breadth);
          if (specs.depth !== undefined) specUpdate.depth = Number(specs.depth);
          if (specs.draft !== undefined) specUpdate.draft = Number(specs.draft);
          if (specs.gt !== undefined) specUpdate.gt = Number(specs.gt);
          if (specs.dwt !== undefined) specUpdate.dwt = Number(specs.dwt);
          if (specs.mainEngineMaker !== undefined) specUpdate.mainEngineMaker = specs.mainEngineMaker;
          if (specs.mainEnginePowerHp !== undefined) specUpdate.mainEnginePowerHp = Number(specs.mainEnginePowerHp);
          if (specs.serviceSpeed !== undefined) specUpdate.serviceSpeed = Number(specs.serviceSpeed);
          if (specs.crewCapacity !== undefined) specUpdate.crewCapacity = Number(specs.crewCapacity);
          if (specs.classificationStatus !== undefined) specUpdate.classificationStatus = specs.classificationStatus;
        }
        if (typeSpecificSpecs) {
          specUpdate.specificSpecsJson = JSON.stringify(typeSpecificSpecs);
        }

        await tx.vesselSpecification.upsert({
          where: { vesselId: id },
          update: specUpdate,
          create: { vesselId: id, ...specUpdate },
        });
      }

      return v;
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'UPDATE',
      module: 'Vessel Management',
      recordId: id,
      details: `Updated vessel specifications for ${updated.vesselName}`,
      req,
    });

    return res.json({ success: true, message: 'Vessel updated successfully', vessel: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update vessel', error: err.message });
  }
};

export const deleteVessel = async (req, res) => {
  try {
    const { id } = req.params;
    const vessel = await prisma.vessel.findUnique({ where: { id } });
    if (!vessel) {
      return res.status(404).json({ success: false, message: 'Vessel not found' });
    }

    if (vessel.operationalStatus === 'Operational' || vessel.operationalStatus === 'Under Charter') {
      return res.status(400).json({ success: false, message: 'Cannot delete an active operational or chartered vessel.' });
    }

    await prisma.vessel.delete({ where: { id } });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'DELETE',
      module: 'Vessel Management',
      recordId: id,
      details: `Removed vessel ${vessel.vesselName} (${vessel.vesselCode})`,
      req,
    });

    return res.json({ success: true, message: `Vessel ${vessel.vesselName} removed from database.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete vessel', error: err.message });
  }
};

// =================== VESSEL PURCHASES (Module 21-C) ===================

export const getVesselPurchases = async (req, res) => {
  try {
    const { search, paymentStatus, page = 1, limit = 15 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { purchaseNumber: { contains: search } },
        { vesselName: { contains: search } },
        { seller: { contains: search } },
      ];
    }
    if (paymentStatus && paymentStatus !== 'All') where.paymentStatus = paymentStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [purchases, totalCount] = await Promise.all([
      prisma.vesselPurchase.findMany({
        where,
        skip,
        take,
        orderBy: { purchaseDate: 'desc' },
        include: { vessel: { select: { id: true, vesselCode: true, vesselType: true, flagState: true } } },
      }),
      prisma.vesselPurchase.count({ where }),
    ]);

    const metrics = await prisma.vesselPurchase.aggregate({
      _sum: { totalAcquisitionCost: true, paidAmount: true, remainingPayment: true },
    });

    return res.json({
      success: true,
      purchases,
      metrics: {
        totalSpent: metrics._sum.totalAcquisitionCost || 0,
        totalPaid: metrics._sum.paidAmount || 0,
        totalRemaining: metrics._sum.remainingPayment || 0,
      },
      pagination: {
        page: parseInt(page),
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vessel purchases', error: err.message });
  }
};

export const createVesselPurchase = async (req, res) => {
  try {
    const {
      vesselId,
      seller,
      broker,
      purchaseDate,
      agreementNumber,
      purchasePrice,
      currency = 'USD',
      exchangeRate = 16250,
      surveyCost = 0,
      inspectionCost = 0,
      legalFees = 0,
      documentationCost = 0,
      registrationFees = 0,
      deliveryCost = 0,
      repairCost = 0,
      otherCosts = 0,
      paymentTerms = '30% Deposit, 70% Handover',
      depositAmount = 0,
      paidAmount = 0,
      deliveryDate,
      handoverStatus = 'Completed',
      notes,
    } = req.body;

    const vessel = await prisma.vessel.findUnique({ where: { id: vesselId } });
    if (!vessel) {
      return res.status(404).json({ success: false, message: 'Target vessel not found' });
    }

    const pPrice = Number(purchasePrice);
    const surv = Number(surveyCost);
    const insp = Number(inspectionCost);
    const leg = Number(legalFees);
    const doc = Number(documentationCost);
    const regFee = Number(registrationFees);
    const deliv = Number(deliveryCost);
    const rep = Number(repairCost);
    const oth = Number(otherCosts);

    // Formula: Total Acquisition Cost = Purchase Price + Survey + Inspection + Legal + Doc + Reg + Delivery + Repair + Other
    const totalAcquisitionCost = pPrice + surv + insp + leg + doc + regFee + deliv + rep + oth;
    const dep = Number(depositAmount);
    const paid = Number(paidAmount || totalAcquisitionCost);
    const remainingPayment = Math.max(0, totalAcquisitionCost - paid);
    const paymentStatus = remainingPayment <= 0 ? 'Completed' : (paid > 0 ? 'Partial' : 'Pending');

    const count = await prisma.vesselPurchase.count();
    const purchaseNumber = `VPS-2026-${String(count + 1).padStart(3, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
      const vPurchase = await tx.vesselPurchase.create({
        data: {
          purchaseNumber,
          vesselId: vessel.id,
          vesselName: vessel.vesselName,
          vesselType: vessel.vesselType,
          seller,
          broker,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          agreementNumber,
          purchasePrice: pPrice,
          currency,
          exchangeRate: Number(exchangeRate),
          surveyCost: surv,
          inspectionCost: insp,
          legalFees: leg,
          documentationCost: doc,
          registrationFees: regFee,
          deliveryCost: deliv,
          repairCost: rep,
          otherCosts: oth,
          totalAcquisitionCost,
          paymentTerms,
          depositAmount: dep,
          paidAmount: paid,
          remainingPayment,
          paymentStatus,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
          handoverStatus,
          notes,
        },
      });

      // Update Vessel Status to Owned and set purchase price
      await tx.vessel.update({
        where: { id: vesselId },
        data: {
          ownershipStatus: 'Owned',
          operationalStatus: handoverStatus === 'Completed' ? 'Operational' : 'Under Acquisition',
          purchasePrice: totalAcquisitionCost,
          currentEstimatedValue: totalAcquisitionCost,
        },
      });

      // Post to financial transactions
      await tx.financialTransaction.create({
        data: {
          transactionNumber: `TRX-VPS-${purchaseNumber}`,
          date: purchaseDate ? new Date(purchaseDate) : new Date(),
          division: 'Vessel Trading',
          type: 'Expense',
          category: 'Vessel Purchase',
          amount: totalAcquisitionCost,
          currency,
          exchangeRate: Number(exchangeRate),
          amountIdr: totalAcquisitionCost * Number(exchangeRate),
          referenceType: 'VesselPurchase',
          referenceId: vPurchase.id,
          description: `Acquisition of vessel ${vessel.vesselName} (${vessel.vesselType}) from ${seller}`,
          paymentMethod: 'Bank Transfer (Escrow)',
          status: 'Completed',
          createdBy: req.user?.name || 'Vessel Manager',
        },
      });

      return vPurchase;
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE',
      module: 'Vessel Purchase',
      recordId: result.id,
      details: `Purchased vessel ${vessel.vesselName} for total acquisition cost $${totalAcquisitionCost}`,
      req,
    });

    return res.status(201).json({ success: true, message: 'Vessel purchase recorded and added to fleet', purchase: result });
  } catch (err) {
    console.error('Create vessel purchase error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record vessel purchase', error: err.message });
  }
};

// =================== VESSEL SALES (Module 21-D) ===================

export const getVesselSales = async (req, res) => {
  try {
    const { search, paymentStatus, page = 1, limit = 15 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { saleNumber: { contains: search } },
        { vesselName: { contains: search } },
        { buyer: { contains: search } },
      ];
    }
    if (paymentStatus && paymentStatus !== 'All') where.paymentStatus = paymentStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [sales, totalCount] = await Promise.all([
      prisma.vesselSale.findMany({
        where,
        skip,
        take,
        orderBy: { salesDate: 'desc' },
        include: { vessel: { select: { id: true, vesselCode: true, vesselType: true } } },
      }),
      prisma.vesselSale.count({ where }),
    ]);

    const metrics = await prisma.vesselSale.aggregate({
      _sum: { totalSalesRevenue: true, realizedTradingProfit: true, paymentReceived: true },
    });

    return res.json({
      success: true,
      sales,
      metrics: {
        totalRevenue: metrics._sum.totalSalesRevenue || 0,
        realizedTradingProfit: metrics._sum.realizedTradingProfit || 0,
        totalReceived: metrics._sum.paymentReceived || 0,
      },
      pagination: {
        page: parseInt(page),
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vessel sales', error: err.message });
  }
};

export const createVesselSale = async (req, res) => {
  try {
    const {
      vesselId,
      buyer,
      broker,
      salesDate,
      agreementNumber,
      sellingPrice,
      currency = 'USD',
      exchangeRate = 16250,
      surveyCost = 0,
      commission = 0,
      legalFees = 0,
      documentationFees = 0,
      deliveryCost = 0,
      otherCosts = 0,
      accumulatedDepreciation = 0,
      paymentReceived,
      handoverDate,
      transferStatus = 'Ownership Transferred',
      notes,
    } = req.body;

    const vessel = await prisma.vessel.findUnique({ where: { id: vesselId } });
    if (!vessel) {
      return res.status(404).json({ success: false, message: 'Target vessel not found' });
    }

    if (vessel.operationalStatus === 'Sold') {
      return res.status(400).json({ success: false, message: `Vessel ${vessel.vesselName} is already SOLD and cannot be resold.` });
    }

    const sPrice = Number(sellingPrice);
    const surv = Number(surveyCost);
    const comm = Number(commission);
    const leg = Number(legalFees);
    const doc = Number(documentationFees);
    const deliv = Number(deliveryCost);
    const oth = Number(otherCosts);
    const totalSalesExpenses = surv + comm + leg + doc + deliv + oth;

    const acqCost = vessel.purchasePrice > 0 ? vessel.purchasePrice : vessel.currentEstimatedValue;
    const depr = Number(accumulatedDepreciation || acqCost * 0.15);
    const netBookValue = Math.max(0, acqCost - depr);

    // Formulas:
    // Net Trading Profit = Selling Price - Original Acquisition Cost - Total Sales Expenses
    // Accounting Gain/Loss = Selling Price - Total Sales Expenses - Net Book Value
    const realizedTradingProfit = sPrice - acqCost - totalSalesExpenses;
    const accountingGainLoss = sPrice - totalSalesExpenses - netBookValue;

    const received = Number(paymentReceived !== undefined ? paymentReceived : sPrice);
    const outstanding = Math.max(0, sPrice - received);
    const paymentStatus = outstanding <= 0 ? 'Paid' : (received > 0 ? 'Partial' : 'Unpaid');

    const count = await prisma.vesselSale.count();
    const saleNumber = `VSL-2026-${String(count + 1).padStart(3, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
      const vSale = await tx.vesselSale.create({
        data: {
          saleNumber,
          vesselId: vessel.id,
          vesselName: vessel.vesselName,
          vesselType: vessel.vesselType,
          buyer,
          broker,
          salesDate: salesDate ? new Date(salesDate) : new Date(),
          agreementNumber,
          sellingPrice: sPrice,
          currency,
          exchangeRate: Number(exchangeRate),
          surveyCost: surv,
          commission: comm,
          legalFees: leg,
          documentationFees: doc,
          deliveryCost: deliv,
          otherCosts: oth,
          totalSalesRevenue: sPrice,
          totalSalesExpenses,
          originalAcquisitionCost: acqCost,
          accumulatedDepreciation: depr,
          netBookValue,
          realizedTradingProfit,
          accountingGainLoss,
          paymentReceived: received,
          outstandingBalance: outstanding,
          paymentStatus,
          handoverDate: handoverDate ? new Date(handoverDate) : new Date(),
          transferStatus,
          notes,
        },
      });

      // Mark vessel as SOLD and update ownership
      await tx.vessel.update({
        where: { id: vesselId },
        data: {
          ownershipStatus: 'Sold',
          operationalStatus: 'Sold',
          currentEstimatedValue: 0,
        },
      });

      // Post financial income
      await tx.financialTransaction.create({
        data: {
          transactionNumber: `TRX-VSL-${saleNumber}`,
          date: salesDate ? new Date(salesDate) : new Date(),
          division: 'Vessel Trading',
          type: 'Income',
          category: 'Vessel Sales',
          amount: sPrice,
          currency,
          exchangeRate: Number(exchangeRate),
          amountIdr: sPrice * Number(exchangeRate),
          referenceType: 'VesselSale',
          referenceId: vSale.id,
          description: `Sale of vessel ${vessel.vesselName} (${vessel.vesselType}) to ${buyer}`,
          paymentMethod: 'Bank Transfer (Escrow)',
          status: 'Completed',
          createdBy: req.user?.name || 'Vessel Manager',
        },
      });

      return vSale;
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE',
      module: 'Vessel Sale',
      recordId: result.id,
      details: `Sold vessel ${vessel.vesselName} for $${sPrice} (Realized Trading Profit: $${realizedTradingProfit})`,
      req,
    });

    return res.status(201).json({ success: true, message: 'Vessel sale recorded and vessel marked as SOLD', sale: result });
  } catch (err) {
    console.error('Create vessel sale error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record vessel sale', error: err.message });
  }
};

// =================== VESSEL TRADING DASHBOARD & KPI (Module 21-I) ===================

export const getVesselTradingDashboard = async (req, res) => {
  try {
    const totalFleet = await prisma.vessel.count();
    const totalPurchases = await prisma.vesselPurchase.count();
    const totalSales = await prisma.vesselSale.count();

    const purchaseAggr = await prisma.vesselPurchase.aggregate({
      _sum: { totalAcquisitionCost: true, purchasePrice: true },
      _avg: { purchasePrice: true },
    });

    const saleAggr = await prisma.vesselSale.aggregate({
      _sum: { totalSalesRevenue: true, realizedTradingProfit: true, totalSalesExpenses: true },
      _avg: { sellingPrice: true },
    });

    const fleetValueAggr = await prisma.vessel.aggregate({
      _sum: { currentEstimatedValue: true, purchasePrice: true },
      where: { operationalStatus: { not: 'Sold' } },
    });

    // Vessel distribution by type
    const typeGroups = await prisma.vessel.groupBy({
      by: ['vesselType'],
      _count: { id: true },
    });
    const vesselDistribution = typeGroups.map((tg) => ({ name: tg.vesselType, value: tg._count.id }));

    // Operational status distribution
    const statusGroups = await prisma.vessel.groupBy({
      by: ['operationalStatus'],
      _count: { id: true },
    });
    const operationalStatusDistribution = statusGroups.map((sg) => ({ name: sg.operationalStatus, value: sg._count.id }));

    // Recent purchases & sales
    const recentPurchases = await prisma.vesselPurchase.findMany({
      take: 5,
      orderBy: { purchaseDate: 'desc' },
    });

    const recentSales = await prisma.vesselSale.findMany({
      take: 5,
      orderBy: { salesDate: 'desc' },
    });

    // Vessels available for sale
    const vesselsForSale = await prisma.vessel.findMany({
      where: { operationalStatus: 'For Sale' },
      include: { specification: true },
    });

    // Vessels under maintenance
    const vesselsUnderMaintenance = await prisma.vessel.findMany({
      where: { operationalStatus: 'Under Maintenance' },
      include: { maintenances: { take: 1, orderBy: { startDate: 'desc' } } },
    });

    // Expiring documents
    const expiringDocuments = await prisma.vesselDocument.findMany({
      where: { status: { in: ['Expiring Soon', 'Expired'] } },
      include: { vessel: { select: { vesselName: true, vesselCode: true } } },
      orderBy: { expiryDate: 'asc' },
    });

    return res.json({
      success: true,
      kpis: {
        totalFleet,
        totalPurchases,
        totalSales,
        totalAcquisitionValue: purchaseAggr._sum.totalAcquisitionCost || 0,
        totalSalesRevenue: saleAggr._sum.totalSalesRevenue || 0,
        realizedTradingProfit: saleAggr._sum.realizedTradingProfit || 0,
        avgPurchasePrice: Math.round(purchaseAggr._avg.purchasePrice || 0),
        avgSellingPrice: Math.round(saleAggr._avg.sellingPrice || 0),
        currentFleetAssetValue: fleetValueAggr._sum.currentEstimatedValue || 0,
      },
      charts: {
        vesselDistribution,
        operationalStatusDistribution,
      },
      tables: {
        recentPurchases,
        recentSales,
        vesselsForSale,
        vesselsUnderMaintenance,
        expiringDocuments,
      },
    });
  } catch (err) {
    console.error('Vessel trading dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load vessel dashboard', error: err.message });
  }
};

// =================== VESSEL MAINTENANCE & EXPENSES (Module 21-F) ===================

export const getVesselMaintenance = async (req, res) => {
  try {
    const { vesselId, page = 1, limit = 20 } = req.query;
    const where = vesselId ? { vesselId } : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [maintenances, totalCount] = await Promise.all([
      prisma.vesselMaintenance.findMany({
        where,
        skip,
        take,
        orderBy: { startDate: 'desc' },
        include: { vessel: { select: { vesselName: true, vesselCode: true, vesselType: true } } },
      }),
      prisma.vesselMaintenance.count({ where }),
    ]);

    const totalCost = await prisma.vesselMaintenance.aggregate({
      _sum: { cost: true },
    });

    return res.json({
      success: true,
      maintenances,
      totalCost: totalCost._sum.cost || 0,
      pagination: { page: parseInt(page), limit: take, totalCount, totalPages: Math.ceil(totalCount / take) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vessel maintenance', error: err.message });
  }
};

export const createVesselMaintenance = async (req, res) => {
  try {
    const { vesselId, maintenanceType, title, description, serviceProvider, startDate, completionDate, cost = 0, currency = 'USD', status = 'Scheduled', nextScheduledDate, invoiceRef } = req.body;

    const maintenance = await prisma.vesselMaintenance.create({
      data: {
        vesselId,
        maintenanceType,
        title,
        description,
        serviceProvider,
        startDate: new Date(startDate),
        completionDate: completionDate ? new Date(completionDate) : null,
        cost: Number(cost),
        currency,
        status,
        nextScheduledDate: nextScheduledDate ? new Date(nextScheduledDate) : null,
        invoiceRef,
      },
    });

    return res.status(201).json({ success: true, message: 'Maintenance recorded', maintenance });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create maintenance record', error: err.message });
  }
};

export const getVesselExpenses = async (req, res) => {
  try {
    const { vesselId, category, page = 1, limit = 25 } = req.query;
    const where = {};
    if (vesselId) where.vesselId = vesselId;
    if (category && category !== 'All') where.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [expenses, totalCount] = await Promise.all([
      prisma.vesselOperationalExpense.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: { vessel: { select: { vesselName: true, vesselCode: true } } },
      }),
      prisma.vesselOperationalExpense.count({ where }),
    ]);

    const totalAmount = await prisma.vesselOperationalExpense.aggregate({ _sum: { amount: true }, where });

    return res.json({
      success: true,
      expenses,
      totalAmount: totalAmount._sum.amount || 0,
      pagination: { page: parseInt(page), limit: take, totalCount, totalPages: Math.ceil(totalCount / take) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vessel expenses', error: err.message });
  }
};

export const createVesselExpense = async (req, res) => {
  try {
    const { vesselId, category, description, date, amount, currency = 'USD', vendor, receiptNumber, status = 'Paid' } = req.body;

    const expense = await prisma.vesselOperationalExpense.create({
      data: {
        vesselId,
        category,
        description,
        date: date ? new Date(date) : new Date(),
        amount: Number(amount),
        currency,
        vendor,
        receiptNumber,
        status,
      },
    });

    return res.status(201).json({ success: true, message: 'Expense recorded', expense });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record expense', error: err.message });
  }
};

// =================== VESSEL DOCUMENTS (Module 21-G) ===================

export const getVesselDocuments = async (req, res) => {
  try {
    const { vesselId, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (vesselId) where.vesselId = vesselId;
    if (status && status !== 'All') where.status = status;

    const [documents, totalCount] = await Promise.all([
      prisma.vesselDocument.findMany({
        where,
        orderBy: { expiryDate: 'asc' },
        include: { vessel: { select: { vesselName: true, vesselCode: true, vesselType: true } } },
      }),
      prisma.vesselDocument.count({ where }),
    ]);

    return res.json({ success: true, documents, totalCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch documents', error: err.message });
  }
};

export const createVesselDocument = async (req, res) => {
  try {
    const { vesselId, documentType, documentNumber, issueDate, expiryDate, issuingAuthority, fileUrl, notes } = req.body;

    const now = dayjs();
    let status = 'Valid';
    if (expiryDate) {
      const exp = dayjs(expiryDate);
      if (exp.isBefore(now)) status = 'Expired';
      else if (exp.diff(now, 'day') <= 30) status = 'Expiring Soon';
    }

    const doc = await prisma.vesselDocument.create({
      data: {
        vesselId,
        documentType,
        documentNumber,
        issueDate: issueDate ? new Date(issueDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        issuingAuthority,
        fileUrl: fileUrl || `/uploads/documents/${documentType.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        status,
        notes,
      },
    });

    return res.status(201).json({ success: true, message: 'Document certificate registered', document: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to register document', error: err.message });
  }
};

// =================== VESSEL SURVEYS ===================

export const getVesselSurveys = async (req, res) => {
  try {
    const { vesselId } = req.query;
    const where = vesselId ? { vesselId } : {};

    const surveys = await prisma.vesselSurvey.findMany({
      where,
      orderBy: { surveyDate: 'desc' },
      include: { vessel: { select: { vesselName: true, vesselCode: true } } },
    });

    return res.json({ success: true, surveys });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch surveys', error: err.message });
  }
};

export const createVesselSurvey = async (req, res) => {
  try {
    const { vesselId, surveyType, surveyorName, surveyorCompany, surveyDate, nextSurveyDueDate, resultStatus = 'Passed', findings, recommendations, fileUrl } = req.body;

    const survey = await prisma.vesselSurvey.create({
      data: {
        vesselId,
        surveyType,
        surveyorName,
        surveyorCompany,
        surveyDate: surveyDate ? new Date(surveyDate) : new Date(),
        nextSurveyDueDate: nextSurveyDueDate ? new Date(nextSurveyDueDate) : null,
        resultStatus,
        findings,
        recommendations,
        fileUrl,
      },
    });

    return res.status(201).json({ success: true, message: 'Survey report recorded', survey });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record survey', error: err.message });
  }
};

// =================== VESSEL SCHEDULES (Section 9) ===================

export const getVesselSchedules = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status && status !== 'All' ? { status } : {};

    const schedules = await prisma.vesselSchedule.findMany({
      where,
      orderBy: { etd: 'asc' },
      include: { vessel: { select: { id: true, vesselName: true, vesselCode: true, vesselType: true } } },
    });

    return res.json({ success: true, schedules });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch schedules', error: err.message });
  }
};

export const createVesselSchedule = async (req, res) => {
  try {
    const { vesselId, voyageNumber, originPort, destinationPort, etd, eta, notes } = req.body;
    const vessel = await prisma.vessel.findUnique({ where: { id: vesselId } });
    if (!vessel) return res.status(404).json({ success: false, message: 'Vessel not found' });

    const count = await prisma.vesselSchedule.count();
    const scheduleNumber = `VSC-2026-${String(count + 1).padStart(3, '0')}`;

    const schedule = await prisma.vesselSchedule.create({
      data: {
        scheduleNumber,
        vesselId,
        vesselName: vessel.vesselName,
        voyageNumber,
        originPort,
        destinationPort,
        etd: new Date(etd),
        eta: new Date(eta),
        status: 'Scheduled',
        notes,
      },
    });

    return res.status(201).json({ success: true, message: 'Vessel schedule created', schedule });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create schedule', error: err.message });
  }
};

