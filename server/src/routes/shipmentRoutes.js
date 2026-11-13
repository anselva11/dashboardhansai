import { Router } from 'express';
import {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  updateTrackingStage,
} from '../controllers/shipmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getShipments);
router.get('/:id', getShipmentById);
router.post('/', authorize('Super Admin', 'Administrator', 'Shipping Manager', 'Operational Staff'), createShipment);
router.put('/:id', authorize('Super Admin', 'Administrator', 'Shipping Manager', 'Operational Staff'), updateShipment);
router.delete('/:id', authorize('Super Admin', 'Administrator', 'Shipping Manager'), deleteShipment);
router.put('/:shipmentId/tracking/:stageOrder', authorize('Super Admin', 'Administrator', 'Shipping Manager', 'Operational Staff'), updateTrackingStage);

export default router;

