import prisma from '../config/prisma.js';
import { logAudit } from '../middleware/audit.js';

export const getContainers = async (req, res) => {
  try {
    const { search, status, type, location, condition, page = 1, limit = 20 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { containerNumber: { contains: search } },
        { currentLocation: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    if (status && status !== 'All') where.status = status;
    if (type && type !== 'All') where.containerType = type;
    if (location && location !== 'All') where.currentLocation = { contains: location };
    if (condition && condition !== 'All') where.condition = condition;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [containers, totalCount] = await Promise.all([
      prisma.container.findMany({
        where,
        skip,
        take,
        orderBy: { containerNumber: 'asc' },
        include: {
          rentals: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: { customer: { select: { companyName: true } } },
          },
          maintenances: {
            take: 1,
            orderBy: { serviceDate: 'desc' },
          },
        },
      }),
      prisma.container.count({ where }),
    ]);

    // Inventory metrics
    const totalUnits = await prisma.container.count();
    const availableUnits = await prisma.container.count({ where: { status: 'Available' } });
    const rentedUnits = await prisma.container.count({ where: { status: 'Rented' } });
    const maintenanceUnits = await prisma.container.count({ where: { status: 'Under Maintenance' } });
    const soldUnits = await prisma.container.count({ where: { status: 'Sold' } });

    const totalValuation = await prisma.container.aggregate({
      _sum: { currentValue: true },
      where: { status: { not: 'Sold' } },
    });

    return res.json({
      success: true,
      containers,
      metrics: {
        totalUnits,
        availableUnits,
        rentedUnits,
        maintenanceUnits,
        soldUnits,
        totalValuation: totalValuation._sum.currentValue || 0,
      },
      pagination: {
        page: parseInt(page),
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch containers', error: err.message });
  }
};

export const getContainerById = async (req, res) => {
  try {
    const { id } = req.params;
    const container = await prisma.container.findUnique({
      where: { id },
      include: {
        rentals: {
          include: { customer: true, rentalPayments: true },
          orderBy: { startDate: 'desc' },
        },
        sales: {
          include: { buyer: true },
        },
        maintenances: {
          orderBy: { serviceDate: 'desc' },
        },
      },
    });

    if (!container) {
      return res.status(404).json({ success: false, message: 'Container not found' });
    }

    return res.json({ success: true, container });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving container', error: err.message });
  }
};

export const createContainer = async (req, res) => {
  try {
    const {
      containerNumber,
      containerType,
      owner = 'HANSAI SHIPPING LINE',
      purchaseDate,
      purchasePrice = 0,
      currentValue = 0,
      condition = 'Cargo Worthy (CW)',
      currentLocation,
      status = 'Available',
      lastInspection,
      nextMaintenance,
      notes,
    } = req.body;

    const existing = await prisma.container.findUnique({ where: { containerNumber } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Container number ${containerNumber} already exists in database.` });
    }

    const newContainer = await prisma.container.create({
      data: {
        containerNumber,
        containerType,
        owner,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        purchasePrice: Number(purchasePrice),
        currentValue: Number(currentValue || purchasePrice),
        condition,
        currentLocation,
        status,
        lastInspection: lastInspection ? new Date(lastInspection) : null,
        nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : null,
        notes,
      },
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE',
      module: 'Container',
      recordId: newContainer.id,
      details: `Added new container ${containerNumber} (${containerType}) to inventory.`,
      req,
    });

    return res.status(201).json({ success: true, message: 'Container added successfully', container: newContainer });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create container', error: err.message });
  }
};

export const updateContainer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.purchaseDate) updateData.purchaseDate = new Date(updateData.purchaseDate);
    if (updateData.lastInspection) updateData.lastInspection = new Date(updateData.lastInspection);
    if (updateData.nextMaintenance) updateData.nextMaintenance = new Date(updateData.nextMaintenance);
    if (updateData.purchasePrice !== undefined) updateData.purchasePrice = Number(updateData.purchasePrice);
    if (updateData.currentValue !== undefined) updateData.currentValue = Number(updateData.currentValue);

    const updated = await prisma.container.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'UPDATE',
      module: 'Container',
      recordId: id,
      details: `Updated container ${updated.containerNumber}`,
      req,
    });

    return res.json({ success: true, message: 'Container updated successfully', container: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update container', error: err.message });
  }
};

export const deleteContainer = async (req, res) => {
  try {
    const { id } = req.params;
    const container = await prisma.container.findUnique({ where: { id } });

    if (!container) {
      return res.status(404).json({ success: false, message: 'Container not found' });
    }

    if (container.status === 'Rented') {
      return res.status(400).json({ success: false, message: 'Cannot delete a currently rented container. Return it first.' });
    }

    await prisma.container.delete({ where: { id } });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'DELETE',
      module: 'Container',
      recordId: id,
      details: `Deleted container ${container.containerNumber}`,
      req,
    });

    return res.json({ success: true, message: `Container ${container.containerNumber} deleted.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete container', error: err.message });
  }
};

// =================== CONTAINER MAINTENANCE ===================

export const getContainerMaintenance = async (req, res) => {
  try {
    const { containerId, page = 1, limit = 20 } = req.query;
    const where = containerId ? { containerId } : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [maintenances, totalCount] = await Promise.all([
      prisma.maintenance.findMany({
        where,
        skip,
        take,
        orderBy: { serviceDate: 'desc' },
        include: {
          container: {
            select: { containerNumber: true, containerType: true, currentLocation: true, status: true },
          },
        },
      }),
      prisma.maintenance.count({ where }),
    ]);

    const totalCost = await prisma.maintenance.aggregate({
      _sum: { cost: true },
      where,
    });

    return res.json({
      success: true,
      maintenances,
      totalCost: totalCost._sum.cost || 0,
      pagination: {
        page: parseInt(page),
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch container maintenance', error: err.message });
  }
};

export const createContainerMaintenance = async (req, res) => {
  try {
    const { containerId, serviceType, cost = 0, serviceDate, completionDate, serviceProvider, status = 'Completed', notes } = req.body;

    const maintenance = await prisma.maintenance.create({
      data: {
        containerId: containerId || null,
        serviceType,
        cost: Number(cost),
        serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
        completionDate: completionDate ? new Date(completionDate) : null,
        serviceProvider,
        status,
        notes,
      },
    });

    if (containerId && status === 'In Progress') {
      await prisma.container.update({
        where: { id: containerId },
        data: { status: 'Under Maintenance' },
      });
    } else if (containerId && status === 'Completed') {
      await prisma.container.update({
        where: { id: containerId },
        data: {
          status: 'Available',
          lastInspection: new Date(),
          nextMaintenance: new Date(Date.now() + 180 * 86400000),
        },
      });
    }

    return res.status(201).json({ success: true, message: 'Container maintenance recorded', maintenance });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record maintenance', error: err.message });
  }
};
