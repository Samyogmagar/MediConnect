import roleApplicationService from '../services/roleApplication.service.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.util.js';
import MESSAGES from '../constants/messages.js';

/**
 * Role Application Controller
 * Thin controller layer - delegates business logic to service
 */
class RoleApplicationController {
  /**
   * Submit a role application (Patient only)
   * POST /api/role-applications
   */
  async submitApplication(req, res) {
    try {
      const { requestedRole, professionalDetails, documents } = req.body;

      // Validation
      const errors = [];
      if (!requestedRole) errors.push({ field: 'requestedRole', message: MESSAGES.ROLE_APPLICATION.ROLE_REQUIRED });
      if (!professionalDetails || Object.keys(professionalDetails).length === 0) {
        errors.push({ field: 'professionalDetails', message: MESSAGES.ROLE_APPLICATION.DETAILS_REQUIRED });
      }

      if (errors.length > 0) {
        return validationErrorResponse(res, 'Validation failed', errors);
      }

      const application = await roleApplicationService.submitApplication(
        { requestedRole, professionalDetails, documents },
        req.user.userId
      );

      return successResponse(res, 201, MESSAGES.ROLE_APPLICATION.SUBMITTED, { application });
    } catch (error) {
      console.error('Submit application error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get all applications
   * GET /api/role-applications
   */
  async getApplications(req, res) {
    try {
      const { status, requestedRole } = req.query;
      const filters = { status, requestedRole };

      const applications = await roleApplicationService.getApplications(
        filters,
        req.user.role,
        req.user.userId
      );

      return successResponse(res, 200, 'Applications retrieved successfully', {
        applications,
        count: applications.length,
      });
    } catch (error) {
      console.error('Get applications error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get application by ID
   * GET /api/role-applications/:id
   */
  async getApplicationById(req, res) {
    try {
      const { id } = req.params;

      const application = await roleApplicationService.getApplicationById(
        id,
        req.user.userId,
        req.user.role
      );

      return successResponse(res, 200, 'Application retrieved successfully', { application });
    } catch (error) {
      console.error('Get application error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Update application (Patient only)
   * PUT /api/role-applications/:id
   */
  async updateApplication(req, res) {
    try {
      const { id } = req.params;
      const { professionalDetails, documents } = req.body;

      const application = await roleApplicationService.updateApplication(
        id,
        req.user.userId,
        { professionalDetails, documents }
      );

      return successResponse(res, 200, MESSAGES.ROLE_APPLICATION.UPDATED, { application });
    } catch (error) {
      console.error('Update application error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Approve application (Admin only)
   * PUT /api/role-applications/:id/approve
   */
  async approveApplication(req, res) {
    try {
      const { id } = req.params;

      const result = await roleApplicationService.approveApplication(id, req.user.userId);

      return successResponse(res, 200, MESSAGES.ROLE_APPLICATION.APPROVED, result);
    } catch (error) {
      console.error('Approve application error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Reject application (Admin only)
   * PUT /api/role-applications/:id/reject
   */
  async rejectApplication(req, res) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'rejectionReason', message: MESSAGES.ROLE_APPLICATION.REJECTION_REASON_REQUIRED },
        ]);
      }

      const application = await roleApplicationService.rejectApplication(
        id,
        req.user.userId,
        rejectionReason
      );

      return successResponse(res, 200, MESSAGES.ROLE_APPLICATION.REJECTED, { application });
    } catch (error) {
      console.error('Reject application error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get pending applications count (Admin dashboard)
   * GET /api/role-applications/statistics/pending
   */
  async getPendingCount(req, res) {
    try {
      const count = await roleApplicationService.getPendingCount();

      return successResponse(res, 200, 'Pending count retrieved successfully', { count });
    } catch (error) {
      console.error('Get pending count error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Delete application (Patient only)
   * DELETE /api/role-applications/:id
   */
  async deleteApplication(req, res) {
    try {
      const { id } = req.params;

      await roleApplicationService.deleteApplication(id, req.user.userId);

      return successResponse(res, 200, 'Application deleted successfully');
    } catch (error) {
      console.error('Delete application error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }
}

export default new RoleApplicationController();
