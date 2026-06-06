const express = require('express');
const { getVendors, createVendor, updateVendorStatus } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all vendor routes
router.use(protect);

router.get('/', authorize('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), getVendors);
router.post('/', authorize('ADMIN', 'PROCUREMENT_OFFICER'), createVendor);
router.put('/:id', authorize('ADMIN'), updateVendorStatus);

module.exports = router;