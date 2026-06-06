const express = require('express');
const { createQuotation, getVendorQuotations, compareQuotations } = require('../controllers/quotationController');
const { approveQuotation } = require('../controllers/approvalController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Manager/Admin approving a quote
router.put('/:id/approve', authorize('ADMIN', 'MANAGER'), approveQuotation);

// Vendor viewing their own quotes
router.get('/vendor', authorize('VENDOR'), getVendorQuotations);

// Manager/Procurement Officer comparing quotes for a specific RFQ
router.get('/compare/:rfqId', authorize('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), compareQuotations);

// Vendor submitting a quote
router.post('/', authorize('VENDOR'), createQuotation);

module.exports = router;