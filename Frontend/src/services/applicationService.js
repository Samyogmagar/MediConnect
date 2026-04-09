import API from '../config/api';

/**
 * Application service — handles role application API calls for admin
 * Backend base: /api/role-applications
 */
const applicationService = {
  /**
   * Get all applications (admin sees all, filterable)
   * GET /api/role-applications
   * @param {Object} params - { status?, requestedRole? }
   */
  async getApplications(params = {}) {
    const response = await API.get('/role-applications', { params });
    return response.data;
  },

  /**
   * Get a single application by ID
   * GET /api/role-applications/:id
   * @param {string} id
   */
  async getApplicationById(id) {
    const response = await API.get(`/role-applications/${id}`);
    return response.data;
  },

  /**
   * Approve an application
   * PUT /api/role-applications/:id/approve
   * @param {string} id
   */
  async approveApplication(id) {
    const response = await API.put(`/role-applications/${id}/approve`);
    return response.data;
  },

  /**
   * Reject an application
   * PUT /api/role-applications/:id/reject
   * @param {string} id
   * @param {string} rejectionReason
   */
  async rejectApplication(id, rejectionReason) {
    const response = await API.put(`/role-applications/${id}/reject`, { rejectionReason });
    return response.data;
  },

  /**
   * Get pending application counts
   * GET /api/role-applications/statistics/pending
   */
  async getPendingCount() {
    const response = await API.get('/role-applications/statistics/pending');
    return response.data;
  },
};

export default applicationService;
