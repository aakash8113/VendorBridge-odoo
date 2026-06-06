import { Router } from 'express';
import { body } from 'express-validator';
import { listPurchaseOrders, getPurchaseOrderDetail, changePoStatus } from '../controllers/poController.js';
import { verifyJWT, allowRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(verifyJWT);

router.get('/', listPurchaseOrders);
router.get('/:id', getPurchaseOrderDetail);

router.patch('/:id/status',
  allowRoles('officer', 'admin'),
  [
    body('status').isIn(['issued', 'delivered', 'cancelled']).withMessage('Status must be issued, delivered or cancelled'),
  ],
  validate,
  changePoStatus
);

export default router;
