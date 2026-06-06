import Redis from 'ioredis';
import config from './index.js';

let redis;

try {
  if (config.redis.url) {
    redis = new Redis(config.redis.url);
  } else {
    redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
    });
  }

  redis.on('connect', () => {
    console.log(`Redis connected successfully to ${config.redis.host}:${config.redis.port}`);
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });
} catch (error) {
  console.error('Failed to initialize Redis client:', error.message);
}

export default redis;
