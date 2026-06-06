import { Router } from 'express';
import { body } from 'express-validator';
import { listRfqs, createRfq, getRfqDetail, updateRfq, publishRfq, closeRfq, cancelRfq } from '../controllers/rfqController.js';
import { verifyJWT, allowRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(verifyJWT);

router.get('/', listRfqs);

router.post('/',
  allowRoles('officer', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('RFQ Title is required').isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('category').notEmpty().withMessage('Category is required'),
    body('deadline').isISO8601().withMessage('Valid deadline date is required').custom(v => new Date(v) > new Date()).withMessage('Deadline must be in the future'),
    body('lineItems').isArray({ min: 1 }).withMessage('At least one line item is required'),
    body('lineItems.*.item').notEmpty().withMessage('Line item name is required'),
    body('lineItems.*.qty').isInt({ min: 1 }).withMessage('Line item quantity must be at least 1'),
    body('assignedVendors').isArray({ min: 1 }).withMessage('At least one assigned vendor is required'),
  ],
  validate,
  createRfq
);

router.get('/:id', getRfqDetail);

router.patch('/:id',
  allowRoles('officer', 'admin'),
  [
    body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('deadline').optional().isISO8601().custom(v => new Date(v) > new Date()).withMessage('Deadline must be in the future'),
    body('lineItems').optional().isArray({ min: 1 }).withMessage('At least one line item is required'),
    body('lineItems.*.item').optional().notEmpty().withMessage('Line item name is required'),
    body('lineItems.*.qty').optional().isInt({ min: 1 }).withMessage('Line item quantity must be at least 1'),
    body('assignedVendors').optional().isArray({ min: 1 }).withMessage('At least one assigned vendor is required'),
  ],
  validate,
  updateRfq
);

router.patch('/:id/publish', allowRoles('officer', 'admin'), publishRfq);
router.patch('/:id/close', allowRoles('officer', 'admin'), closeRfq);
router.delete('/:id', allowRoles('officer', 'admin'), cancelRfq);

export default router;
