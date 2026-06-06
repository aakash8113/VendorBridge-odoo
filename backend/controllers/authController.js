import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import ActivityLog from '../models/ActivityLog.model.js';
import { generateTokens, cookieOptions } from '../services/authService.js';
import { generateOTP, verifyOTP } from '../services/otpService.js';
import { sendOtpEmail, sendResetOtpEmail } from '../services/emailService.js';
import redis from '../config/redis.js';
import config from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role, phone, country, additionalInfo } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role,
    phone,
    country,
    additionalInfo,
    isVerified: false,
  });

  const otp = await generateOTP(email, 'register');
  await sendOtpEmail(email, otp);

  // Log activity
  await ActivityLog.create({
    action: 'USER_REGISTERED',
    entity: 'user',
    entityId: user._id,
    entityTitle: `${firstName} ${lastName}`,
    performedBy: user._id,
  });

  return res.status(201).json(new ApiResponse(201, {}, 'OTP sent to email. Please verify.'));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isValid = await verifyOTP(email, otp, 'register');
  if (!isValid) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  user.isVerified = true;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Set refresh token in cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Log activity
  await ActivityLog.create({
    action: 'USER_VERIFIED_OTP',
    entity: 'user',
    entityId: user._id,
    entityTitle: `${user.firstName} ${user.lastName}`,
    performedBy: user._id,
  });

  return res.json(new ApiResponse(200, {
    accessToken,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    }
  }, 'OTP verified successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isVerified) {
    throw new ApiError(403, 'Please verify your email first');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Log activity
  await ActivityLog.create({
    action: 'USER_LOGGED_IN',
    entity: 'user',
    entityId: user._id,
    entityTitle: `${user.firstName} ${user.lastName}`,
    performedBy: user._id,
  });

  return res.json(new ApiResponse(200, {
    accessToken,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    }
  }, 'Logged in successfully'));
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token missing');
  }

  // Check blacklist
  if (redis && redis.status === 'ready') {
    const isBlacklisted = await redis.get(`bl:${refreshToken}`);
    if (isBlacklisted) {
      throw new ApiError(401, 'Token revoked');
    }
  }

  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const { accessToken } = generateTokens(decoded.id);

    return res.json(new ApiResponse(200, { accessToken }, 'Token refreshed successfully'));
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  // Security best practice: don't reveal if email exists or not
  if (!user) {
    return res.json(new ApiResponse(200, {}, 'If the email exists, an OTP has been sent.'));
  }

  const otp = await generateOTP(email, 'reset');
  await sendResetOtpEmail(email, otp);

  return res.json(new ApiResponse(200, {}, 'If the email exists, an OTP has been sent.'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isValid = await verifyOTP(email, otp, 'reset');
  if (!isValid) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  user.password = newPassword;
  await user.save();

  // Log activity
  await ActivityLog.create({
    action: 'USER_PASSWORD_RESET',
    entity: 'user',
    entityId: user._id,
    entityTitle: `${user.firstName} ${user.lastName}`,
    performedBy: user._id,
  });

  return res.json(new ApiResponse(200, {}, 'Password reset successfully'));
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.decode(refreshToken);
      if (decoded && decoded.exp) {
        const remainingSeconds = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
        if (remainingSeconds > 0 && redis && redis.status === 'ready') {
          await redis.set(`bl:${refreshToken}`, '1', 'EX', remainingSeconds);
        }
      }
    } catch (e) {
      console.error('Error blacklisting token on logout:', e.message);
    }
  }

  res.clearCookie('refreshToken', cookieOptions);

  if (req.user) {
    await ActivityLog.create({
      action: 'USER_LOGGED_OUT',
      entity: 'user',
      entityId: req.user._id,
      entityTitle: `${req.user.firstName} ${req.user.lastName}`,
      performedBy: req.user._id,
    });
  }

  return res.json(new ApiResponse(200, {}, 'Logged out successfully'));
});

export const getMe = asyncHandler(async (req, res) => {
  return res.json(new ApiResponse(200, req.user, 'Current user profile fetched'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, country, additionalInfo, avatar } = req.body;

  if (firstName) req.user.firstName = firstName;
  if (lastName) req.user.lastName = lastName;
  if (phone) req.user.phone = phone;
  if (country) req.user.country = country;
  if (additionalInfo) req.user.additionalInfo = additionalInfo;
  if (avatar) req.user.avatar = avatar; // Expected { url, fileId }

  await req.user.save();

  return res.json(new ApiResponse(200, req.user, 'Profile updated successfully'));
});
