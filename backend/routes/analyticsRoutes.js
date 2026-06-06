const express = require('express');
const { getKpis, getSpendByCategory } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
// Protect analytics to high level internal users
router.use(authorize('ADMIN', 'MANAGER'));

router.get('/kpis', getKpis);
router.get('/spend-by-category', getSpendByCategory);

module.exports = router;