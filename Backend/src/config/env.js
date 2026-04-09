import dotenv from 'dotenv';

dotenv.config();

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
