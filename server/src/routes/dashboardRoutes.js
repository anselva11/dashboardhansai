import { Router } from 'express';
import { getExecutiveDashboardData } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getExecutiveDashboardData);

export default router;

