import {
  getPatientDashboard,
  getDoctorDashboard,
  getLabDashboard,
  getAdminDashboard,
  getSuperAdminDashboard,
} from '../services/dashboard.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

/**
 * GET /api/dashboard/patient
 * Returns aggregated dashboard data for the authenticated patient
 */
export const patientDashboard = async (req, res) => {
  try {
    const data = await getPatientDashboard(req.user.userId);
    return successResponse(res, 200, 'Patient dashboard data retrieved', data);
  } catch (error) {
    console.error('Patient dashboard error:', error);
    return errorResponse(res, 500, 'Failed to load patient dashboard');
  }
};

/**
 * GET /api/dashboard/doctor
 * Returns aggregated dashboard data for the authenticated doctor
 */
export const doctorDashboard = async (req, res) => {
  try {
    const data = await getDoctorDashboard(req.user.userId);
    return successResponse(res, 200, 'Doctor dashboard data retrieved', data);
  } catch (error) {
    console.error('Doctor dashboard error:', error);
    return errorResponse(res, 500, 'Failed to load doctor dashboard');
  }
};

/**
 * GET /api/dashboard/lab
 * Returns aggregated dashboard data for the authenticated lab
 */
export const labDashboard = async (req, res) => {
  try {
    const data = await getLabDashboard(req.user.userId);
    return successResponse(res, 200, 'Lab dashboard data retrieved', data);
  } catch (error) {
    console.error('Lab dashboard error:', error);
    return errorResponse(res, 500, 'Failed to load lab dashboard');
  }
};

/**
 * GET /api/dashboard/admin
 * Returns aggregated dashboard data for admin users
 */
export const adminDashboard = async (req, res) => {
  try {
    const data = await getAdminDashboard();
    return successResponse(res, 200, 'Admin dashboard data retrieved', data);
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return errorResponse(res, 500, 'Failed to load admin dashboard');
  }
};

/**
 * GET /api/dashboard/super-admin
 * Returns extended system-wide metrics for super admin
 */
export const superAdminDashboard = async (req, res) => {
  try {
    const data = await getSuperAdminDashboard();
    return successResponse(res, 200, 'Super admin dashboard data retrieved', data);
  } catch (error) {
    console.error('Super admin dashboard error:', error);
    return errorResponse(res, 500, 'Failed to load super admin dashboard');
  }
};

export default {
  patientDashboard,
  doctorDashboard,
  labDashboard,
  adminDashboard,
  superAdminDashboard,
};
