import API from '../config/api';

/**
 * Authentication service — handles all auth-related API calls
 */
const authService = {
  /**
   * List social auth providers and availability.
   * @param {string} intent - login | register
   */
  async getSocialProviders(intent = 'login') {
    const response = await API.get('/auth/oauth/providers', {
      params: { intent },
    });
    return response.data;
  },

  /**
   * Login user
    * @param {Object} data - { identifier, password }
   * @returns {Object} { success, message, data: { user, token, isVerified } }
   */
  async login(data) {
    const response = await API.post('/auth/login', data);
    return response.data;
  },

  /**
   * Check social auth provider availability/state.
   * @param {string} provider - google | github | facebook
   * @param {string} intent - login | register
   */
  async getSocialProviderStart(provider, intent = 'login') {
    const response = await API.get(`/auth/oauth/${provider}/start`, {
      params: { intent },
    });
    return response.data;
  },

  /**
   * Complete OAuth callback exchange.
   * @param {string} provider - google | github | facebook
   * @param {Object} data - { code, state }
   */
  async completeSocialProviderAuth(provider, data) {
    const response = await API.post(`/auth/oauth/${provider}/complete`, data);
    return response.data;
  },

  /**
    * Register new patient (public form)
    * @param {Object} data - { fullName, email, phone, password, confirmPassword, dob, gender, address }
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

  /**
   * Request password reset OTP
   * @param {Object} data - { email }
   */
  async forgotPassword(data) {
    const response = await API.post('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Verify password reset OTP
   * @param {Object} data - { email, otp }
   */
  async verifyResetOtp(data) {
    const response = await API.post('/auth/verify-reset-otp', data);
    return response.data;
  },

  /**
   * Reset password using OTP
   * @param {Object} data - { email, otp, newPassword, confirmPassword }
   */
  async resetPassword(data) {
    const response = await API.post('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Upload/update profile photo
   * @param {File} photoFile
   * @param {(progress: number) => void} onProgress
   */
  async uploadProfilePhoto(photoFile, onProgress) {
    const formData = new FormData();
    formData.append('photo', photoFile);

    const response = await API.put('/auth/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        const progress = Math.round((event.loaded * 100) / event.total);
        onProgress(progress);
      },
    });

    return response.data;
  },

  /**
   * Remove profile photo
   */
  async removeProfilePhoto() {
    const response = await API.delete('/auth/profile/photo');
    return response.data;
  },
};

export default authService;
