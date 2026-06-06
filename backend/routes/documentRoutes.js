const express = require('express');
const { 
  generateInvoice, 
  generateInvoicePdf, 
  sendInvoiceEmailRoute 
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Invoice Generation POST
router.post('/invoices/generate/:poId', authorize('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), generateInvoice);

// Document PDF Generation GET
router.get('/documents/pdf/:invoiceId', authorize('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'VENDOR'), generateInvoicePdf);

// Send Invoice Email via Nodemailer POST
router.post('/invoices/:invoiceId/send', authorize('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), sendInvoiceEmailRoute);

module.exports = router;