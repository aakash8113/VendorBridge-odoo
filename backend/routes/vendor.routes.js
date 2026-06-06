import { Router } from 'express';
import { listVendors, createVendor, getVendorDetail, updateVendor, changeVendorStatus, deleteVendor, getVendorRfqs } from '../controllers/vendorController.js';
import { verifyJWT, allowRoles } from '../middleware/auth.js';

const router = Router();

router.use(verifyJWT);

router.get('/', listVendors);
router.post('/', allowRoles('admin'), createVendor);
router.get('/:id', getVendorDetail);
router.patch('/:id', allowRoles('admin'), updateVendor);
router.patch('/:id/status', allowRoles('admin'), changeVendorStatus);
router.delete('/:id', allowRoles('admin'), deleteVendor);
router.get('/:id/rfqs', getVendorRfqs);

export default router;
