const express = require('express');
const { createRfq, getRfqs, getRfqById } = require('../controllers/rfqController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Allow form-data file uploads via multer
router.post('/', authorize('PROCUREMENT_OFFICER', 'ADMIN'), upload.single('attachment'), createRfq);
router.get('/', authorize('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'VENDOR'), getRfqs);
router.get('/:id', authorize('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'VENDOR'), getRfqById);

module.exports = router;