import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  getProfitLossReport,
  getCashflowReport,
  getInvoices,
  createInvoice,
  recordInvoicePayment,
} from '../controllers/financeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Transactions & General Ledger
router.get('/transactions', getTransactions);
router.post('/transactions', authorize('Super Admin', 'Administrator', 'Finance Manager'), createTransaction);

// Statements
router.get('/profit-loss', getProfitLossReport);
router.get('/cashflow', getCashflowReport);

// Invoices & Receivables / Payables
router.get('/invoices', getInvoices);
router.post('/invoices', authorize('Super Admin', 'Administrator', 'Finance Manager'), createInvoice);
router.post('/invoices/:invoiceId/payments', authorize('Super Admin', 'Administrator', 'Finance Manager'), recordInvoicePayment);

export default router;

