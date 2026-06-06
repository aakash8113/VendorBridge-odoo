const express = require('express');
const { getKpis, getSpendByCategory, getMonthlyTrend, getTopVendors } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
// Protect analytics to high level internal users
router.use(authorize('ADMIN', 'MANAGER'));

router.get('/kpis', getKpis);
router.get('/spend-by-category', getSpendByCategory);
router.get('/monthly-trend', getMonthlyTrend);
router.get('/top-vendors', getTopVendors);

module.exports = router;