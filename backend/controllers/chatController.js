import redis from '../config/redis.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { streamChat } from '../services/chatService.js';

export const handleChat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const sessionId = req.body.sessionId || req.user?._id || 'default-session';
  if (!message) {
    return res.status(400).json(new ApiResponse(400, {}, 'message is required'));
  }
  await streamChat(sessionId, message, res);
});

export const clearChatSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  if (redis && redis.status === 'ready') {
    await redis.del(`chat:${sessionId}`);
  }
  return res.json(new ApiResponse(200, {}, 'Chat session cleared'));
});
