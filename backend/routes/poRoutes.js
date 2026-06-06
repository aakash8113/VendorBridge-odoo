const express = require('express');
const { getPurchaseOrders, updatePoStatus } = require('../controllers/poController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Allowed for all roles (Vendor sees only their own via controller logic)
router.get('/', authorize('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'VENDOR'), getPurchaseOrders);

// Update PO status (Admin, Manager)
router.put('/:id', authorize('ADMIN', 'MANAGER'), updatePoStatus);

module.exports = router;
