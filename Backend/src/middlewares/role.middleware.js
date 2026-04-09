import { forbiddenResponse } from '../utils/response.util.js';
import MESSAGES from '../constants/messages.js';

/**
 * Role-Based Access Control Middleware
 * Restricts access based on user roles
 * 
 * @param {string[]} allowedRoles - Array of roles that can access the route
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Allow only admins
 * router.get('/admin', authMiddleware, roleMiddleware(['admin']), adminController.dashboard);
 * 
 * // Allow doctors and admins
 * router.get('/patients', authMiddleware, roleMiddleware(['doctor', 'admin']), patientController.list);
 */
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
      return forbiddenResponse(res, MESSAGES.AUTHORIZATION.ACCESS_DENIED);
    }

    const userRole = req.user.role;

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(userRole)) {
      return forbiddenResponse(res, MESSAGES.AUTHORIZATION.INSUFFICIENT_PERMISSIONS);
    }

    next();
  };
};

/**
 * Admin-only middleware shorthand
 */
export const adminOnly = roleMiddleware(['admin']);

/**
 * Doctor-only middleware shorthand
 */
export const doctorOnly = roleMiddleware(['doctor']);

/**
 * Lab-only middleware shorthand
 */
export const labOnly = roleMiddleware(['lab']);

/**
 * Patient-only middleware shorthand
 */
export const patientOnly = roleMiddleware(['patient']);

/**
 * Clinical staff middleware (doctors and labs)
 */
export const clinicalStaff = roleMiddleware(['doctor', 'lab']);

/**
 * Healthcare providers middleware (doctors, labs, and admins)
 */
export const healthcareProviders = roleMiddleware(['doctor', 'lab', 'admin']);

export default roleMiddleware;
