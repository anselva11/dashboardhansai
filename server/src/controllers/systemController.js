import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import { seedDatabase } from '../../prisma/seed.js';
import { logAudit } from '../middleware/audit.js';

// =================== USERS & RBAC ===================

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users', error: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password, name, role = 'Operational Staff', department, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password || 'hansai123', 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name,
        role,
        department,
        phone,
        isActive: true,
      },
      select: { id: true, email: true, name: true, role: true, department: true, phone: true, isActive: true },
    });

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE',
      module: 'User Management',
      recordId: user.id,
      details: `Created new user ${user.email} with role ${user.role}`,
      req,
    });

    return res.status(201).json({ success: true, message: 'User created successfully', user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create user', error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, department, phone, isActive, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, department: true, phone: true, isActive: true },
    });

    return res.json({ success: true, message: 'User updated successfully', user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update user', error: err.message });
  }
};

export const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
    return res.json({ success: true, roles });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch roles', error: err.message });
  }
};

// =================== TAX CONFIGURATION ===================

export const getTaxConfigurations = async (req, res) => {
  try {
    const configs = await prisma.taxConfiguration.findMany({ orderBy: { category: 'asc' } });
    return res.json({ success: true, configs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch tax configs', error: err.message });
  }
};

export const updateTaxConfiguration = async (req, res) => {
  try {
    const { id } = req.params;
    const { ratePercent, name, taxBaseFormula, isActive } = req.body;

    const updated = await prisma.taxConfiguration.update({
      where: { id },
      data: {
        ratePercent: ratePercent !== undefined ? Number(ratePercent) : undefined,
        name: name || undefined,
        taxBaseFormula: taxBaseFormula || undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return res.json({ success: true, message: 'Tax configuration updated', config: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update tax configuration', error: err.message });
  }
};

// =================== EXCHANGE RATES ===================

export const getExchangeRates = async (req, res) => {
  try {
    const rates = await prisma.exchangeRate.findMany({ orderBy: { targetCurrency: 'asc' } });
    return res.json({ success: true, rates });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch exchange rates', error: err.message });
  }
};

export const updateExchangeRate = async (req, res) => {
  try {
    const { targetCurrency, rate } = req.body;
    const updated = await prisma.exchangeRate.upsert({
      where: { baseCurrency_targetCurrency: { baseCurrency: 'USD', targetCurrency } },
      update: { rate: Number(rate), effectiveDate: new Date() },
      create: { baseCurrency: 'USD', targetCurrency, rate: Number(rate) },
    });
    return res.json({ success: true, message: `Exchange rate for ${targetCurrency} updated to ${rate}`, rate: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update rate', error: err.message });
  }
};

// =================== AUDIT LOGS ===================

export const getAuditLogs = async (req, res) => {
  try {
    const { module, action, page = 1, limit = 30 } = req.query;
    const where = {};
    if (module && module !== 'All') where.module = module;
    if (action && action !== 'All') where.action = action;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return res.json({
      success: true,
      logs,
      pagination: { page: parseInt(page), limit: take, totalCount, totalPages: Math.ceil(totalCount / take) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs', error: err.message });
  }
};

// =================== SAFE RESET DEMO DATA (Section 16) ===================

export const resetDemoData = async (req, res) => {
  try {
    // Only Super Admin and Administrator can perform demo data reset
    if (req.user?.role !== 'Super Admin' && req.user?.role !== 'Administrator') {
      return res.status(403).json({ success: false, message: 'Only authorized administrators can reset demo data.' });
    }

    console.log(`[RESET DEMO DATA] Triggered by ${req.user.name} (${req.user.email})`);
    await seedDatabase();

    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      action: 'RESET_DEMO',
      module: 'System',
      recordId: 'DEMO-DATA-RESET',
      details: 'All demonstration records re-seeded to pristine demo state.',
      req,
    });

    return res.json({
      success: true,
      message: 'Demo database has been successfully reset to its pristine state with 30 shipments, 100 containers, 29 vessels, and financial records.',
    });
  } catch (err) {
    console.error('Reset demo data failed:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset demo data', error: err.message });
  }
};

