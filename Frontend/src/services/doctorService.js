import API from '../config/api';

/**
 * Doctor service
 * - Patient-facing: search/view doctors
 * - Doctor-role: dashboard, appointments, patients, prescriptions
 */
const doctorService = {
  // ==================== PATIENT-FACING APIS ====================
  
  /**
   * Get all verified doctors (for patient booking)
   * @param {Object} filters - { search?, specialization? }
   */
  async getDoctors(filters = {}) {
    const params = {
      role: 'doctor',
      isVerified: true,
    };
    if (filters.search) params.search = filters.search;
    if (filters.specialization) params.specialization = filters.specialization;

    const response = await API.get('/auth/doctors', { params });
    return response.data;
  },

  /**
   * Get a single doctor by ID (for patient booking)
   * @param {string} id
   */
  async getDoctorById(id) {
    const response = await API.get(`/auth/doctors/${id}`);
    return response.data;
  },

  async getDoctorAvailability(id) {
    const response = await API.get(`/availability/doctors/${id}`);
    return response.data;
  },

  async getDoctorSlots(id, date) {
    const response = await API.get(`/availability/doctors/${id}/slots`, { params: { date } });
    return response.data;
  },

  // ==================== DOCTOR-ROLE APIS ====================

  // Dashboard
  async getDashboardData() {
    const response = await API.get('/dashboard/doctor');
    return response.data;
  },

  async getMyAvailability() {
    const response = await API.get('/availability/me');
    return response.data;
  },

  async updateMyAvailability(data) {
    const response = await API.put('/availability/me', data);
    return response.data;
  },

  // Appointments
  async getAppointments(filters = {}) {
    const response = await API.get('/appointments', { params: filters });
    return response.data;
  },

  async getAppointmentById(id) {
    const response = await API.get(`/appointments/${id}`);
    return response.data;
  },

  async approveAppointment(id) {
    const response = await API.put(`/appointments/${id}/approve`);
    return response.data;
  },

  async rejectAppointment(id, rejectionReason) {
    const response = await API.put(`/appointments/${id}/reject`, { rejectionReason });
    return response.data;
  },

  async completeAppointment(id, completionNotes = '') {
    const response = await API.put(`/appointments/${id}/complete`, { completionNotes });
    return response.data;
  },

  async rescheduleAppointmentByDoctor(id, data) {
    const response = await API.put(`/appointments/${id}/reschedule-by-doctor`, data);
    return response.data;
  },

  // Patients (derived from appointments)
  async getPatients() {
    const response = await API.get('/appointments');
    const appointments = response.data?.data?.appointments || response.data?.appointments || [];
    
    const patientMap = new Map();
    appointments.forEach((apt) => {
      const patient = apt.patientId;
      if (patient && (patient._id || patient.id)) {
        const pid = patient._id || patient.id;
        if (!patientMap.has(pid)) {
          const addr = patient.address;
          const addressStr = [addr?.street, addr?.city, addr?.province].filter(Boolean).join(', ');
          const conditions = (patient.medicalHistory || []).map((h) => h.condition).filter(Boolean);
          patientMap.set(pid, {
            _id: pid,
            name: patient.name || 'Unknown',
            email: patient.email || '',
            phone: patient.phone || '',
            profilePicture: patient.profileImageUrl || patient.profilePicture || '',
            gender: patient.gender || '',
            dateOfBirth: patient.dateOfBirth || '',
            bloodGroup: patient.bloodGroup || '',
            address: addressStr || '',
            conditions,
            lastVisit: apt.dateTime,
            appointmentCount: 1,
            lastStatus: apt.status,
          });
        } else {
          const existing = patientMap.get(pid);
          existing.appointmentCount++;
          if (new Date(apt.dateTime) > new Date(existing.lastVisit)) {
            existing.lastVisit = apt.dateTime;
            existing.lastStatus = apt.status;
          }
        }
      }
    });
    
    return { data: { patients: Array.from(patientMap.values()) } };
  },

  // Medical Records
  async getPatientMedicalRecords(patientId) {
    const [appointmentsRes, diagnosticsRes, medicationsRes] = await Promise.all([
      API.get('/appointments', { params: { patientId } }).catch(() => ({ data: { data: { appointments: [] } } })),
      API.get('/diagnostics', { params: { patientId } }).catch(() => ({ data: { data: { tests: [] } } })),
      API.get('/medications', { params: { patientId } }).catch(() => ({ data: { data: { medications: [] } } })),
    ]);

    return {
      data: {
        appointments: appointmentsRes.data?.data?.appointments || appointmentsRes.data?.appointments || [],
        diagnostics: diagnosticsRes.data?.data?.tests || diagnosticsRes.data?.data?.diagnosticTests || diagnosticsRes.data?.tests || [],
        medications: medicationsRes.data?.data?.medications || medicationsRes.data?.medications || [],
      },
    };
  },

  // Medications
  async prescribeMedication(data) {
    const response = await API.post('/medications/prescribe', data);
    return response.data;
  },

  async updateMedication(id, data) {
    const response = await API.put(`/medications/${id}`, data);
    return response.data;
  },

  async discontinueMedication(id, reason) {
    const response = await API.put(`/medications/${id}/discontinue`, { reason });
    return response.data;
  },

  async deleteDiscontinuedMedication(id) {
    const response = await API.delete(`/medications/discontinued/${id}`);
    return response.data;
  },

  async getActiveMedications(patientId) {
    const response = await API.get('/medications/active', { params: { patientId } });
    return response.data;
  },

  // Diagnostics
  async assignDiagnosticTest(data) {
    const response = await API.post('/diagnostics/assign', data);
    return response.data;
  },

  async getPatientDiagnosticTests(patientId) {
    const response = await API.get('/diagnostics', { params: { patientId } });
    return response.data;
  },

  async cancelDiagnosticTest(id, reason) {
    const response = await API.put(`/diagnostics/${id}/cancel`, { reason });
    return response.data;
  },

  // Medications list
  async getMedications(filters = {}) {
    const response = await API.get('/medications', { params: filters });
    return response.data;
  },

  // Labs
  async getLabs() {
    const response = await API.get('/auth/labs');
    return response.data;
  },
};

export default doctorService;
