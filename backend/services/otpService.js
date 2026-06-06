import redis from '../config/redis.js';

export const generateOTP = async (email, type = 'register') => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const key = type === 'register' ? `otp:${email}` : `otp:reset:${email}`;

  if (redis && redis.status === 'ready') {
    await redis.set(key, otp, 'EX', 300);
  } else {
    console.error('Redis not available. Cannot store OTP.');
    throw new Error('OTP storage unavailable');
  }

  return otp;
};

export const verifyOTP = async (email, otp, type = 'register') => {
  const key = type === 'register' ? `otp:${email}` : `otp:reset:${email}`;

  if (redis && redis.status === 'ready') {
    const cachedOtp = await redis.get(key);
    if (!cachedOtp) return false;
    if (cachedOtp === otp) {
      await redis.del(key);
      return true;
    }
  } else {
    console.error('Redis not available. Cannot verify OTP.');
    throw new Error('OTP verification unavailable');
  }

  return false;
};
