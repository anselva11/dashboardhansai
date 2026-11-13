import prisma from '../config/prisma.js';
import { logAudit } from '../middleware/audit.js';

// =================== CONTAINER PURCHASES ===================

export const getPurchases = async (req, res) => {
  try {
    const { search, paymentStatus, page = 1, limit = 15 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { purchaseNumber: { contains: search } },
        { containerNumber: { contains: search } },
        { supplier: { companyName: { contains: search } } },
      ];
    }
    if (paymentStatus && paymentStatus !== 'All') where.paymentStatus = paymentStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [purchases, totalCount] = await Promise.all([
      prisma.containerPurchase.findMany({
        where,
        skip,
        take,
        orderBy: { purchaseDate: 'desc' },
        include: { supplier: { select: { id: true, companyName: true, country: true } } },
      }),
      prisma.containerPurchase.count({ where }),
    ]);

    const totalSpent = await prisma.containerPurchase.aggregate({
      _sum: { totalAcquisitionCost: true },
    });

    return res.json({
      success: true,
      purchases,
      totalSpent: totalSpent._sum.totalAcquisitionCost || 0,
      pagination: {
        page: parseInt(page),
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch purchases', error: err.message });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const {
      supplierId,
      containerNumber,
      containerType,
      condition = 'Cargo Worthy (CW)',
      purchaseDate,
      purchasePrice,
      transportationCost = 0,
      inspectionCost = 0,
      repairCost = 0,
      otherCosts = 0,
      paymentStatus = 'Paid',
      currentLocation = 'Jakarta Tanjung Priok Depot',
      notes,
    } = req.body;

    const pPrice = Number(purchasePrice);
    const trans = Number(transportationCost);
    const insp = Number(inspectionCost);
    const rep = Number(repairCost);
    const oth = Number(otherCosts);
    const totalAcquisitionCost = pPrice + trans + insp + rep + oth;

    const count = await prisma.containerPurchase.count();
    const purchaseNumber = `CPO-2026-${String(count + 1).padStart(3, '0')}`;

    // Atomically create purchase and add/update container in inventory
    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.containerPurchase.create({
        data: {
          purchaseNumber,
          supplierId,
          containerNumber,
          containerType,
          condition,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          purchasePrice: pPrice,
          transportationCost: trans,
          inspectionCost: insp,
          repairCost: rep,
          otherCosts: oth,
          totalAcquisitionCost,
          paymentStatus,
          notes,
        },
      });

      // Upsert into container inventory
      await tx.container.upsert({
        where: { containerNumber },
        update: {
          containerType,
          condition,
          purchasePrice: pPrice,
          currentValue: totalAcquisitionCost,
          currentLocation,
          status: 'Available',
        },
        create: {
          containerNumber,
          containerType,
          owner: 'HANSAI SHIPPING LINE',
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          purchasePrice: pPrice,
          currentValue: totalAcquisitionCost,
          condition,
          currentLocation,
          status: 'Available',
          notes: `Acquired via purchase order ${purchaseNumber}`,
        },
      });

      // Record financial transaction for equipment acquisition
      await tx.financialTransaction.create({
        data: {
          transactionNumber: `TRX-CPO-${purchaseNumber}`,
          date: purchaseDate ? new Date(purchaseDate) : new Date(),
          division: 'Container Trading',
          type: 'Expense',
          category: 'Container Purchase',
          amount: totalAcquisitionCost,
          currency: 'USD',
          exchangeRate: 16250,
          amountIdr: totalAcquisitionCost * 16250,
          referenceType: 'ContainerPurchase',
          referenceId: purchase.id,
          description: `Acquisition of container ${containerNumber} (${containerType})`,
          paymentMethod: 'Bank Transfer',
          status: 'Completed',
          createdBy: req.user?.name || 'Container Manager',
        },
      });

      return purchase;
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE',
      module: 'Container Purchase',
      recordId: result.id,
      details: `Procured container ${containerNumber} for total acquisition cost $${totalAcquisitionCost}`,
      req,
    });

    return res.status(201).json({ success: true, message: 'Container purchase recorded and added to inventory', purchase: result });
  } catch (err) {
    console.error('Create container purchase error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record purchase', error: err.message });
  }
};

// =================== CONTAINER SALES ===================

export const getSales = async (req, res) => {
  try {
    const { search, paymentStatus, page = 1, limit = 15 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { saleNumber: { contains: search } },
        { containerNumber: { contains: search } },
        { buyer: { companyName: { contains: search } } },
      ];
    }
    if (paymentStatus && paymentStatus !== 'All') where.paymentStatus = paymentStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [sales, totalCount] = await Promise.all([
      prisma.containerSale.findMany({
        where,
        skip,
        take,
        orderBy: { salesDate: 'desc' },
        include: {
          buyer: { select: { id: true, companyName: true, country: true } },
          container: { select: { id: true, containerNumber: true, condition: true } },
        },
      }),
      prisma.containerSale.count({ where }),
    ]);

    const totalRevenueAggr = await prisma.containerSale.aggregate({
      _sum: { totalSalesRevenue: true, grossProfit: true },
    });

    return res.json({
      success: true,
      sales,
      metrics: {
        totalRevenue: totalRevenueAggr._sum.totalSalesRevenue || 0,
        totalProfit: totalRevenueAggr._sum.grossProfit || 0,
      },
      pagination: {
        page: parseInt(page),
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch sales', error: err.message });
  }
};

export const createSale = async (req, res) => {
  try {
    const {
      buyerId,
      containerId,
      salesDate,
      sellingPrice,
      deliveryCost = 0,
      otherCosts = 0,
      paymentStatus = 'Paid',
      notes,
    } = req.body;

    const container = await prisma.container.findUnique({ where: { id: containerId } });
    if (!container) {
      return res.status(404).json({ success: false, message: 'Container not found' });
    }

    // STRICT VALIDATION: Prevent selling containers already sold or rented
    if (container.status === 'Sold') {
      return res.status(400).json({ success: false, message: `Container ${container.containerNumber} is ALREADY SOLD and cannot be resold.` });
    }
    if (container.status === 'Rented') {
      return res.status(400).json({ success: false, message: `Container ${container.containerNumber} is currently RENTED. Return the container before selling.` });
    }

    const sPrice = Number(sellingPrice);
    const dCost = Number(deliveryCost);
    const oCost = Number(otherCosts);
    const acqCost = container.purchasePrice > 0 ? container.purchasePrice : container.currentValue;
    const grossProfit = sPrice - acqCost - dCost - oCost;

    const count = await prisma.containerSale.count();
    const saleNumber = `CSL-2026-${String(count + 1).padStart(3, '0')}`;

    // Atomically create sale record, mark container Sold, and add financial transaction
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.containerSale.create({
        data: {
          saleNumber,
          buyerId,
          containerId,
          containerNumber: container.containerNumber,
          containerType: container.containerType,
          salesDate: salesDate ? new Date(salesDate) : new Date(),
          sellingPrice: sPrice,
          deliveryCost: dCost,
          otherCosts: oCost,
          totalSalesRevenue: sPrice,
          acquisitionCost: acqCost,
          grossProfit,
          paymentStatus,
          notes,
        },
      });

      // Mark container as Sold and zero out current value
      await tx.container.update({
        where: { id: containerId },
        data: {
          status: 'Sold',
          currentValue: 0,
          notes: `Sold under transaction ${saleNumber} to buyer on ${dayjs(salesDate).format('YYYY-MM-DD')}`,
        },
      });

      // Record financial income
      await tx.financialTransaction.create({
        data: {
          transactionNumber: `TRX-CSL-${saleNumber}`,
          date: salesDate ? new Date(salesDate) : new Date(),
          division: 'Container Trading',
          type: 'Income',
          category: 'Container Sales',
          amount: sPrice,
          currency: 'USD',
          exchangeRate: 16250,
          amountIdr: sPrice * 16250,
          referenceType: 'ContainerSale',
          referenceId: sale.id,
          description: `Sale of container ${container.containerNumber} (${container.containerType})`,
          paymentMethod: 'Bank Transfer',
          status: 'Completed',
          createdBy: req.user?.name || 'Container Manager',
        },
      });

      return sale;
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE',
      module: 'Container Sale',
      recordId: result.id,
      details: `Sold container ${container.containerNumber} for $${sPrice} (Net Trading Profit: $${grossProfit})`,
      req,
    });

    return res.status(201).json({ success: true, message: 'Container sale completed successfully', sale: result });
  } catch (err) {
    console.error('Create container sale error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record container sale', error: err.message });
  }
};

