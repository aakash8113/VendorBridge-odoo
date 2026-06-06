import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiry }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry }
  );

  return { accessToken, refreshToken };
};

export const cookieOptions = {
  httpOnly: true,
  secure: config.app.nodeEnv === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
};
