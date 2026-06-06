const express = require('express');
const { createQuotation, getVendorQuotations, compareQuotations, getAllQuotations } = require('../controllers/quotationController');
const { approveQuotation, getPendingApprovals, rejectQuotation } = require('../controllers/approvalController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Manager/Admin endpoints for approvals (must be before /:id routes)
router.get('/pending', authorize('ADMIN', 'MANAGER'), getPendingApprovals);
router.put('/:id/approve', authorize('ADMIN', 'MANAGER'), approveQuotation);
router.put('/:id/reject', authorize('ADMIN', 'MANAGER'), rejectQuotation);

// All quotations view for admin/manager/procurement
router.get('/', authorize('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), getAllQuotations);

// Vendor viewing their own quotes
router.get('/vendor', authorize('VENDOR'), getVendorQuotations);

// Manager/Procurement Officer comparing quotes for a specific RFQ
router.get('/compare/:rfqId', authorize('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), compareQuotations);

// Vendor submitting a quote
router.post('/', authorize('VENDOR'), createQuotation);

module.exports = router;