import redis from '../config/redis.js';
import { ApiError } from '../utils/ApiError.js';

export const rateLimiter = async (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const key = `rate:${ip}`;
  const limit = 100; // 100 requests per minute for hackathon/production stability

  if (!redis || redis.status !== 'ready') {
    // Fail-open if Redis is not fully connected
    return next();
  }

  try {
    const hits = await redis.incr(key);

    if (hits === 1) {
      await redis.expire(key, 60);
    }

    if (hits > limit) {
      const ttl = await redis.ttl(key);
      res.setHeader('Retry-After', ttl > 0 ? ttl : 1);
      return next(new ApiError(429, `Too many requests from this IP. Please try again in ${ttl > 0 ? ttl : 1} seconds.`));
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error.message);
    next();
  }
};
