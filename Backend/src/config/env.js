import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');

// Load production-first fallback chain from Backend root so env resolution
// is stable regardless of process working directory.
dotenv.config({ path: path.join(backendRoot, '.env.production') });
dotenv.config({ path: path.join(backendRoot, '.env') });

const parseBooleanEnv = (value, fallback = true) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

/**
 * Environment configuration with validation
 */
const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  APP_URL: process.env.APP_URL || 'http://localhost:5000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  APP_NAME: process.env.NAME || 'MediConnect',
  APP_VERSION: process.env.VERSION || '1.0.0',

  // Database
  MONGODB_URL: process.env.MONGODB_URL || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Payments (Khalti)
  KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY || '',
  KHALTI_PUBLIC_KEY: process.env.KHALTI_PUBLIC_KEY || '',
  KHALTI_API_BASE_URL: process.env.KHALTI_API_BASE_URL || 'https://dev.khalti.com/api/v2',

  // Billing defaults
  DEFAULT_CONSULTATION_FEE: parseInt(process.env.DEFAULT_CONSULTATION_FEE, 10) || 500,

  // Email notifications (Resend)
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'MediConnect <noreply@mediconnect.local>',

  // Web Push (VAPID)
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || '',
  VAPID_SUBJECT: process.env.VAPID_SUBJECT || 'mailto:support@mediconnect.local',

  // Social auth provider client IDs (patient flow only)
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID || '',
  FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET || '',
  GOOGLE_AUTH_ENABLED: parseBooleanEnv(process.env.GOOGLE_AUTH_ENABLED, false),
  GITHUB_AUTH_ENABLED: parseBooleanEnv(process.env.GITHUB_AUTH_ENABLED, false),
  FACEBOOK_AUTH_ENABLED: parseBooleanEnv(process.env.FACEBOOK_AUTH_ENABLED, false),
  OAUTH_CALLBACK_PATH: process.env.OAUTH_CALLBACK_PATH || '/auth/oauth/callback',
};

/**
 * Validate required environment variables
 */
const validateEnv = () => {
  const requiredVars = ['MONGODB_URL', 'JWT_SECRET'];
  const missing = requiredVars.filter((key) => !env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

// Validate on import in production
if (env.NODE_ENV === 'production') {
  validateEnv();
}

export default env;
