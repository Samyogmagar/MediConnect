import API from '../config/api';

/**
 * Authentication service — handles all auth-related API calls
 */
const authService = {
  /**
   * Login user
   * @param {Object} data - { email, password }
   * @returns {Object} { success, message, data: { user, token, isVerified } }
   */
  async login(data) {
    const response = await API.post('/auth/login', data);
    return response.data;
  },

  /**
   * Register new user (patient only from public form)
   * @param {Object} data - { name, email, password, confirmPassword }
   * @returns {Object} { success, message, data: { user, token } }
   */
  async register(data) {
    const response = await API.post('/auth/register', data);
    return response.data;
  },

  /**
   * Logout user
   * @returns {Object} { success, message }
   */
  async logout() {
    const response = await API.post('/auth/logout');
    return response.data;
  },

  /**
   * Get current authenticated user
   * @returns {Object} { success, message, data: { user } }
   */
  async getMe() {
    const response = await API.get('/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} data - Profile fields to update
   */
  async updateProfile(data) {
    const response = await API.put('/auth/profile', data);
    return response.data;
  },

  /**
   * Change user password
   * @param {Object} data - { currentPassword, newPassword }
   */
  async changePassword(data) {
    const response = await API.put('/auth/change-password', data);
    return response.data;
  },
};

export default authService;
