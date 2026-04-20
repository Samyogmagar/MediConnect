import express from 'express';
import authController from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { profilePhotoUpload } from '../middlewares/profilePhotoUpload.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// ==================== PUBLIC ROUTES ====================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (patient, doctor, or lab)
 * @access  Public
 * @body    { name, email, password, confirmPassword, role?, professionalDetails?, phone?, address? }
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/oauth/providers
 * @desc    List social auth providers and availability state
 * @access  Public
 */
router.get('/oauth/providers', authController.getSocialProviders);

/**
 * @route   GET /api/auth/oauth/:provider/start
 * @desc    Get social auth provider availability (patient flow)
 * @access  Public
 */
router.get('/oauth/:provider/start', authController.getSocialProviderStart);

/**
 * @route   POST /api/auth/oauth/:provider/complete
 * @desc    Complete social auth flow with code + state (patient flow)
 * @access  Public
 */
router.post('/oauth/:provider/complete', authController.completeSocialProviderAuth);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset OTP
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/auth/verify-reset-otp
 * @desc    Verify password reset OTP
 * @access  Public
 * @body    { email, otp }
 */
router.post('/verify-reset-otp', authController.verifyResetOtp);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using email and OTP
 * @access  Public
 * @body    { email, otp, newPassword, confirmPassword }
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clears auth cookie)
 * @access  Public
 */
router.post('/logout', authController.logout);

// ==================== PROTECTED ROUTES ====================

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private (requires authentication)
 */
router.get('/me', authMiddleware, authController.me);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authMiddleware, authController.updateProfile);

/**
 * @route   PUT /api/auth/profile/photo
 * @desc    Upload/update user profile photo
 * @access  Private
 */
router.put(
  '/profile/photo',
  authMiddleware,
  profilePhotoUpload.single('photo'),
  authController.updateProfilePhoto
);

/**
 * @route   DELETE /api/auth/profile/photo
 * @desc    Remove user profile photo
 * @access  Private
 */
router.delete('/profile/photo', authMiddleware, authController.removeProfilePhoto);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authMiddleware, authController.changePassword);

/**
 * @route   GET /api/auth/doctors
 * @desc    Get all verified doctors (public for patient search)
 * @access  Public
 */
router.get('/doctors', authController.getVerifiedDoctors);

/**
 * @route   GET /api/auth/doctors/:id
 * @desc    Get a single doctor by ID
 * @access  Public
 */
router.get('/doctors/:id', authController.getDoctorById);

/**
 * @route   GET /api/auth/labs
 * @desc    Get all verified labs (for doctor lab-test assignment)
 * @access  Public
 */
router.get('/labs', authController.getVerifiedLabs);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/auth/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get(
  '/users',
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  authController.getAllUsers
);

/**
 * @route   POST /api/auth/admin/create
 * @desc    Create a new admin user
 * @access  Private (Admin only)
 * @body    { name, email, password, confirmPassword }
 */
router.post(
  '/admin/create',
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  authController.createAdmin
);

/**
 * @route   POST /api/auth/admin/create-user
 * @desc    Create doctor/lab/admin account
 * @access  Private (Admin only)
 */
router.post(
  '/admin/create-user',
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  authController.createStaffUser
);

/**
 * @route   GET /api/auth/admin/pending
 * @desc    Get all pending verification requests (doctors and labs)
 * @access  Private (Admin only)
 */
router.get(
  '/admin/pending',
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  authController.getPendingVerifications
);

/**
 * @route   PUT /api/auth/admin/verify/:userId
 * @desc    Verify a doctor or lab account
 * @access  Private (Admin only)
 * @params  userId - ID of the user to verify
 */
router.put(
  '/admin/verify/:userId',
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  authController.verifyUser
);

/**
 * @route   PUT /api/auth/admin/unverify/:userId
 * @desc    Unverify a doctor or lab account
 * @access  Private (Admin only)
 * @params  userId - ID of the user to unverify
 */
router.put(
  '/admin/unverify/:userId',
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  authController.unverifyUser
);

/**
 * @route   PATCH /api/auth/admin/users/:userId/status
 * @desc    Activate/deactivate user
 * @access  Private (Admin only)
 */
router.patch(
  '/admin/users/:userId/status',
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  authController.updateUserStatus
);

/**
 * @route   PATCH /api/auth/admin/users/:userId/profile
 * @desc    Update user profile fields
 * @access  Private (Admin only)
 */
router.patch(
  '/admin/users/:userId/profile',
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  authController.updateUserProfile
);

export default router;
