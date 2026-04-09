import { verifyToken } from '../utils/token.util.js';
import { unauthorizedResponse } from '../utils/response.util.js';
import MESSAGES from '../constants/messages.js';
import User from '../models/User.model.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header or cookie
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }

    if (!token) {
      return unauthorizedResponse(res, MESSAGES.AUTH.TOKEN_REQUIRED);
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return unauthorizedResponse(res, MESSAGES.AUTH.TOKEN_EXPIRED);
      }
      return unauthorizedResponse(res, MESSAGES.AUTH.TOKEN_INVALID);
    }

    // Verify user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return unauthorizedResponse(res, MESSAGES.USER.NOT_FOUND);
    }

    if (user.isActive === false) {
      return unauthorizedResponse(res, MESSAGES.AUTH.INACTIVE_ACCOUNT);
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isVerified: user.isVerified, // Get fresh verification status from DB
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return unauthorizedResponse(res, MESSAGES.AUTH.UNAUTHORIZED);
  }
};

export default authMiddleware;
