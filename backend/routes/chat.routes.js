import { Router } from 'express';
import { handleChat, clearChatSession } from '../controllers/chatController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = Router();

router.use(verifyJWT);

router.post('/', handleChat);
router.delete('/:sessionId', clearChatSession);

export default router;
