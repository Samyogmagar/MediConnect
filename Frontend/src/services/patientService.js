import API from '../config/api';

/**
 * Patient service — patient-specific API calls
 * Backend bases: /api/dashboard/patient, /api/medications
 */
const patientService = {
  /**
   * Get patient dashboard summary data
   * GET /api/dashboard/patient
   */
  async getDashboardData() {
    const response = await API.get('/dashboard/patient');
    return response.data;
  },

  /**
   * Acknowledge a medication reminder (mark as taken)
   * PUT /api/medications/reminders/:id/acknowledge
   * @param {string} reminderId
   */
  async acknowledgeReminder(reminderId) {
    const response = await API.put(`/medications/reminders/${reminderId}/acknowledge`);
    return response.data;
  },

  /**
   * Get medication adherence statistics
   * GET /api/medications/adherence
   * @param {Object} params - { patientId?, days? }
   */
  async getAdherenceStats(params = {}) {
    const response = await API.get('/medications/adherence', { params });
    return response.data;
  },

  /**
   * Get medication reminders for a date range
   * GET /api/medications/reminders
   * @param {Object} params - { startDate?, endDate? }
   */
  async getReminders(params = {}) {
    const response = await API.get('/medications/reminders', { params });
    return response.data;
  },
};

export default patientService;
