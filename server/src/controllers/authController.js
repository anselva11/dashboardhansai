import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { logAudit } from '../middleware/audit.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hansai_shipping_line_enterprise_jwt_secret_key_2026_super_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await logAudit({
      userId: user.id,
      userName: user.name,
      action: 'LOGIN',
      module: 'Auth',
      recordId: user.id,
      details: `User ${user.email} logged in with role ${user.role}`,
      req,
    });

    const userSafe = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      phone: user.phone,
      avatar: user.avatar,
    };

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: userSafe,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

export const getProfile = async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (phone) dataToUpdate.phone = phone;
    if (department) dataToUpdate.department = department;

    if (newPassword) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to change password.' });
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(400).json({ success: false, message: 'Incorrect current password.' });
      }
      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        department: true,
      },
    });

    await logAudit({
      userId,
      userName: updatedUser.name,
      action: 'UPDATE',
      module: 'User Profile',
      recordId: userId,
      details: 'Updated user personal profile details.',
      req,
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.', error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase().trim() } });
    if (!user) {
      return res.json({
        success: true,
        message: 'If the email exists in our system, a password reset link has been dispatched.',
      });
    }

    return res.json({
      success: true,
      message: `Password reset link generated for ${email}. For DEMO mode, use the demo credentials or reset function.`,
      demoResetToken: 'DEMO-RESET-' + Buffer.from(email).toString('base64'),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to process request.', error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { password: hashedPassword },
    });

    return res.json({
      success: true,
      message: 'Password has been successfully reset. You can now log in.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Reset failed.', error: err.message });
  }
};

export const getDemoAccounts = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        department: true,
      },
      orderBy: { role: 'asc' },
    });

    const demoList = users.map((u) => ({
      ...u,
      passwordHint: 'hansai123',
    }));

    return res.json({
      success: true,
      demoAccounts: demoList,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving demo accounts.' });
  }
};

