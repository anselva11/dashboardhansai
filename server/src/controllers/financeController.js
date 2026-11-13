import prisma from '../config/prisma.js';
import dayjs from 'dayjs';
import { logAudit } from '../middleware/audit.js';

// =================== TRANSACTIONS ===================

export const getTransactions = async (req, res) => {
  try {
    const { search, division, type, category, startDate, endDate, page = 1, limit = 20 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { transactionNumber: { contains: search } },
        { description: { contains: search } },
        { referenceId: { contains: search } },
      ];
    }
    if (division && division !== 'All') where.division = division;
    if (type && type !== 'All') where.type = type;
    if (category && category !== 'All') where.category = category;

    if (startDate && endDate) {
      where.date = {
        gte: dayjs(startDate).startOf('day').toDate(),
        lte: dayjs(endDate).endOf('day').toDate(),
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [transactions, totalCount] = await Promise.all([
      prisma.financialTransaction.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
      }),
      prisma.financialTransaction.count({ where }),
    ]);

    // Financial totals
    const incomeAggr = await prisma.financialTransaction.aggregate({
      _sum: { amount: true },
      where: { ...where, type: 'Income' },
    });
    const expenseAggr = await prisma.financialTransaction.aggregate({
      _sum: { amount: true },
      where: { ...where, type: 'Expense' },
    });

    const totalIncome = incomeAggr._sum.amount || 0;
    const totalExpense = expenseAggr._sum.amount || 0;
    const netCashflow = totalIncome - totalExpense;

    return res.json({
      success: true,
      transactions,
      totals: {
        totalIncome: Math.round(totalIncome),
        totalExpense: Math.round(totalExpense),
        netCashflow: Math.round(netCashflow),
      },
      pagination: {
        page: parseInt(page),
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: err.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const {
      division,
      type,
      category,
      amount,
      currency = 'USD',
      exchangeRate = 16250,
      date,
      description,
      paymentMethod = 'Bank Transfer',
      referenceType,
      referenceId,
    } = req.body;

    const amt = Number(amount);
    const rate = Number(exchangeRate);
    const count = await prisma.financialTransaction.count();
    const transactionNumber = `TRX-2026-${String(count + 1).padStart(4, '0')}`;

    const tx = await prisma.financialTransaction.create({
      data: {
        transactionNumber,
        date: date ? new Date(date) : new Date(),
        division,
        type,
        category,
        amount: amt,
        currency,
        exchangeRate: rate,
        amountIdr: amt * rate,
        referenceType,
        referenceId,
        description,
        paymentMethod,
        status: 'Completed',
        createdBy: req.user?.name || 'Finance Staff',
      },
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE',
      module: 'Finance',
      recordId: tx.id,
      details: `Created ${type} transaction ${transactionNumber} of $${amt} in ${division} (${category})`,
      req,
    });

    return res.status(201).json({ success: true, message: 'Transaction recorded successfully', transaction: tx });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record transaction', error: err.message });
  }
};

// =================== PROFIT & LOSS REPORT ===================

export const getProfitLossReport = async (req, res) => {
  try {
    const { division, year = 2026 } = req.query;

    const where = {};
    if (division && division !== 'All') {
      where.division = division;
    }

    const transactions = await prisma.financialTransaction.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    const revenueCategories = {};
    const expenseCategories = {};
    let totalRevenue = 0;
    let totalExpense = 0;

    const monthlyBreakdown = {};

    transactions.forEach((tx) => {
      const month = dayjs(tx.date).format('MMM');
      if (!monthlyBreakdown[month]) {
        monthlyBreakdown[month] = { month, revenue: 0, expense: 0, netProfit: 0 };
      }

      if (tx.type === 'Income') {
        revenueCategories[tx.category] = (revenueCategories[tx.category] || 0) + tx.amount;
        totalRevenue += tx.amount;
        monthlyBreakdown[month].revenue += tx.amount;
      } else if (tx.type === 'Expense') {
        expenseCategories[tx.category] = (expenseCategories[tx.category] || 0) + tx.amount;
        totalExpense += tx.amount;
        monthlyBreakdown[month].expense += tx.amount;
      }
    });

    Object.values(monthlyBreakdown).forEach((m) => {
      m.netProfit = m.revenue - m.expense;
    });

    // Division comparison
    const divisionAggr = {};
    transactions.forEach((tx) => {
      if (!divisionAggr[tx.division]) {
        divisionAggr[tx.division] = { division: tx.division, revenue: 0, expense: 0, netProfit: 0 };
      }
      if (tx.type === 'Income') divisionAggr[tx.division].revenue += tx.amount;
      else if (tx.type === 'Expense') divisionAggr[tx.division].expense += tx.amount;
    });
    Object.values(divisionAggr).forEach((d) => {
      d.netProfit = d.revenue - d.expense;
    });

    return res.json({
      success: true,
      year: parseInt(year),
      division: division || 'All Divisions',
      summary: {
        totalRevenue: Math.round(totalRevenue),
        totalExpense: Math.round(totalExpense),
        grossProfit: Math.round(totalRevenue - totalExpense),
        netProfit: Math.round(totalRevenue - totalExpense),
        profitMargin: totalRevenue > 0 ? (((totalRevenue - totalExpense) / totalRevenue) * 100).toFixed(2) : 0,
      },
      revenueBreakdown: Object.entries(revenueCategories).map(([category, amount]) => ({ category, amount: Math.round(amount) })),
      expenseBreakdown: Object.entries(expenseCategories).map(([category, amount]) => ({ category, amount: Math.round(amount) })),
      monthlyBreakdown: Object.values(monthlyBreakdown),
      divisionComparison: Object.values(divisionAggr),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate P&L report', error: err.message });
  }
};

// =================== CASHFLOW REPORT ===================

export const getCashflowReport = async (req, res) => {
  try {
    const transactions = await prisma.financialTransaction.findMany({
      orderBy: { date: 'asc' },
    });

    const monthlyMap = {};
    let runningBalance = 450000; // Starting baseline cash

    transactions.forEach((tx) => {
      const monthKey = dayjs(tx.date).format('MMM YYYY');
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          inflow: 0,
          outflow: 0,
          netCashflow: 0,
          closingBalance: 0,
          rawDate: tx.date,
        };
      }

      if (tx.type === 'Income') {
        monthlyMap[monthKey].inflow += tx.amount;
      } else {
        monthlyMap[monthKey].outflow += tx.amount;
      }
    });

    const sortedMonths = Object.values(monthlyMap).sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
    sortedMonths.forEach((m) => {
      m.netCashflow = m.inflow - m.outflow;
      runningBalance += m.netCashflow;
      m.closingBalance = runningBalance;
    });

    return res.json({
      success: true,
      currentCashBalance: Math.round(runningBalance),
      monthlyCashflow: sortedMonths,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate cashflow', error: err.message });
  }
};

// =================== INVOICES & PAYMENTS ===================

export const getInvoices = async (req, res) => {
  try {
    const { search, status, type, page = 1, limit = 20 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { companyName: { contains: search } } },
        { supplier: { companyName: { contains: search } } },
      ];
    }
    if (status && status !== 'All') where.status = status;
    if (type && type !== 'All') where.invoiceType = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [invoices, totalCount] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take,
        orderBy: { issueDate: 'desc' },
        include: {
          customer: { select: { id: true, companyName: true, email: true, phone: true } },
          supplier: { select: { id: true, companyName: true, email: true } },
          items: true,
          payments: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    const metrics = await prisma.invoice.aggregate({
      _sum: { totalAmount: true, paidAmount: true, balanceDue: true },
    });

    return res.json({
      success: true,
      invoices,
      metrics: {
        totalInvoiced: metrics._sum.totalAmount || 0,
        totalCollected: metrics._sum.paidAmount || 0,
        totalOutstanding: metrics._sum.balanceDue || 0,
      },
      pagination: { page: parseInt(page), limit: take, totalCount, totalPages: Math.ceil(totalCount / take) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch invoices', error: err.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const {
      invoiceType = 'Sales Invoice',
      customerId,
      supplierId,
      issueDate,
      dueDate,
      currency = 'USD',
      taxRate = 11.0,
      items = [],
      notes,
      terms,
    } = req.body;

    const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const taxAmount = (subtotal * Number(taxRate)) / 100;
    const totalAmount = subtotal + taxAmount;

    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-2026-${String(count + 1).padStart(4, '0')}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        invoiceType,
        customerId: customerId || null,
        supplierId: supplierId || null,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : dayjs().add(30, 'day').toDate(),
        currency,
        subtotal,
        taxRate: Number(taxRate),
        taxAmount,
        totalAmount,
        paidAmount: 0,
        balanceDue: totalAmount,
        status: 'Pending',
        notes,
        terms,
        items: {
          create: items.map((it) => ({
            description: it.description,
            quantity: Number(it.quantity || 1),
            unitPrice: Number(it.unitPrice || 0),
            amount: Number(it.quantity || 1) * Number(it.unitPrice || 0),
          })),
        },
      },
      include: { items: true },
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE',
      module: 'Invoice',
      recordId: newInvoice.id,
      details: `Generated invoice ${invoiceNumber} total $${totalAmount}`,
      req,
    });

    return res.status(201).json({ success: true, message: 'Invoice generated successfully', invoice: newInvoice });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create invoice', error: err.message });
  }
};

export const recordInvoicePayment = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { amount, paymentMethod = 'Bank Transfer', referenceNumber, notes } = req.body;

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const payAmount = Number(amount);
    const newPaidAmount = invoice.paidAmount + payAmount;
    const newBalance = Math.max(0, invoice.totalAmount - newPaidAmount);
    const newStatus = newBalance <= 0 ? 'Paid' : 'Partial';

    const count = await prisma.payment.count();
    const paymentNumber = `RCT-2026-${String(count + 1).padStart(4, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId,
          paymentDate: new Date(),
          amount: payAmount,
          paymentMethod,
          referenceNumber,
          notes,
        },
      });

      const updatedInv = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balanceDue: newBalance,
          status: newStatus,
        },
      });

      // Record in financial transactions as Income (or expense if vendor invoice)
      await tx.financialTransaction.create({
        data: {
          transactionNumber: `TRX-${paymentNumber}`,
          date: new Date(),
          division: invoice.invoiceType.includes('Rental') ? 'Container Rental' : (invoice.invoiceType.includes('Container') ? 'Container Trading' : 'Shipping Line'),
          type: invoice.invoiceType.includes('Purchase') ? 'Expense' : 'Income',
          category: invoice.invoiceType.includes('Rental') ? 'Container Rental' : 'Ocean Freight',
          amount: payAmount,
          currency: invoice.currency,
          exchangeRate: 16250,
          amountIdr: payAmount * 16250,
          referenceType: 'Invoice',
          referenceId: invoice.id,
          description: `Payment for invoice ${invoice.invoiceNumber}`,
          paymentMethod,
          status: 'Completed',
          createdBy: req.user?.name || 'Finance Staff',
        },
      });

      return { payment: p, invoice: updatedInv };
    });

    return res.json({ success: true, message: 'Payment recorded successfully', ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record payment', error: err.message });
  }
};

