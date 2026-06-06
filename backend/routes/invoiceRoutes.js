const express = require('express');
const { getInvoices, updateInvoiceStatus } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', authorize('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'VENDOR'), getInvoices);
router.put('/:id', authorize('ADMIN', 'MANAGER'), updateInvoiceStatus);

module.exports = router;