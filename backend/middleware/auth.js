import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import config from '../config/index.js';
import User from '../models/User.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Unauthorized: Access token missing');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'Unauthorized: User not found');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Forbidden: Account is inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Unauthorized: Invalid or expired access token');
  }
});

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized: Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: Insufficient permissions'));
    }

    next();
  };
};
