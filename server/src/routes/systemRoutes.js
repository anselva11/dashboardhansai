import { Router } from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  getRoles,
  getTaxConfigurations,
  updateTaxConfiguration,
  getExchangeRates,
  updateExchangeRate,
  getAuditLogs,
  resetDemoData,
} from '../controllers/systemController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// User & Role Management
router.get('/users', authorize('Super Admin', 'Administrator'), getUsers);
router.post('/users', authorize('Super Admin', 'Administrator'), createUser);
router.put('/users/:id', authorize('Super Admin', 'Administrator'), updateUser);
router.get('/roles', getRoles);

// Tax and Exchange Rates Master Data
router.get('/tax-configs', getTaxConfigurations);
router.put('/tax-configs/:id', authorize('Super Admin', 'Administrator', 'Finance Manager'), updateTaxConfiguration);
router.get('/exchange-rates', getExchangeRates);
router.put('/exchange-rates', authorize('Super Admin', 'Administrator', 'Finance Manager'), updateExchangeRate);

// Audit Logs
router.get('/audit-logs', authorize('Super Admin', 'Administrator', 'Viewer'), getAuditLogs);

// Safe Reset Demo Data
router.post('/reset-demo-data', authorize('Super Admin', 'Administrator'), resetDemoData);

export default router;

