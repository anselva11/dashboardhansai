import { Router } from 'express';
import { login, getProfile, updateProfile, forgotPassword, resetPassword, getDemoAccounts } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/demo-accounts', getDemoAccounts);
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);

export default router;

