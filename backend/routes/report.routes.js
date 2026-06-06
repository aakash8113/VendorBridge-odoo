import { Router } from 'express';
import { getDashboardStats, getAnalytics, exportProcurementData } from '../controllers/reportController.js';
import { verifyJWT, allowRoles } from '../middleware/auth.js';

const router = Router();

router.use(verifyJWT);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', allowRoles('admin', 'manager', 'officer'), getAnalytics);
router.get('/export', allowRoles('admin'), exportProcurementData);

export default router;
