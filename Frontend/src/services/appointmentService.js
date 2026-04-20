import API from '../config/api';

/**
 * Appointment service — handles all appointment-related API calls
 * Backend base: /api/appointments
 */
const appointmentService = {
  /**
   * Initiate Khalti payment for appointment booking.
   * @param {Object} data - { doctorId, dateTime, reason, paymentAmount }
   */
  async initiateKhaltiPayment(data) {
    const response = await API.post('/appointments/payments/khalti/initiate', data);
    return response.data;
  },

  /**
   * Get all appointments for current user (role-filtered by backend)
   * @param {Object} filters - { status?, dateFrom?, dateTo? }
   */
  async getAppointments(filters = {}) {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;

    const response = await API.get('/appointments', { params });
    return response.data;
  },

  /**
   * Get a single appointment by ID
   * @param {string} id
   */
  async getAppointmentById(id) {
    const response = await API.get(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Create a new appointment (Patient only)
    * @param {Object} data - { doctorId, dateTime, reason, notes?, paymentMethod, paymentAmount, khaltiPidx?, followUpOf? }
   */
  async createAppointment(data) {
    const response = await API.post('/appointments', data);
    return response.data;
  },

  /**
   * Cancel an appointment (Patient only, pending appointments)
   * @param {string} id
   */
  async cancelAppointment(id) {
    const response = await API.put(`/appointments/${id}/cancel`);
    return response.data;
  },

  /**
   * Reschedule an appointment (Patient only, pending appointments)
   * @param {string} id
   * @param {Object} data - { dateTime, reason?, notes? }
   */
  async rescheduleAppointment(id, data) {
    const response = await API.put(`/appointments/${id}/reschedule`, data);
    return response.data;
  },
};

export default appointmentService;
