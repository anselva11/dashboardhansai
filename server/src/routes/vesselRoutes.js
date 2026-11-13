import { Router } from 'express';
import {
  getVessels,
  getVesselById,
  createVessel,
  updateVessel,
  deleteVessel,
  getVesselPurchases,
  createVesselPurchase,
  getVesselSales,
  createVesselSale,
  getVesselTradingDashboard,
  getVesselMaintenance,
  createVesselMaintenance,
  getVesselExpenses,
  createVesselExpense,
  getVesselDocuments,
  createVesselDocument,
  getVesselSurveys,
  createVesselSurvey,
  getVesselSchedules,
  createVesselSchedule,
} from '../controllers/vesselController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Vessel Dashboard & Database
router.get('/dashboard', getVesselTradingDashboard);
router.get('/', getVessels);
router.get('/schedules', getVesselSchedules);
router.post('/schedules', authorize('Super Admin', 'Administrator', 'Shipping Manager'), createVesselSchedule);
router.get('/purchases', getVesselPurchases);
router.post('/purchases', authorize('Super Admin', 'Administrator', 'Finance Manager'), createVesselPurchase);
router.get('/sales', getVesselSales);
router.post('/sales', authorize('Super Admin', 'Administrator', 'Finance Manager'), createVesselSale);
router.get('/maintenance', getVesselMaintenance);
router.post('/maintenance', authorize('Super Admin', 'Administrator', 'Shipping Manager'), createVesselMaintenance);
router.get('/expenses', getVesselExpenses);
router.post('/expenses', authorize('Super Admin', 'Administrator', 'Finance Manager', 'Shipping Manager'), createVesselExpense);
router.get('/documents', getVesselDocuments);
router.post('/documents', authorize('Super Admin', 'Administrator', 'Shipping Manager'), createVesselDocument);
router.get('/surveys', getVesselSurveys);
router.post('/surveys', authorize('Super Admin', 'Administrator', 'Shipping Manager'), createVesselSurvey);

// Vessel Details & Operations
router.get('/:id', getVesselById);
router.post('/', authorize('Super Admin', 'Administrator', 'Shipping Manager'), createVessel);
router.put('/:id', authorize('Super Admin', 'Administrator', 'Shipping Manager'), updateVessel);
router.delete('/:id', authorize('Super Admin', 'Administrator'), deleteVessel);

export default router;

