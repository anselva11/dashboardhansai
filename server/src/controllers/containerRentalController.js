import prisma from '../config/prisma.js';
import dayjs from 'dayjs';
import { logAudit } from '../middleware/audit.js';

export const getRentals = async (req, res) => {
  try {
    const { search, status, paymentStatus, page = 1, limit = 15 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { contractNumber: { contains: search } },
        { customer: { companyName: { contains: search } } },
        { container: { containerNumber: { contains: search } } },
      ];
    }

    if (status && status !== 'All') where.status = status;
    if (paymentStatus && paymentStatus !== 'All') where.paymentStatus = paymentStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [rentals, totalCount] = await Promise.all([
      prisma.containerRental.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, companyName: true, email: true, phone: true } },
          container: { select: { id: true, containerNumber: true, containerType: true, currentLocation: true, status: true } },
          rentalPayments: true,
        },
      }),
      prisma.containerRental.count({ where }),
    ]);

    // Aggregate summary metrics
    const activeRentalsCount = await prisma.containerRental.count({ where: { status: 'Active' } });
    const overdueRentalsCount = await prisma.containerRental.count({ where: { status: 'Overdue' } });
    const returnedRentalsCount = await prisma.containerRental.count({ where: { status: 'Returned' } });

    const totalRevenueAggr = await prisma.containerRental.aggregate({
      _sum: { totalRentalAmount: true, paidAmount: true, outstandingAmount: true },
    });

    return res.json({
      success: true,
      rentals,
      metrics: {
        activeCount: activeRentalsCount,
        overdueCount: overdueRentalsCount,
        returnedCount: returnedRentalsCount,
        totalBilled: totalRevenueAggr._sum.totalRentalAmount || 0,
        totalPaid: totalRevenueAggr._sum.paidAmount || 0,
        totalOutstanding: totalRevenueAggr._sum.outstandingAmount || 0,
      },
      pagination: {
        page: parseInt(page),
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch rentals', error: err.message });
  }
};

export const createRental = async (req, res) => {
  try {
    const {
      customerId,
      containerId,
      startDate,
      endDate,
      rateType = 'Monthly',
      rentalRate,
      depositAmount = 0,
      lateFeePerDay = 15,
      damageCharges = 0,
      notes,
    } = req.body;

    const container = await prisma.container.findUnique({ where: { id: containerId } });
    if (!container) {
      return res.status(404).json({ success: false, message: 'Container not found' });
    }
    if (container.status !== 'Available') {
      return res.status(400).json({ success: false, message: `Container ${container.containerNumber} is currently ${container.status} and cannot be rented.` });
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const days = Math.max(1, end.diff(start, 'day'));
    const months = Math.max(1, Math.ceil(days / 30));

    let baseAmount = 0;
    if (rateType === 'Daily') baseAmount = days * Number(rentalRate);
    else if (rateType === 'Weekly') baseAmount = Math.ceil(days / 7) * Number(rentalRate);
    else baseAmount = months * Number(rentalRate);

    const totalRentalAmount = baseAmount + Number(damageCharges);
    const count = await prisma.containerRental.count();
    const contractNumber = `RNT-2026-${String(count + 1).padStart(3, '0')}`;

    // Transaction to create rental and update container status to Rented
    const result = await prisma.$transaction(async (tx) => {
      const rental = await tx.containerRental.create({
        data: {
          contractNumber,
          customerId,
          containerId,
          startDate: start.toDate(),
          endDate: end.toDate(),
          rateType,
          rentalRate: Number(rentalRate),
          depositAmount: Number(depositAmount),
          lateFeePerDay: Number(lateFeePerDay),
          damageCharges: Number(damageCharges),
          totalRentalAmount,
          paidAmount: 0,
          outstandingAmount: totalRentalAmount,
          status: 'Active',
          paymentStatus: 'Pending',
          notes,
        },
      });

      await tx.container.update({
        where: { id: containerId },
        data: { status: 'Rented' },
      });

      return rental;
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE',
      module: 'Container Rental',
      recordId: result.id,
      details: `Created rental contract ${contractNumber} for container ${container.containerNumber}`,
      req,
    });

    return res.status(201).json({ success: true, message: 'Rental contract created successfully', rental: result });
  } catch (err) {
    console.error('Create rental error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create rental contract', error: err.message });
  }
};

export const returnContainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { returnDate, damageCharges = 0, notes } = req.body;

    const rental = await prisma.containerRental.findUnique({
      where: { id },
      include: { container: true },
    });

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental contract not found' });
    }

    const retDate = returnDate ? dayjs(returnDate) : dayjs();
    const end = dayjs(rental.endDate);
    const overdueDays = Math.max(0, retDate.diff(end, 'day'));
    const calculatedLateFee = overdueDays * rental.lateFeePerDay;
    const totalRentalAmount = rental.totalRentalAmount + calculatedLateFee + Number(damageCharges);
    const outstandingAmount = Math.max(0, totalRentalAmount - rental.paidAmount);

    const updatedRental = await prisma.$transaction(async (tx) => {
      const r = await tx.containerRental.update({
        where: { id },
        data: {
          returnDate: retDate.toDate(),
          calculatedLateFee,
          damageCharges: rental.damageCharges + Number(damageCharges),
          totalRentalAmount,
          outstandingAmount,
          status: 'Returned',
          paymentStatus: outstandingAmount <= 0 ? 'Paid' : 'Pending',
          notes: notes ? `${rental.notes || ''} [Return Notes: ${notes}]` : rental.notes,
        },
      });

      await tx.container.update({
        where: { id: rental.containerId },
        data: {
          status: 'Available',
          lastInspection: retDate.toDate(),
          condition: damageCharges > 0 ? 'Fair Condition' : 'Cargo Worthy (CW)',
        },
      });

      return r;
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'RETURN',
      module: 'Container Rental',
      recordId: id,
      details: `Container returned for contract ${rental.contractNumber}. Overdue days: ${overdueDays}`,
      req,
    });

    return res.json({ success: true, message: 'Container returned successfully', rental: updatedRental });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to process container return', error: err.message });
  }
};

export const addRentalPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod = 'Bank Transfer', referenceNumber, notes } = req.body;

    const rental = await prisma.containerRental.findUnique({ where: { id } });
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental contract not found' });
    }

    const payAmount = Number(amount);
    const newPaidAmount = rental.paidAmount + payAmount;
    const newOutstanding = Math.max(0, rental.totalRentalAmount - newPaidAmount);
    const newPaymentStatus = newOutstanding <= 0 ? 'Paid' : 'Partial';

    const [payment, updatedRental] = await prisma.$transaction([
      prisma.rentalPayment.create({
        data: {
          rentalId: id,
          amount: payAmount,
          paymentMethod,
          referenceNumber,
          notes,
        },
      }),
      prisma.containerRental.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          outstandingAmount: newOutstanding,
          paymentStatus: newPaymentStatus,
        },
      }),
    ]);

    return res.json({ success: true, message: 'Payment recorded successfully', payment, rental: updatedRental });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record payment', error: err.message });
  }
};

