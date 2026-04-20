import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.model.js';
import { ROLES, VERIFICATION_REQUIRED_ROLES, PUBLIC_REGISTRATION_ROLES } from '../constants/roles.js';
import MESSAGES from '../constants/messages.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import { generateToken } from '../utils/token.util.js';
import { buildSearchRegex } from '../utils/search.util.js';
import notificationService from './notification.service.js';
import emailService from './email.service.js';
import env from '../config/env.js';

/**
 * Authentication Service
 * Contains all business logic for authentication operations
 */
class AuthService {
  _getSocialProviderConfigs() {
    return {
      google: {
        key: 'google',
        label: 'Google',
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        enabled: env.GOOGLE_AUTH_ENABLED,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        scopes: ['openid', 'email', 'profile'],
      },
      github: {
        key: 'github',
        label: 'GitHub',
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        enabled: env.GITHUB_AUTH_ENABLED,
        authUrl: 'https://github.com/login/oauth/authorize',
        scopes: ['read:user', 'user:email'],
      },
      facebook: {
        key: 'facebook',
        label: 'Facebook',
        clientId: env.FACEBOOK_CLIENT_ID,
        clientSecret: env.FACEBOOK_CLIENT_SECRET,
        enabled: env.FACEBOOK_AUTH_ENABLED,
        authUrl: 'https://www.facebook.com/v22.0/dialog/oauth',
        scopes: ['email', 'public_profile'],
      },
    };
  }

  _getProviderAvailability(config) {
    const missingFields = [];
    if (!config.clientId) missingFields.push('clientId');
    if (!config.clientSecret) missingFields.push('clientSecret');

    const configured = missingFields.length === 0;
    const enabled = Boolean(config.enabled && configured);

    let unavailableReason = '';
    if (!configured) {
      unavailableReason = MESSAGES.AUTH.SOCIAL_PROVIDER_NOT_CONFIGURED;
    } else if (!config.enabled) {
      unavailableReason = MESSAGES.AUTH.SOCIAL_PROVIDER_DISABLED;
    }

    return {
      configured,
      enabled,
      missingFields,
      unavailableReason,
    };
  }

  _getProviderConfig(provider) {
    const key = String(provider || '').trim().toLowerCase();
    const configs = this._getSocialProviderConfigs();

    const selected = configs[key];
    if (!selected) {
      throw { statusCode: 400, message: MESSAGES.AUTH.SOCIAL_PROVIDER_UNSUPPORTED };
    }

    const availability = this._getProviderAvailability(selected);

    if (!availability.configured) {
      throw {
        statusCode: 503,
        message: `${selected.label}: ${MESSAGES.AUTH.SOCIAL_PROVIDER_NOT_CONFIGURED}`,
      };
    }

    if (!selected.enabled) {
      throw {
        statusCode: 503,
        message: `${selected.label}: ${MESSAGES.AUTH.SOCIAL_PROVIDER_DISABLED}`,
      };
    }

    return selected;
  }

  _buildProviderCallbackUrl(provider) {
    // Use the same logic for all providers (frontend route)
    const normalizedFrontendUrl = String(env.FRONTEND_URL || '').trim().replace(/\/+$/, '');
    const rawCallbackPath = String(env.OAUTH_CALLBACK_PATH || '/auth/oauth/callback').trim();
    const normalizedCallbackPath = `/${rawCallbackPath.replace(/^\/+|\/+$/g, '')}`;
    const normalizedProvider = String(provider || '').trim().toLowerCase();
    return `${normalizedFrontendUrl}${normalizedCallbackPath}/${normalizedProvider}`;
  }

  _signSocialStateToken(payload) {
    return jwt.sign(
      {
        type: 'social_oauth_state',
        ...payload,
      },
      env.JWT_SECRET,
      {
        expiresIn: '10m',
        algorithm: 'HS256',
      }
    );
  }

  _verifySocialStateToken(token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
      if (decoded?.type !== 'social_oauth_state') {
        throw new Error('invalid_state_type');
      }
      return decoded;
    } catch {
      throw { statusCode: 400, message: MESSAGES.AUTH.SOCIAL_AUTH_STATE_INVALID };
    }
  }

  listSocialProviders(intent = 'login') {
    const normalizedIntent = intent === 'register' ? 'register' : 'login';
    const providers = Object.values(this._getSocialProviderConfigs()).map((config) => {
      const availability = this._getProviderAvailability(config);

      return {
        provider: config.key,
        label: config.label,
        intent: normalizedIntent,
        role: ROLES.PATIENT,
        callbackUrl: this._buildProviderCallbackUrl(config.key),
        configured: availability.configured,
        enabled: availability.enabled,
        missingFields: availability.missingFields,
        unavailableReason: availability.unavailableReason,
      };
    });

    return { providers };
  }

  getSocialProviderStart(provider, intent = 'login') {
    const selected = this._getProviderConfig(provider);
    const normalizedIntent = intent === 'register' ? 'register' : 'login';

    const callbackUrl = this._buildProviderCallbackUrl(selected.key);
    const state = this._signSocialStateToken({
      provider: selected.key,
      intent: normalizedIntent,
      nonce: crypto.randomBytes(12).toString('hex'),
    });

    const params = new URLSearchParams({
      client_id: selected.clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      state,
      scope: selected.scopes.join(' '),
    });

    if (selected.key === 'google') {
      params.set('access_type', 'online');
      params.set('include_granted_scopes', 'true');
      params.set('prompt', 'select_account');
    }

    if (selected.key === 'facebook') {
      params.set('display', 'popup');
    }

    const authUrl = `${selected.authUrl}?${params.toString()}`;

    return {
      provider: selected.key,
      intent: normalizedIntent,
      role: ROLES.PATIENT,
      configured: true,
      enabled: true,
      callbackUrl,
      authUrl,
      message: 'Provider is configured and ready for OAuth redirect.',
    };
  }

  async _exchangeCodeForTokens(config, code) {
    const redirectUri = this._buildProviderCallbackUrl(config.key);

    if (config.key === 'google') {
      const body = new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return tokenRes.data;
    }

    if (config.key === 'github') {
      const tokenRes = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: redirectUri,
        },
        {
          headers: { Accept: 'application/json' },
        }
      );
      return tokenRes.data;
    }

    if (config.key === 'facebook') {
      const tokenRes = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
        params: {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: redirectUri,
          code,
        },
      });
      return tokenRes.data;
    }

    throw { statusCode: 400, message: MESSAGES.AUTH.SOCIAL_PROVIDER_UNSUPPORTED };
  }

  async _fetchProviderUserProfile(config, accessToken) {
    if (config.key === 'google') {
      const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return {
        providerId: profileRes.data.id,
        email: profileRes.data.email,
        name: profileRes.data.name,
      };
    }

    if (config.key === 'github') {
      const profileRes = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      let resolvedEmail = profileRes.data.email;
      if (!resolvedEmail) {
        const emailsRes = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const primary = (emailsRes.data || []).find((item) => item.primary && item.verified);
        const fallback = (emailsRes.data || []).find((item) => item.verified);
        resolvedEmail = primary?.email || fallback?.email || '';
      }

      return {
        providerId: String(profileRes.data.id),
        email: resolvedEmail,
        name: profileRes.data.name || profileRes.data.login,
      };
    }

    if (config.key === 'facebook') {
      const profileRes = await axios.get('https://graph.facebook.com/me', {
        params: {
          fields: 'id,name,email',
          access_token: accessToken,
        },
      });

      return {
        providerId: profileRes.data.id,
        email: profileRes.data.email,
        name: profileRes.data.name,
      };
    }

    throw { statusCode: 400, message: MESSAGES.AUTH.SOCIAL_PROVIDER_UNSUPPORTED };
  }

  async _upsertPatientFromSocialProfile(config, profile) {
    const normalizedEmail = String(profile.email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw { statusCode: 400, message: MESSAGES.AUTH.SOCIAL_AUTH_EMAIL_REQUIRED };
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).select('+password');
    if (existingUser) {
      if (existingUser.role !== ROLES.PATIENT) {
        throw { statusCode: 409, message: MESSAGES.AUTH.SOCIAL_AUTH_ACCOUNT_ROLE_CONFLICT };
      }
      if (existingUser.isActive === false) {
        throw { statusCode: 403, message: MESSAGES.AUTH.INACTIVE_ACCOUNT };
      }

      existingUser.socialAuth = {
        ...(existingUser.socialAuth || {}),
        lastProvider: config.key,
        providers: {
          ...((existingUser.socialAuth && existingUser.socialAuth.providers) || {}),
          [config.key]: {
            id: profile.providerId,
            linkedAt: new Date(),
          },
        },
      };

      if (!existingUser.name && profile.name) {
        existingUser.name = profile.name;
      }

      await existingUser.save();
      return { user: existingUser, isNewUser: false };
    }

    const generatedPassword = crypto.randomBytes(24).toString('hex');
    const hashedPassword = await hashPassword(generatedPassword);

    const createdUser = await User.create({
      name: profile.name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: hashedPassword,
      role: ROLES.PATIENT,
      isVerified: true,
      socialAuth: {
        lastProvider: config.key,
        providers: {
          [config.key]: {
            id: profile.providerId,
            linkedAt: new Date(),
          },
        },
      },
    });

    return { user: createdUser, isNewUser: true };
  }

  async completeSocialProviderAuth(provider, payload = {}) {
    const { code, state } = payload;
    if (!code) {
      throw { statusCode: 400, message: MESSAGES.AUTH.SOCIAL_AUTH_CODE_REQUIRED };
    }
    if (!state) {
      throw { statusCode: 400, message: MESSAGES.AUTH.SOCIAL_AUTH_STATE_REQUIRED };
    }

    const statePayload = this._verifySocialStateToken(state);
    const config = this._getProviderConfig(provider);

    if (statePayload.provider !== config.key) {
      throw { statusCode: 400, message: MESSAGES.AUTH.SOCIAL_AUTH_STATE_INVALID };
    }

    try {
      const tokenData = await this._exchangeCodeForTokens(config, code);
      const accessToken = tokenData?.access_token;
      if (!accessToken) {
        throw new Error('missing_access_token');
      }

      const profile = await this._fetchProviderUserProfile(config, accessToken);
      const { user, isNewUser } = await this._upsertPatientFromSocialProfile(config, profile);
      const token = this._generateAuthToken(user);

      return {
        user: this._sanitizeUser(user),
        token,
        isNewUser,
        message: isNewUser ? MESSAGES.AUTH.REGISTER_SUCCESS : MESSAGES.AUTH.LOGIN_SUCCESS,
      };
    } catch (error) {
      if (error?.statusCode) {
        throw error;
      }
      throw { statusCode: 502, message: MESSAGES.AUTH.SOCIAL_AUTH_FAILED };
    }
  }

  _generateSixDigitOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  _passwordResetOtpExpiry() {
    return new Date(Date.now() + 10 * 60 * 1000);
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Registered user and token
   */
  async register(userData) {
    const {
      name,
      email,
      password,
      role = ROLES.PATIENT,
      professionalDetails,
      phone,
      address,
      dateOfBirth,
      gender,
    } = userData;

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
      phone,
      address,
      dateOfBirth,
      gender,
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
    const { identifier, password } = credentials;

    // Find user with password field
    const normalizedIdentifier = String(identifier || '').trim();
    const user = await User.findOne({
      $or: [
        { email: normalizedIdentifier.toLowerCase() },
        { phone: normalizedIdentifier },
      ],
    }).select('+password');
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
      const regex = buildSearchRegex(filters.search);
      if (regex) {
        query.$or = [{ name: regex }, { email: regex }];
      }
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
   * Update profile photo for user
   * @param {string} userId - User ID
   * @param {Object} file - Multer file object
   */
  async updateProfilePhoto(userId, file) {
    const user = await User.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    if (!file?.filename) {
      throw { statusCode: 400, message: 'Profile photo file is required' };
    }

    const previousPhoto = user.profileImageUrl;
    user.profileImageUrl = `/uploads/profile-images/${file.filename}`;
    await user.save();

    this._deleteLocalUploadIfSafe(previousPhoto);
    return this._sanitizeUser(user);
  }

  /**
   * Remove profile photo from user
   * @param {string} userId - User ID
   */
  async removeProfilePhoto(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const previousPhoto = user.profileImageUrl;
    user.profileImageUrl = '';
    await user.save();

    this._deleteLocalUploadIfSafe(previousPhoto);
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
   * Request password reset OTP by email
   * @param {string} email
   */
  async requestPasswordResetOtp(email) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const genericMessage = 'If an account exists with this email, an OTP has been sent.';

    if (!normalizedEmail) {
      throw { statusCode: 400, message: MESSAGES.VALIDATION.EMAIL_REQUIRED };
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordResetOtpHash +passwordResetOtpExpires');
    if (!user) {
      return { message: genericMessage };
    }

    const otp = this._generateSixDigitOtp();
    user.passwordResetOtpHash = await hashPassword(otp);
    user.passwordResetOtpExpires = this._passwordResetOtpExpiry();
    await user.save();

    await emailService.sendPasswordResetOtp({
      to: normalizedEmail,
      otp,
      appName: env.APP_NAME,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[PASSWORD_RESET_OTP] ${normalizedEmail}: ${otp}`);
      return { message: genericMessage, devOtp: otp };
    }

    return { message: genericMessage };
  }

  /**
   * Verify password reset OTP for an email
   * @param {string} email
   * @param {string} otp
   */
  async verifyPasswordResetOtp(email, otp) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedOtp = String(otp || '').trim();

    if (!normalizedEmail) {
      throw { statusCode: 400, message: MESSAGES.VALIDATION.EMAIL_REQUIRED };
    }
    if (!normalizedOtp) {
      throw { statusCode: 400, message: 'OTP is required' };
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordResetOtpHash +passwordResetOtpExpires');
    if (!user?.passwordResetOtpHash || !user?.passwordResetOtpExpires) {
      throw { statusCode: 400, message: 'OTP is invalid or expired' };
    }

    if (new Date(user.passwordResetOtpExpires).getTime() < Date.now()) {
      throw { statusCode: 400, message: 'OTP has expired. Please request a new one.' };
    }

    const isMatch = await comparePassword(normalizedOtp, user.passwordResetOtpHash);
    if (!isMatch) {
      throw { statusCode: 400, message: 'Invalid OTP' };
    }

    return { message: 'OTP verified successfully' };
  }

  /**
   * Reset password using email + OTP
   * @param {string} email
   * @param {string} otp
   * @param {string} newPassword
   */
  async resetPasswordWithOtp(email, otp, newPassword) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedOtp = String(otp || '').trim();

    if (!normalizedEmail) {
      throw { statusCode: 400, message: MESSAGES.VALIDATION.EMAIL_REQUIRED };
    }
    if (!normalizedOtp) {
      throw { statusCode: 400, message: 'OTP is required' };
    }
    if (!newPassword) {
      throw { statusCode: 400, message: MESSAGES.VALIDATION.PASSWORD_REQUIRED };
    }
    if (newPassword.length < 6) {
      throw { statusCode: 400, message: 'New password must be at least 6 characters' };
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      '+password +passwordResetOtpHash +passwordResetOtpExpires'
    );

    if (!user?.passwordResetOtpHash || !user?.passwordResetOtpExpires) {
      throw { statusCode: 400, message: 'OTP is invalid or expired' };
    }

    if (new Date(user.passwordResetOtpExpires).getTime() < Date.now()) {
      throw { statusCode: 400, message: 'OTP has expired. Please request a new one.' };
    }

    const isMatch = await comparePassword(normalizedOtp, user.passwordResetOtpHash);
    if (!isMatch) {
      throw { statusCode: 400, message: 'Invalid OTP' };
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
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

  /**
   * Delete only locally uploaded files under /uploads/profile-images.
   * Avoid deleting non-local or external URLs.
   * @private
   */
  _deleteLocalUploadIfSafe(sourceUrl) {
    if (!sourceUrl || typeof sourceUrl !== 'string') return;

    try {
      const marker = '/uploads/profile-images/';
      let relativePath = '';

      if (sourceUrl.startsWith(marker)) {
        relativePath = sourceUrl;
      } else {
        const parsed = new URL(sourceUrl);
        if (parsed.pathname.startsWith(marker)) {
          relativePath = parsed.pathname;
        }
      }

      if (!relativePath) return;

      const filePath = path.join(process.cwd(), relativePath.replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Best-effort cleanup; ignore malformed URLs or missing files.
    }
  }
}

export default new AuthService();
