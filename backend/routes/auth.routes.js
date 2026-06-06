import { Router } from 'express';
import { body } from 'express-validator';
import { register, verifyOtp, login, refresh, forgotPassword, resetPassword, logout, getMe, updateProfile } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { verifyJWT } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import passport from 'passport';
import config from '../config/index.js';
import { generateTokens, cookieOptions } from '../services/authService.js';

const router = Router();

router.post('/register',
  rateLimiter,
  [
    body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ min: 2, max: 50 }),
    body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ min: 2, max: 50 }),
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').matches(/^(?=.*[A-Z])(?=.*[0-9])/).withMessage('Password must contain at least one uppercase letter and one number'),
    body('role').isIn(['admin','officer','manager','vendor']).withMessage('Invalid role'),
  ],
  validate,
  register
);

router.post('/verify-otp', rateLimiter, verifyOtp);
router.post('/login', rateLimiter, login);
router.post('/refresh', refresh);
router.post('/forgot-password', rateLimiter, forgotPassword);
router.post('/reset-password', rateLimiter, resetPassword);
router.post('/logout', logout);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${config.app.clientUrl}/login?error=oauth_failed` }),
  (req, res) => {
    const { accessToken, refreshToken } = generateTokens(req.user._id);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    const isNew = req.user._isNewGoogleUser ? 'true' : 'false';
    res.redirect(`${config.app.clientUrl}/auth/callback?token=${accessToken}&isNew=${isNew}`);
  }
);

// Protected routes
router.get('/me', verifyJWT, getMe);
router.patch('/profile', verifyJWT, updateProfile);

export default router;
