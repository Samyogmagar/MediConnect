import RoleApplication from '../models/RoleApplication.model.js';
import User from '../models/User.model.js';
import { ROLES } from '../constants/roles.js';
import MESSAGES from '../constants/messages.js';
import notificationService from './notification.service.js';

/**
 * Role Application Service
 * Contains all business logic for professional role applications
 */
class RoleApplicationService {
  /**
   * Submit a role application (Patient only)
   * @param {Object} applicationData - Application data
   * @param {string} userId - User ID
   * @returns {Object} Created application
   */
  async submitApplication(applicationData, userId) {
    const { requestedRole, professionalDetails, documents } = applicationData;

    // Verify user exists and is a patient
    const user = await User.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: MESSAGES.USER.NOT_FOUND };
    }

    if (user.role !== ROLES.PATIENT) {
      throw { statusCode: 403, message: MESSAGES.ROLE_APPLICATION.PATIENT_ONLY };
    }

    // Validate requested role
    if (!['doctor', 'lab'].includes(requestedRole)) {
      throw { statusCode: 400, message: MESSAGES.ROLE_APPLICATION.INVALID_ROLE };
    }

    // Validate professional details
    if (!professionalDetails || Object.keys(professionalDetails).length === 0) {
      throw { statusCode: 400, message: MESSAGES.ROLE_APPLICATION.DETAILS_REQUIRED };
    }

    // Check for existing pending application
    const existingApplication = await RoleApplication.findOne({
      userId,
      status: 'pending',
    });

    if (existingApplication) {
      throw { statusCode: 409, message: MESSAGES.ROLE_APPLICATION.ALREADY_EXISTS };
    }

    // Create application
    const application = await RoleApplication.create({
      userId,
      requestedRole,
      professionalDetails,
      documents: documents || [],
      status: 'pending',
      submittedAt: new Date(),
    });

    await application.populate('userId', 'name email');

    return application;
  }

  /**
   * Get all applications (with filters)
   * @param {Object} filters - Optional filters
   * @param {string} userRole - User role (for access control)
   * @param {string} userId - User ID (for patient filtering)
   * @returns {Array} List of applications
   */
  async getApplications(filters = {}, userRole, userId) {
    let query = {};

    // If patient, only show their own applications
    if (userRole === ROLES.PATIENT) {
      query.userId = userId;
    }
    // Admin can see all applications (no additional filter)

    // Apply status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Apply role filter
    if (filters.requestedRole) {
      query.requestedRole = filters.requestedRole;
    }

    const applications = await RoleApplication.find(query)
      .populate('userId', 'name email phone')
      .populate('reviewedBy', 'name email')
      .sort({ submittedAt: -1 });

    return applications;
  }

  /**
   * Get application by ID with access control
   * @param {string} applicationId - Application ID
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @returns {Object} Application
   */
  async getApplicationById(applicationId, userId, role) {
    const application = await RoleApplication.findById(applicationId)
      .populate('userId', 'name email phone')
      .populate('reviewedBy', 'name email');

    if (!application) {
      throw { statusCode: 404, message: MESSAGES.ROLE_APPLICATION.NOT_FOUND };
    }

    // Access control: patients can only view their own
    if (role === ROLES.PATIENT && application.userId._id.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.AUTHORIZATION.ACCESS_DENIED };
    }

    return application;
  }

  /**
   * Update application (Patient only, only pending applications)
   * @param {string} applicationId - Application ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Updated data
   * @returns {Object} Updated application
   */
  async updateApplication(applicationId, userId, updateData) {
    const application = await RoleApplication.findById(applicationId);

    if (!application) {
      throw { statusCode: 404, message: MESSAGES.ROLE_APPLICATION.NOT_FOUND };
    }

    // Only owner can update
    if (application.userId.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.AUTHORIZATION.ACCESS_DENIED };
    }

    // Only pending applications can be updated
    if (application.status !== 'pending') {
      throw { statusCode: 400, message: MESSAGES.ROLE_APPLICATION.CANNOT_MODIFY };
    }

    // Update fields
    if (updateData.professionalDetails) {
      application.professionalDetails = {
        ...application.professionalDetails,
        ...updateData.professionalDetails,
      };
    }

    if (updateData.documents) {
      application.documents = updateData.documents;
    }

    await application.save();
    await application.populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'reviewedBy', select: 'name email' },
    ]);

    return application;
  }

  /**
   * Approve application (Admin only)
   * @param {string} applicationId - Application ID
   * @param {string} adminId - Admin user ID
   * @returns {Object} Approved application and updated user
   */
  async approveApplication(applicationId, adminId) {
    const application = await RoleApplication.findById(applicationId).populate('userId');

    if (!application) {
      throw { statusCode: 404, message: MESSAGES.ROLE_APPLICATION.NOT_FOUND };
    }

    // Only pending applications can be approved
    if (application.status !== 'pending') {
      throw { statusCode: 400, message: 'Only pending applications can be approved' };
    }

    const user = await User.findById(application.userId._id);
    if (!user) {
      throw { statusCode: 404, message: MESSAGES.USER.NOT_FOUND };
    }

    // Check if user already has a professional role
    if (user.role !== ROLES.PATIENT) {
      throw { statusCode: 400, message: MESSAGES.ROLE_APPLICATION.USER_ALREADY_PROFESSIONAL };
    }

    // Update application status
    application.status = 'approved';
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    // Update user role and details
    user.role = application.requestedRole;
    user.isVerified = true; // Automatically verify on approval
    user.professionalDetails = {
      ...user.professionalDetails,
      ...application.professionalDetails,
    };
    await user.save();

    await application.populate([
      { path: 'userId', select: 'name email role isVerified' },
      { path: 'reviewedBy', select: 'name email' },
    ]);

    // Send notification to user
    await notificationService.notifyRoleApplicationApproved(
      application.userId._id,
      application.requestedRole
    );

    return {
      application,
      user: this._sanitizeUser(user),
    };
  }

  /**
   * Reject application (Admin only)
   * @param {string} applicationId - Application ID
   * @param {string} adminId - Admin user ID
   * @param {string} rejectionReason - Reason for rejection
   * @returns {Object} Rejected application
   */
  async rejectApplication(applicationId, adminId, rejectionReason) {
    const application = await RoleApplication.findById(applicationId);

    if (!application) {
      throw { statusCode: 404, message: MESSAGES.ROLE_APPLICATION.NOT_FOUND };
    }

    // Only pending applications can be rejected
    if (application.status !== 'pending') {
      throw { statusCode: 400, message: 'Only pending applications can be rejected' };
    }

    application.status = 'rejected';
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    application.rejectionReason = rejectionReason;

    await application.save();
    await application.populate([
      { path: 'userId', select: 'name email' },
      { path: 'reviewedBy', select: 'name email' },
    ]);

    // Send notification to user
    await notificationService.notifyRoleApplicationRejected(
      application.userId._id,
      application.requestedRole,
      rejectionReason
    );

    return application;
  }

  /**
   * Get pending applications count (Admin dashboard)
   * @returns {Object} Count by role
   */
  async getPendingCount() {
    const doctorCount = await RoleApplication.countDocuments({
      requestedRole: 'doctor',
      status: 'pending',
    });

    const labCount = await RoleApplication.countDocuments({
      requestedRole: 'lab',
      status: 'pending',
    });

    return {
      total: doctorCount + labCount,
      doctor: doctorCount,
      lab: labCount,
    };
  }

  /**
   * Delete application (Patient only, only pending applications)
   * @param {string} applicationId - Application ID
   * @param {string} userId - User ID
   * @returns {Object} Deleted application
   */
  async deleteApplication(applicationId, userId) {
    const application = await RoleApplication.findById(applicationId);

    if (!application) {
      throw { statusCode: 404, message: MESSAGES.ROLE_APPLICATION.NOT_FOUND };
    }

    // Only owner can delete
    if (application.userId.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.AUTHORIZATION.ACCESS_DENIED };
    }

    // Only pending applications can be deleted
    if (application.status !== 'pending') {
      throw { statusCode: 400, message: MESSAGES.ROLE_APPLICATION.CANNOT_MODIFY };
    }

    await RoleApplication.findByIdAndDelete(applicationId);

    return application;
  }

  /**
   * Sanitize user object for response
   * @private
   * @param {Object} user - User object
   * @returns {Object} Sanitized user
   */
  _sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : user;
    const { password, __v, ...sanitizedUser } = userObj;
    return sanitizedUser;
  }
}

export default new RoleApplicationService();
