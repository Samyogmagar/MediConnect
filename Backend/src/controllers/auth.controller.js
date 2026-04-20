import authService from '../services/auth.service.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.util.js';
import MESSAGES from '../constants/messages.js';
import { ROLES } from '../constants/roles.js';

/**
 * Auth Controller
 * Thin controller layer - delegates business logic to service
 */
class AuthController {
  /**
   * Get all social auth provider statuses (patient flow only).
   * GET /api/auth/oauth/providers
   */
  async getSocialProviders(req, res) {
    try {
      const { intent = 'login' } = req.query;
      const result = authService.listSocialProviders(intent);
      return successResponse(res, 200, 'Social providers retrieved', result);
    } catch (error) {
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get social auth provider start metadata (patient flow only).
   * GET /api/auth/oauth/:provider/start
   */
  async getSocialProviderStart(req, res) {
    try {
      const { provider } = req.params;
      const { intent = 'login' } = req.query;

      const result = authService.getSocialProviderStart(provider, intent);
      return successResponse(res, 200, 'Social provider available', result);
    } catch (error) {
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Complete social auth flow and issue app token.
   * POST /api/auth/oauth/:provider/complete
   */
  async completeSocialProviderAuth(req, res) {
    try {
      const { provider } = req.params;
      const { code, state } = req.body;

      const result = await authService.completeSocialProviderAuth(provider, { code, state });

      res.cookie('authToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, 200, result.message, {
        user: result.user,
        token: result.token,
        isVerified: result.user?.isVerified,
        isNewUser: Boolean(result.isNewUser),
      });
    } catch (error) {
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Register a new user (patient, doctor, or lab)
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { fullName, email, password, confirmPassword, phone, dob, gender, address } = req.body;

      // Basic validation
      const errors = [];
      if (!fullName) errors.push({ field: 'fullName', message: MESSAGES.VALIDATION.NAME_REQUIRED });
      if (!email) errors.push({ field: 'email', message: MESSAGES.VALIDATION.EMAIL_REQUIRED });
      if (!phone) errors.push({ field: 'phone', message: 'Phone number is required' });
      if (!password) errors.push({ field: 'password', message: MESSAGES.VALIDATION.PASSWORD_REQUIRED });
      if (!confirmPassword) errors.push({ field: 'confirmPassword', message: MESSAGES.VALIDATION.CONFIRM_PASSWORD_REQUIRED });
      if (password && confirmPassword && password !== confirmPassword) {
        errors.push({ field: 'confirmPassword', message: MESSAGES.VALIDATION.PASSWORDS_NOT_MATCH });
      }

      if (errors.length > 0) {
        return validationErrorResponse(res, 'Validation failed', errors);
      }

      const result = await authService.register({
        name: fullName,
        email,
        password,
        role: ROLES.PATIENT,
        phone,
        dateOfBirth: dob,
        gender,
        address,
      });

      // Set auth cookie
      res.cookie('authToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(res, 201, result.message, {
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error('Register error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, phone, identifier, password } = req.body;
      const loginIdentifier = identifier || email || phone;

      // Basic validation
      const errors = [];
      if (!loginIdentifier) errors.push({ field: 'identifier', message: 'Email or phone is required' });
      if (!password) errors.push({ field: 'password', message: MESSAGES.VALIDATION.PASSWORD_REQUIRED });

      if (errors.length > 0) {
        return validationErrorResponse(res, 'Validation failed', errors);
      }

      const result = await authService.login({ identifier: loginIdentifier, password });

      // Set auth cookie
      res.cookie('authToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(res, 200, result.message, {
        user: result.user,
        token: result.token,
        isVerified: result.isVerified,
      });
    } catch (error) {
      console.error('Login error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Request password reset OTP
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'email', message: MESSAGES.VALIDATION.EMAIL_REQUIRED },
        ]);
      }

      const result = await authService.requestPasswordResetOtp(email);
      return successResponse(res, 200, result.message, {
        ...(result.devOtp ? { devOtp: result.devOtp } : {}),
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Verify password reset OTP
   * POST /api/auth/verify-reset-otp
   */
  async verifyResetOtp(req, res) {
    try {
      const { email, otp } = req.body;
      const errors = [];
      if (!email) errors.push({ field: 'email', message: MESSAGES.VALIDATION.EMAIL_REQUIRED });
      if (!otp) errors.push({ field: 'otp', message: 'OTP is required' });

      if (errors.length > 0) {
        return validationErrorResponse(res, 'Validation failed', errors);
      }

      const result = await authService.verifyPasswordResetOtp(email, otp);
      return successResponse(res, 200, result.message);
    } catch (error) {
      console.error('Verify reset OTP error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Reset password with OTP
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword, confirmPassword } = req.body;
      const errors = [];

      if (!email) errors.push({ field: 'email', message: MESSAGES.VALIDATION.EMAIL_REQUIRED });
      if (!otp) errors.push({ field: 'otp', message: 'OTP is required' });
      if (!newPassword) {
        errors.push({ field: 'newPassword', message: MESSAGES.VALIDATION.PASSWORD_REQUIRED });
      }
      if (newPassword && newPassword.length < 6) {
        errors.push({ field: 'newPassword', message: 'New password must be at least 6 characters' });
      }
      if (!confirmPassword) {
        errors.push({ field: 'confirmPassword', message: MESSAGES.VALIDATION.CONFIRM_PASSWORD_REQUIRED });
      }
      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        errors.push({ field: 'confirmPassword', message: MESSAGES.VALIDATION.PASSWORDS_NOT_MATCH });
      }

      if (errors.length > 0) {
        return validationErrorResponse(res, 'Validation failed', errors);
      }

      const result = await authService.resetPasswordWithOtp(email, otp, newPassword);
      return successResponse(res, 200, result.message);
    } catch (error) {
      console.error('Reset password error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      res.clearCookie('authToken');
      return successResponse(res, 200, MESSAGES.AUTH.LOGOUT_SUCCESS);
    } catch (error) {
      console.error('Logout error:', error);
      return errorResponse(res, 500, MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  async me(req, res) {
    try {
      const user = await authService.getUserById(req.user.userId);
      return successResponse(res, 200, 'User retrieved successfully', { user });
    } catch (error) {
      console.error('Get current user error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Create admin user (admin only)
   * POST /api/auth/admin/create
   */
  async createAdmin(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      // Basic validation
      const errors = [];
      if (!name) errors.push({ field: 'name', message: MESSAGES.VALIDATION.NAME_REQUIRED });
      if (!email) errors.push({ field: 'email', message: MESSAGES.VALIDATION.EMAIL_REQUIRED });
      if (!password) errors.push({ field: 'password', message: MESSAGES.VALIDATION.PASSWORD_REQUIRED });
      if (!confirmPassword) errors.push({ field: 'confirmPassword', message: MESSAGES.VALIDATION.CONFIRM_PASSWORD_REQUIRED });
      if (password && confirmPassword && password !== confirmPassword) {
        errors.push({ field: 'confirmPassword', message: MESSAGES.VALIDATION.PASSWORDS_NOT_MATCH });
      }

      if (errors.length > 0) {
        return validationErrorResponse(res, 'Validation failed', errors);
      }

      const result = await authService.createAdmin({ name, email, password });

      return successResponse(res, 201, result.message, { user: result.user });
    } catch (error) {
      console.error('Create admin error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Create staff user (doctor, lab, admin) - admin only
   * POST /api/auth/admin/create-user
   */
  async createStaffUser(req, res) {
    try {
      const { name, email, password, confirmPassword, role, professionalDetails, phone, address } = req.body;

      const errors = [];
      if (!name) errors.push({ field: 'name', message: MESSAGES.VALIDATION.NAME_REQUIRED });
      if (!email) errors.push({ field: 'email', message: MESSAGES.VALIDATION.EMAIL_REQUIRED });
      if (!password) errors.push({ field: 'password', message: MESSAGES.VALIDATION.PASSWORD_REQUIRED });
      if (!confirmPassword) errors.push({ field: 'confirmPassword', message: MESSAGES.VALIDATION.CONFIRM_PASSWORD_REQUIRED });
      if (password && confirmPassword && password !== confirmPassword) {
        errors.push({ field: 'confirmPassword', message: MESSAGES.VALIDATION.PASSWORDS_NOT_MATCH });
      }
      if (!role) errors.push({ field: 'role', message: MESSAGES.VALIDATION.ROLE_REQUIRED });

      if (errors.length > 0) {
        return validationErrorResponse(res, 'Validation failed', errors);
      }

      const result = await authService.createStaffUser({
        name,
        email,
        password,
        role,
        professionalDetails,
        phone,
        address,
      });

      return successResponse(res, 201, result.message, { user: result.user });
    } catch (error) {
      console.error('Create staff user error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Verify a doctor or lab account (admin only)
   * PUT /api/auth/admin/verify/:userId
   */
  async verifyUser(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return errorResponse(res, 400, 'User ID is required');
      }

      const result = await authService.verifyUser(userId);

      return successResponse(res, 200, result.message, { user: result.user });
    } catch (error) {
      console.error('Verify user error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Unverify a doctor or lab account (admin only)
   * PUT /api/auth/admin/unverify/:userId
   */
  async unverifyUser(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return errorResponse(res, 400, 'User ID is required');
      }

      const result = await authService.unverifyUser(userId);

      return successResponse(res, 200, result.message, { user: result.user });
    } catch (error) {
      console.error('Unverify user error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get all pending verification requests (admin only)
   * GET /api/auth/admin/pending
   */
  async getPendingVerifications(req, res) {
    try {
      const users = await authService.getPendingVerifications();

      return successResponse(res, 200, 'Pending verifications retrieved', { users, count: users.length });
    } catch (error) {
      console.error('Get pending verifications error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get all users (admin only)
   * GET /api/auth/users
   */
  async getAllUsers(req, res) {
    try {
      const users = await authService.getAllUsers(req.query);

      return successResponse(res, 200, 'Users retrieved successfully', { users, count: users.length });
    } catch (error) {
      console.error('Get all users error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Update user active status (admin only)
   * PATCH /api/auth/admin/users/:userId/status
   */
  async updateUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'isActive', message: 'isActive is required' },
        ]);
      }

      const result = await authService.updateUserStatus(userId, isActive);
      return successResponse(res, 200, result.message, { user: result.user });
    } catch (error) {
      console.error('Update user status error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Update user profile (admin only)
   * PATCH /api/auth/admin/users/:userId/profile
   */
  async updateUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const { name, phone, address, professionalDetails } = req.body;

      const result = await authService.updateUserProfile(userId, {
        name,
        phone,
        address,
        professionalDetails,
      });

      return successResponse(res, 200, result.message, { user: result.user });
    } catch (error) {
      console.error('Update user profile error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get all verified doctors (for patient search)
   * GET /api/auth/doctors
   */
  async getVerifiedDoctors(req, res) {
    try {
      const doctors = await authService.getVerifiedDoctors();

      return successResponse(res, 200, 'Verified doctors retrieved successfully', { doctors, count: doctors.length });
    } catch (error) {
      console.error('Get verified doctors error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get all verified labs (for doctor lab-test assignment)
   * GET /api/auth/labs
   */
  async getVerifiedLabs(req, res) {
    try {
      const labs = await authService.getVerifiedLabs();
      return successResponse(res, 200, 'Verified labs retrieved successfully', { labs, count: labs.length });
    } catch (error) {
      console.error('Get verified labs error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get a single doctor by ID
   * GET /api/auth/doctors/:id
   */
  async getDoctorById(req, res) {
    try {
      const { id } = req.params;
      const doctor = await authService.getDoctorById(id);

      return successResponse(res, 200, 'Doctor retrieved successfully', { doctor });
    } catch (error) {
      console.error('Get doctor by ID error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  async updateProfile(req, res) {
    try {
      const user = await authService.updateProfile(req.user.userId, req.body);
      return successResponse(res, 200, 'Profile updated successfully', { user });
    } catch (error) {
      console.error('Update profile error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Update profile photo
   * PUT /api/auth/profile/photo
   */
  async updateProfilePhoto(req, res) {
    try {
      if (!req.file) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'photo', message: 'Profile photo file is required' },
        ]);
      }

      const user = await authService.updateProfilePhoto(req.user.userId, req.file);
      return successResponse(res, 200, 'Profile photo updated successfully', { user });
    } catch (error) {
      console.error('Update profile photo error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Remove profile photo
   * DELETE /api/auth/profile/photo
   */
  async removeProfilePhoto(req, res) {
    try {
      const user = await authService.removeProfilePhoto(req.user.userId);
      return successResponse(res, 200, 'Profile photo removed successfully', { user });
    } catch (error) {
      console.error('Remove profile photo error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Change password
   * PUT /api/auth/change-password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'password', message: 'Current and new password are required' },
        ]);
      }
      if (newPassword.length < 6) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'newPassword', message: 'New password must be at least 6 characters' },
        ]);
      }
      const result = await authService.changePassword(req.user.userId, currentPassword, newPassword);
      return successResponse(res, 200, result.message);
    } catch (error) {
      console.error('Change password error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }
}

export default new AuthController();
