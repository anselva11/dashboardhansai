import prisma from '../config/prisma.js';
import { logAudit } from '../middleware/audit.js';

// =================== CUSTOMERS ===================

export const getCustomers = async (req, res) => {
  try {
    const { search, country, type, page = 1, limit = 20 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    if (country && country !== 'All') where.country = country;
    if (type && type !== 'All') where.customerType = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { companyName: 'asc' },
        include: {
          _count: { select: { shipments: true, rentals: true, invoices: true, containerSales: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    const totalOutstanding = await prisma.customer.aggregate({
      _sum: { outstandingBalance: true },
    });

    return res.json({
      success: true,
      customers,
      totalOutstanding: totalOutstanding._sum.outstandingBalance || 0,
      pagination: { page: parseInt(page), limit: take, totalCount, totalPages: Math.ceil(totalCount / take) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch customers', error: err.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        shipments: { take: 10, orderBy: { createdAt: 'desc' } },
        rentals: { take: 10, orderBy: { createdAt: 'desc' }, include: { container: true } },
        invoices: { take: 10, orderBy: { issueDate: 'desc' } },
        containerSales: { take: 10, orderBy: { salesDate: 'desc' } },
      },
    });

    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    return res.json({ success: true, customer });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving customer', error: err.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, address, country, taxId, customerType = 'Corporate', creditLimit = 0 } = req.body;

    const customer = await prisma.customer.create({
      data: {
        companyName,
        contactPerson,
        email,
        phone,
        address,
        country,
        taxId,
        customerType,
        creditLimit: Number(creditLimit),
        outstandingBalance: 0,
      },
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE',
      module: 'Customer CRM',
      recordId: customer.id,
      details: `Added new corporate customer ${companyName} (${country})`,
      req,
    });

    return res.status(201).json({ success: true, message: 'Customer created successfully', customer });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create customer', error: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.creditLimit !== undefined) updateData.creditLimit = Number(updateData.creditLimit);
    if (updateData.outstandingBalance !== undefined) updateData.outstandingBalance = Number(updateData.outstandingBalance);

    const updated = await prisma.customer.update({ where: { id }, data: updateData });
    return res.json({ success: true, message: 'Customer updated successfully', customer: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update customer', error: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({ where: { id } });
    return res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete customer', error: err.message });
  }
};

// =================== SUPPLIERS ===================

export const getSuppliers = async (req, res) => {
  try {
    const { search, serviceType, country, page = 1, limit = 20 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (serviceType && serviceType !== 'All') where.serviceType = serviceType;
    if (country && country !== 'All') where.country = country;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [suppliers, totalCount] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take,
        orderBy: { companyName: 'asc' },
        include: {
          _count: { select: { shipments: true, containerPurchases: true, invoices: true } },
        },
      }),
      prisma.supplier.count({ where }),
    ]);

    return res.json({
      success: true,
      suppliers,
      pagination: { page: parseInt(page), limit: take, totalCount, totalPages: Math.ceil(totalCount / take) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch suppliers', error: err.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, address, country, taxId, serviceType, paymentTerms = 'Net 30' } = req.body;

    const supplier = await prisma.supplier.create({
      data: {
        companyName,
        contactPerson,
        email,
        phone,
        address,
        country,
        taxId,
        serviceType,
        paymentTerms,
      },
    });

    return res.status(201).json({ success: true, message: 'Supplier added successfully', supplier });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create supplier', error: err.message });
  }
};

