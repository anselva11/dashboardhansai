import { Router } from 'express';
import {
  getContainers,
  getContainerById,
  createContainer,
  updateContainer,
  deleteContainer,
  getContainerMaintenance,
  createContainerMaintenance,
} from '../controllers/containerController.js';
import {
  getRentals,
  createRental,
  returnContainer,
  addRentalPayment,
} from '../controllers/containerRentalController.js';
import {
  getPurchases,
  createPurchase,
  getSales,
  createSale,
} from '../controllers/containerTradeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Inventory
router.get('/inventory', getContainers);
router.get('/inventory/:id', getContainerById);
router.post('/inventory', authorize('Super Admin', 'Administrator', 'Container Manager'), createContainer);
router.put('/inventory/:id', authorize('Super Admin', 'Administrator', 'Container Manager'), updateContainer);
router.delete('/inventory/:id', authorize('Super Admin', 'Administrator', 'Container Manager'), deleteContainer);

// Maintenance
router.get('/maintenance', getContainerMaintenance);
router.post('/maintenance', authorize('Super Admin', 'Administrator', 'Container Manager'), createContainerMaintenance);

// Rentals
router.get('/rentals', getRentals);
router.post('/rentals', authorize('Super Admin', 'Administrator', 'Container Manager'), createRental);
router.put('/rentals/:id/return', authorize('Super Admin', 'Administrator', 'Container Manager'), returnContainer);
router.post('/rentals/:id/payments', authorize('Super Admin', 'Administrator', 'Container Manager', 'Finance Manager'), addRentalPayment);

// Trading (Purchases & Sales)
router.get('/purchases', getPurchases);
router.post('/purchases', authorize('Super Admin', 'Administrator', 'Container Manager', 'Finance Manager'), createPurchase);
router.get('/sales', getSales);
router.post('/sales', authorize('Super Admin', 'Administrator', 'Container Manager', 'Finance Manager'), createSale);

export default router;
