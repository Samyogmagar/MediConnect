import API from '../config/api';

/**
 * Lab service — handles all laboratory-related API calls
 * Backend endpoints:
 *   Dashboard:    GET  /api/dashboard/lab
 *   Diagnostics:  GET  /api/diagnostics
 *   Completed:    GET  /api/diagnostics/completed
 *   Pending:      GET  /api/diagnostics/lab/pending
 *   Status:       PUT  /api/diagnostics/:id/status
 *   Report:       PUT  /api/diagnostics/:id/report
 *   Test by ID:   GET  /api/diagnostics/:id
 *   Profile:      GET  /api/auth/me
 *   Notifications: (see notificationService.js)
 */
const labService = {
  // ==================== DASHBOARD ====================

  /**
   * Get aggregated dashboard data for the lab
   */
  async getDashboardData() {
    const response = await API.get('/dashboard/lab');
    return response.data;
  },

  // ==================== DIAGNOSTIC TESTS ====================

  /**
   * Get all diagnostic tests assigned to this lab
   * @param {Object} filters - { status?, urgency?, testType? }
   */
  async getTests(filters = {}) {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.urgency) params.urgency = filters.urgency;
    if (filters.testType) params.testType = filters.testType;

    const response = await API.get('/diagnostics', { params });
    return response.data;
  },

  /**
   * Get a single diagnostic test by ID
   * @param {string} id
   */
  async getTestById(id) {
    const response = await API.get(`/diagnostics/${id}`);
    return response.data;
  },

  /**
   * Get completed tests with reports
   */
  async getCompletedTests() {
    const response = await API.get('/diagnostics/completed');
    return response.data;
  },

  /**
   * Get lab pending tests statistics
   */
  async getLabPendingStats() {
    const response = await API.get('/diagnostics/lab/pending');
    return response.data;
  },

  /**
  * Update test status (assigned -> sample_collected -> processing)
   * @param {string} id - Diagnostic test ID
  * @param {string} status - New status: 'sample_collected' | 'processing'
   * @param {string} notes - Optional notes
   */
  async updateTestStatus(id, status, notes = '') {
    const response = await API.put(`/diagnostics/${id}/status`, { status, notes });
    return response.data;
  },

  /**
  * Accept a test request (move from assigned -> sample_collected)
   * @param {string} id - Diagnostic test ID
   */
  async acceptTest(id) {
    return this.updateTestStatus(id, 'sample_collected', 'Sample collected');
  },

  /**
   * Reject/cancel a test request (mark as cancelled via status update)
   * @param {string} id - Diagnostic test ID
   * @param {string} reason - Rejection reason
   */
  async rejectTest(id, reason = '') {
    return this.updateTestStatus(id, 'cancelled', reason || 'Rejected by lab');
  },

  /**
   * Upload test report
   * @param {string} id - Diagnostic test ID
   * @param {Object} reportData - { filename, url, fileSize, mimeType, findings, recommendations, notes }
   */
  async uploadReport(id, reportData) {
    const response = await API.put(`/diagnostics/${id}/report`, reportData);
    return response.data;
  },

  /**
   * Submit a report with file and notes.
   * @param {string} testId - Diagnostic test ID
   * @param {File} file - The file to upload
   * @param {Object} payload - { notes?, findings?, recommendations? }
   */
  async submitReport(testId, file, payload = {}) {
    const formData = new FormData();
    formData.append('report', file);
    if (payload.notes) formData.append('notes', payload.notes);
    if (payload.findings) formData.append('findings', payload.findings);
    if (payload.recommendations) formData.append('recommendations', payload.recommendations);

    const response = await API.put(`/diagnostics/${testId}/report-file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ==================== PROFILE ====================

  /**
   * Get lab profile (current user info)
   */
  async getProfile() {
    const response = await API.get('/auth/me');
    return response.data;
  },
};

export default labService;
