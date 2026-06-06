import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from Backend/.env
const result = dotenv.config({ path: path.join(__dirname, '../.env') });
if (result.error) {
  console.error('Dotenv error:', result.error);
} else {
  console.log('Dotenv loaded keys:', Object.keys(result.parsed || {}));
}

// LangChain/Gemini looks for GOOGLE_API_KEY in the environment
process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API;

console.log('--- Environment Configuration Loaded ---');
console.log('Mongo URI:', process.env.MONGO_URI ? 'LOADED' : 'MISSING');
console.log('Redis Host:', process.env.REDIS_HOST ? 'LOADED' : 'MISSING');
console.log('Google Gemini API Key:', process.env.GOOGLE_API_KEY ? 'LOADED' : 'MISSING');
console.log('----------------------------------------');

export default {
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || process.env.NODE_ENVIRONMENT || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  },
  mongo: {
    uri: process.env.MONGO_URI,
  },
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET || process.env.JWT || 'default_jwt_secret_min_32chars_for_safety',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT || 'default_refresh_secret_min_32chars_for_safety',
    accessExpiry: '15m',
    refreshExpiry: '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
  },
  imagekit: {
    publicKey: process.env.IK_PUBLIC_KEY || 'developer-placeholder-public-key',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || process.env.IK_PRIVATE_KEY || 'developer-placeholder-private-key',
    urlEndpoint: process.env.IK_URL_ENDPOINT || 'https://ik.imagekit.io/developer-placeholder-endpoint',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API,
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || process.env.GOOGLE_EMAIL,
    pass: process.env.SMTP_PASS || process.env.BREVO_API_KEY,
    from: process.env.SMTP_FROM || '"VendorBridge" <teamclickjack@gmail.com>',
  },
};
