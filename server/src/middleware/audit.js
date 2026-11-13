import prisma from '../config/prisma.js';

export const logAudit = async ({ userId, userName, action, module, recordId, details, req }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || 'System',
        action,
        module,
        recordId: recordId ? String(recordId) : null,
        details: typeof details === 'object' ? JSON.stringify(details) : String(details || ''),
        ipAddress: String(ipAddress),
      },
    });
  } catch (err) {
    console.error('Audit log recording failed:', err.message);
  }
};

