import User from '../models/User.model.js';
import { ROLES, VERIFICATION_REQUIRED_ROLES, PUBLIC_REGISTRATION_ROLES } from '../constants/roles.js';
import MESSAGES from '../constants/messages.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import { generateToken } from '../utils/token.util.js';
import notificationService from './notification.service.js';

/**
 * Authentication Service
 * Contains all business logic for authentication operations
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Registered user and token
   */
  async register(userData) {
    const { name, email, password, role = ROLES.PATIENT, professionalDetails } = userData;

    // Check if admin role is being requested - admins cannot self-register
    if (role === ROLES.ADMIN) {
      throw { statusCode: 403, message: MESSAGES.ADMIN.CANNOT_SELF_REGISTER };
    }

    // Validate role for public registration
    if (!PUBLIC_REGISTRATION_ROLES.includes(role)) {
      throw { statusCode: 400, message: MESSAGES.VALIDATION.ROLE_INVALID };
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw { statusCode: 400, message: MESSAGES.USER.ALREADY_EXISTS };
    }

    // Validate professional details for doctors and labs
    if (VERIFICATION_REQUIRED_ROLES.includes(role)) {
      if (!professionalDetails || Object.keys(professionalDetails).length === 0) {
        throw { statusCode: 400, message: MESSAGES.VALIDATION.PROFESSIONAL_DETAILS_REQUIRED };
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Determine verification status
    const isVerified = !VERIFICATION_REQUIRED_ROLES.includes(role);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isVerified,
      professionalDetails: professionalDetails || {},
      phone: userData.phone,
      address: userData.address,
    });

    // Notify admin users when a new doctor/lab registers for verification.
    if (VERIFICATION_REQUIRED_ROLES.includes(role)) {
      await notificationService.notifyProfessionalRegistrationSubmitted(user);
    }

    // Generate token
    const token = this._generateAuthToken(user);

    return {
      user: this._sanitizeUser(user),
      token,
      message: isVerified ? MESSAGES.AUTH.REGISTER_SUCCESS : MESSAGES.AUTH.PENDING_VERIFICATION,
    };
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Object} User and token
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw { statusCode: 401, message: MESSAGES.AUTH.INVALID_CREDENTIALS };
    }

    if (user.isActive === false) {
      throw { statusCode: 403, message: MESSAGES.AUTH.INACTIVE_ACCOUNT };
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: MESSAGES.AUTH.INVALID_CREDENTIALS };
    }

    // Generate token
    const token = this._generateAuthToken(user);

    // Check if user needs verification (doctors and labs)
    const isPendingVerification = VERIFICATION_REQUIRED_ROLES.includes(user.role) && !user.isVerified;

    return {
      user: this._sanitizeUser(user),
      token,
      isVerified: user.isVerified,
      message: isPendingVerification ? MESSAGES.AUTH.PENDING_VERIFICATION : MESSAGES.AUTH.LOGIN_SUCCESS,
    };
  }

  /**
   * Create admin user (can only be called by existing admin)
   * @param {Object} adminData - Admin user data
   * @returns {Object} Created admin user
   */
  async createAdmin(adminData) {
    const { name, email, password } = adminData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw { statusCode: 400, message: MESSAGES.USER.ALREADY_EXISTS };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: ROLES.ADMIN,
      isVerified: true,
    });

    return {
      user: this._sanitizeUser(admin),
      message: MESSAGES.USER.CREATED,
    };
  }

  /**
   * Create a staff user (doctor, lab, or admin) by admin
   * @param {Object} staffData - User data
   * @returns {Object} Created user
   */
  async createStaffUser(staffData) {
    const { name, email, password, role, professionalDetails, phone, address } = staffData;

    if (!role || ![ROLES.DOCTOR, ROLES.LAB, ROLES.ADMIN].includes(role)) {
      throw { statusCode: 400, message: MESSAGES.VALIDATION.ROLE_INVALID };
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw { statusCode: 400, message: MESSAGES.USER.ALREADY_EXISTS };
    }

    if ([ROLES.DOCTOR, ROLES.LAB].includes(role) && (!professionalDetails || Object.keys(professionalDetails).length === 0)) {
      throw { statusCode: 400, message: MESSAGES.VALIDATION.PROFESSIONAL_DETAILS_REQUIRED };
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isVerified: true,
      isActive: true,
      professionalDetails: professionalDetails || {},
      phone,
      address,
    });

    return {
      user: this._sanitizeUser(user),
      message: MESSAGES.USER.CREATED,
    };
  }

  /**
   * Verify a doctor or lab account (admin only)
   * @param {string} userId - User ID to verify
   * @returns {Object} Updated user
   */
  async verifyUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: MESSAGES.USER.NOT_FOUND };
    }

    if (!VERIFICATION_REQUIRED_ROLES.includes(user.role)) {
      throw { statusCode: 400, message: 'Only doctors and labs require verification' };
    }

    if (user.isVerified) {
      throw { statusCode: 400, message: 'User is already verified' };
    }

    user.isVerified = true;
    await user.save();

    // Send notification to user
    await notificationService.notifyAccountVerified(user._id);

    return {
      user: this._sanitizeUser(user),
      message: MESSAGES.ADMIN.USER_VERIFIED,
    };
  }

  /**
   * Unverify a doctor or lab account (admin only)
   * @param {string} userId - User ID to unverify
   * @returns {Object} Updated user
   */
  async unverifyUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: MESSAGES.USER.NOT_FOUND };
    }

    if (!VERIFICATION_REQUIRED_ROLES.includes(user.role)) {
      throw { statusCode: 400, message: 'Only doctors and labs can be unverified' };
    }

    if (!user.isVerified) {
      throw { statusCode: 400, message: 'User is already unverified' };
    }

    user.isVerified = false;
    await user.save();

    return {
      user: this._sanitizeUser(user),
      message: 'User account unverified successfully',
    };
  }

  /**
   * Update user active status (admin only)
   * @param {string} userId
   * @param {boolean} isActive
   */
  async updateUserStatus(userId, isActive) {
    const user = await User.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: MESSAGES.USER.NOT_FOUND };
    }

    user.isActive = Boolean(isActive);
    await user.save();

    return {
      user: this._sanitizeUser(user),
      message: MESSAGES.USER.UPDATED,
    };
  }

  /**
   * Update user profile (admin only, non-sensitive fields)
   * @param {string} userId
   * @param {Object} updates
   */
  async updateUserProfile(userId, updates) {
    const user = await User.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: MESSAGES.USER.NOT_FOUND };
    }

    const allowed = ['name', 'phone', 'address', 'professionalDetails'];
    allowed.forEach((field) => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });

    await user.save();
    return {
      user: this._sanitizeUser(user),
      message: MESSAGES.USER.UPDATED,
    };
  }

  /**
   * Get all pending verification users (admin only)
   * @returns {Array} List of unverified users
   */
  async getPendingVerifications() {
    const users = await User.find({
      role: { $in: VERIFICATION_REQUIRED_ROLES },
      isVerified: false,
    }).select('-password');

    return users;
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Object} User object
   */
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: MESSAGES.USER.NOT_FOUND };
    }
    return this._sanitizeUser(user);
  }

  /**
   * Get all users
   * @returns {Array} Array of all users
   */
  async getAllUsers(filters = {}) {
    const query = {};
    if (filters.role) {
      query.role = filters.role;
    }
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }
    if (filters.isVerified !== undefined) {
      query.isVerified = filters.isVerified === 'true' || filters.isVerified === true;
    }
    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    return users.map(user => this._sanitizeUser(user));
  }

  /**
   * Get all verified doctors (for patient search)
   * @returns {Array} Array of verified doctors
   */
  async getVerifiedDoctors() {
    const doctors = await User.find({
      role: ROLES.DOCTOR,
      isVerified: true,
      isActive: { $ne: false },
    }).sort({ createdAt: -1 });
    return doctors.map(doctor => this._sanitizeUser(doctor));
  }

  /**
   * Get all verified labs (for doctor lab-test assignment)
   * @returns {Array} Array of verified labs
   */
  async getVerifiedLabs() {
    const labs = await User.find({
      role: ROLES.LAB,
      isVerified: true,
      isActive: { $ne: false },
    }).sort({ createdAt: -1 });
    return labs.map(lab => this._sanitizeUser(lab));
  }

  /**
   * Get a single doctor by ID
   * @param {string} doctorId - Doctor ID
   * @returns {Object} Doctor object
   */
  async getDoctorById(doctorId) {
    const doctor = await User.findOne({
      _id: doctorId,
      role: ROLES.DOCTOR,
      isVerified: true,
    });
    if (!doctor) {
      throw { statusCode: 404, message: 'Doctor not found or not verified' };
    }
    return this._sanitizeUser(doctor);
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile fields to update
   * @returns {Object} Updated user
   */
  async updateProfile(userId, updates) {
    const user = await User.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const allowedFields = [
      'name', 'phone', 'dateOfBirth', 'gender', 'bloodGroup',
      'address', 'emergencyContact', 'medicalHistory', 'allergies',
      'profileImageUrl', 'notificationPreferences', 'appearancePreference',
    ];

    // Allow doctors to update specific professional details (excluding licenseNumber)
    if (user.role === ROLES.DOCTOR && updates.professionalDetails) {
      const allowedProfessionalFields = [
        'specialization', 'qualifications', 'hospital', 'experience',
        'consultationFee', 'consultationDurationMinutes', 'bio'
      ];
      
      const professionalUpdates = {};
      allowedProfessionalFields.forEach((field) => {
        if (updates.professionalDetails[field] !== undefined) {
          professionalUpdates[field] = updates.professionalDetails[field];
        }
      });

      // Merge with existing professional details
      user.professionalDetails = {
        ...user.professionalDetails.toObject(),
        ...professionalUpdates
      };
    }

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });

    await user.save();
    return this._sanitizeUser(user);
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Success message
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw { statusCode: 400, message: 'Current password is incorrect' };
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Generate authentication token
   * @private
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  _generateAuthToken(user) {
    return generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });
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

export default new AuthService();
