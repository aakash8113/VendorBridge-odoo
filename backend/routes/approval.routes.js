import { Router } from 'express';
import { body } from 'express-validator';
import { listApprovals, getPendingApprovals, getApprovalDetail, processApprovalAction } from '../controllers/approvalController.js';
import { verifyJWT, allowRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(verifyJWT);

router.get('/', listApprovals);
router.get('/pending', allowRoles('manager', 'admin'), getPendingApprovals);
router.get('/:id', getApprovalDetail);

router.post('/:id/action',
  allowRoles('manager', 'admin'),
  [
    body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
    body('remarks').trim().notEmpty().withMessage('Remarks are required for approval actions'),
  ],
  validate,
  processApprovalAction
);

export default router;
