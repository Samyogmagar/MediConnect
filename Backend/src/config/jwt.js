import env from './env.js';

/**
 * JWT Configuration
 */
const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
  algorithm: 'HS256',
};

export default jwtConfig;
