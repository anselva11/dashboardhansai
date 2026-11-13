import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getSuppliers,
  createSupplier,
} from '../controllers/crmController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Customers
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.post('/customers', authorize('Super Admin', 'Administrator', 'Shipping Manager', 'Container Manager'), createCustomer);
router.put('/customers/:id', authorize('Super Admin', 'Administrator', 'Shipping Manager', 'Container Manager'), updateCustomer);
router.delete('/customers/:id', authorize('Super Admin', 'Administrator'), deleteCustomer);

// Suppliers
router.get('/suppliers', getSuppliers);
router.post('/suppliers', authorize('Super Admin', 'Administrator', 'Finance Manager'), createSupplier);

export default router;

