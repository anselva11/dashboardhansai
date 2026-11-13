import { Router } from 'express';
import {
  calculateTaxCustoms,
  calculateTHC,
  calculateOceanFreight,
  calculateLCL,
  calculateCBM,
  calculateProfitMargin,
  calculateVesselTradingProfit,
  getCalculatorHistory,
} from '../controllers/calculatorController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/tax-customs', calculateTaxCustoms);
router.post('/thc', calculateTHC);
router.post('/ocean-freight', calculateOceanFreight);
router.post('/lcl', calculateLCL);
router.post('/cbm', calculateCBM);
router.post('/profit-margin', calculateProfitMargin);
router.post('/vessel-profit', calculateVesselTradingProfit);
router.get('/history', getCalculatorHistory);

export default router;

