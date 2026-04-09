import API from '../config/api';

/**
 * Admin service — admin dashboard and user management API calls
 * Backend bases: /api/dashboard, /api/auth/admin
 */
const adminService = {
  /**
   * Get admin dashboard summary data
   * GET /api/dashboard/admin
   */
  async getDashboardData() {
    const response = await API.get('/dashboard/admin');
    return response.data;
  },

  /**
   * Get extended analytics data
   * GET /api/dashboard/super-admin
   */
  async getSuperAdminDashboard() {
    const response = await API.get('/dashboard/super-admin');
    return response.data;
  },

  /**
   * Get all users (admin only)
   * GET /api/auth/users
   */
  async getUsers(params = {}) {
    const response = await API.get('/auth/users', { params });
    return response.data;
  },

  /**
   * Create doctor/lab/admin account
   * POST /api/auth/admin/create-user
   */
  async createUser(payload) {
    const response = await API.post('/auth/admin/create-user', payload);
    return response.data;
  },

  /**
   * Update user active status
   * PATCH /api/auth/admin/users/:userId/status
   */
  async updateUserStatus(userId, isActive) {
    const response = await API.patch(`/auth/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  /**
   * Update user profile fields
   * PATCH /api/auth/admin/users/:userId/profile
   */
  async updateUserProfile(userId, payload) {
    const response = await API.patch(`/auth/admin/users/${userId}/profile`, payload);
    return response.data;
  },

  /**
   * Get pending verifications (unverified doctors & labs)
   * GET /api/auth/admin/pending
   */
  async getPendingVerifications() {
    const response = await API.get('/auth/admin/pending');
    return response.data;
  },

  /**
   * Verify a doctor or lab account
   * PUT /api/auth/admin/verify/:userId
   * @param {string} userId
   */
  async verifyUser(userId) {
    const response = await API.put(`/auth/admin/verify/${userId}`);
    return response.data;
  },

  /**
   * Unverify a doctor or lab account
   * PUT /api/auth/admin/unverify/:userId
   * @param {string} userId
   */
  async unverifyUser(userId) {
    const response = await API.put(`/auth/admin/unverify/${userId}`);
    return response.data;
  },

  async getDoctorAvailability(doctorId) {
    const response = await API.get(`/availability/doctors/${doctorId}`);
    return response.data;
  },

  async updateDoctorAvailability(doctorId, payload) {
    const response = await API.put(`/availability/doctors/${doctorId}`, payload);
    return response.data;
  },
};

export default adminService;
