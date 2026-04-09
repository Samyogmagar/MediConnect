import { forbiddenResponse } from '../utils/response.util.js';
import MESSAGES from '../constants/messages.js';
import { VERIFICATION_REQUIRED_ROLES } from '../constants/roles.js';

/**
 * Verification Middleware
 * Blocks unverified doctors and labs from accessing protected clinical resources
 * 
 * This middleware should be used AFTER authMiddleware and roleMiddleware
 * to ensure req.user is populated
 * 
 * @example
 * // Protect clinical routes that require verification
 * router.get('/appointments', 
 *   authMiddleware, 
 *   roleMiddleware(['doctor', 'lab']), 
 *   verificationMiddleware, 
 *   appointmentController.list
 * );
 */
const verificationMiddleware = (req, res, next) => {
  // Ensure user is authenticated
  if (!req.user) {
    return forbiddenResponse(res, MESSAGES.AUTHORIZATION.ACCESS_DENIED);
  }

  const { role, isVerified } = req.user;

  // Check if the user's role requires verification
  if (VERIFICATION_REQUIRED_ROLES.includes(role)) {
    // If the user is not verified, block access
    if (!isVerified) {
      return forbiddenResponse(res, MESSAGES.AUTHORIZATION.UNVERIFIED_ACCOUNT);
    }
  }

  // User is verified or doesn't require verification (patients, admins)
  next();
};

/**
 * Optional verification check that doesn't block
 * Just adds verification status info to request
 */
export const checkVerification = (req, res, next) => {
  if (req.user) {
    const { role, isVerified } = req.user;
    req.user.requiresVerification = VERIFICATION_REQUIRED_ROLES.includes(role);
    req.user.canAccessClinicalRoutes = !VERIFICATION_REQUIRED_ROLES.includes(role) || isVerified;
  }
  next();
};

export default verificationMiddleware;
