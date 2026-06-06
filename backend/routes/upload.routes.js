import { Router } from 'express';
import { getUploadAuth, deleteFile, uploadFile } from '../controllers/uploadController.js';
import { verifyJWT } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public upload endpoint to support profile avatar upload during registration
router.post('/', upload.single('file'), uploadFile);

// JWT verification for auth retrieval and file deletion
router.use(verifyJWT);
router.get('/auth', getUploadAuth);
router.delete('/file', deleteFile);

export default router;
