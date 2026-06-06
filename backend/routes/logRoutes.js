const express = require('express');
const { getLogs } = require('../controllers/logController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
// Restrict audit trails to Admins (or extend to Managers if needed)
router.use(authorize('ADMIN'));

router.get('/', getLogs);

module.exports = router;