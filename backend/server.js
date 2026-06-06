import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Config & Setup
import config from './config/index.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';

// Middlewares
import { errorHandler } from './middleware/errorHandler.js';

// Models
import User from './models/User.model.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import rfqRoutes from './routes/rfq.routes.js';
import quotationRoutes from './routes/quotation.routes.js';
import approvalRoutes from './routes/approval.routes.js';
import poRoutes from './routes/po.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import reportRoutes from './routes/report.routes.js';
import activityRoutes from './routes/activity.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import chatRoutes from './routes/chat.routes.js';

// Initialize DB Connection
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Security & Utility Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP for easy development and asset loading
}));
app.use(cors({
  origin: config.app.clientUrl,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Passport Setup (Google OAuth Strategy)
app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: config.google.clientId || 'dummy-google-client-id',
    clientSecret: config.google.clientSecret || 'dummy-google-client-secret',
    callbackURL: config.google.callbackUrl,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0]?.value;
      const googleId = profile.id;

      if (!email) {
        return done(new Error('Google account has no associated email'), null);
      }

      let user = await User.findOne({ $or: [{ googleId }, { email }] });
      let isNew = false;

      if (!user) {
        isNew = true;
        user = await User.create({
          googleId,
          email,
          firstName: profile.name?.givenName || 'Google',
          lastName: profile.name?.familyName || 'User',
          isVerified: true,
          role: 'officer',
          avatar: { url: profile.photos[0]?.value || '', fileId: '' }
        });
      } else if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      // Attach isNew flag to user for route handler to see
      user._isNewGoogleUser = isNew;

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

// Wildcard route to serve React app for SPA routing (excluding /api routes)
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Global Error Handler (must be mounted last)
app.use(errorHandler);

const PORT = config.app.port;
server.listen(PORT, () => {
  console.log(`Server running in ${config.app.nodeEnv} mode on port ${PORT}`);
});
