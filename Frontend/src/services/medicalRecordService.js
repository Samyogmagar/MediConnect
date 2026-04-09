import API from '../config/api';

/**
 * Medical record service — diagnostics, medications, and comprehensive records
 * Backend bases: /api/diagnostics, /api/medications, /api/medical-records
 */
const medicalRecordService = {
  // ==================== DIAGNOSTIC TESTS ====================
  
  /**
   * Get all diagnostic tests for current user (role-filtered by backend)
   * @param {Object} filters - { status?, urgency?, testType? }
   */
  async getDiagnosticTests(filters = {}) {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.urgency) params.urgency = filters.urgency;
    if (filters.testType) params.testType = filters.testType;

    const response = await API.get('/diagnostics', { params });
    return response.data;
  },

  /**
   * Get completed diagnostic tests with reports
   */
  async getCompletedTests() {
    const response = await API.get('/diagnostics/completed');
    return response.data;
  },

  /**
   * Get a single diagnostic test by ID
   * @param {string} id
   */
  async getDiagnosticTestById(id) {
    const response = await API.get(`/diagnostics/${id}`);
    return response.data;
  },

  // ==================== MEDICATIONS ====================
  
  /**
   * Get all medications for current user
   * @param {Object} filters - { status? }
   */
  async getMedications(filters = {}) {
    const params = {};
    if (filters.status) params.status = filters.status;

    const response = await API.get('/medications', { params });
    return response.data;
  },

  /**
   * Get active medications
   */
  async getActiveMedications() {
    const response = await API.get('/medications/active');
    return response.data;
  },

  /**
   * Get a single medication by ID
   * @param {string} id
   */
  async getMedicationById(id) {
    const response = await API.get(`/medications/${id}`);
    return response.data;
  },

  /**
   * Get today's medication reminders
   */
  async getTodaysReminders() {
    const response = await API.get('/medications/reminders/today');
    return response.data;
  },

  // ==================== MEDICAL RECORDS ====================
  
  /**
   * Get comprehensive medical record for a patient
   * @param {string} patientId - Patient's user ID
   */
  async getMedicalRecord(patientId) {
    const response = await API.get(`/medical-records/${patientId}`);
    return response.data;
  },

  /**
   * Add vital signs to medical record
   * @param {string} patientId - Patient's user ID
   * @param {Object} vitalsData - Vital signs data
   */
  async addVitalSigns(patientId, vitalsData) {
    const response = await API.post(`/medical-records/${patientId}/vitals`, vitalsData);
    return response.data;
  },

  /**
   * Get vital signs history
   * @param {string} patientId - Patient's user ID
   * @param {number} limit - Number of records to retrieve
   */
  async getVitalHistory(patientId, limit = 10) {
    const response = await API.get(`/medical-records/${patientId}/vitals/history`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Add allergy to medical record
   * @param {string} patientId - Patient's user ID
   * @param {Object} allergyData - Allergy data
   */
  async addAllergy(patientId, allergyData) {
    const response = await API.post(`/medical-records/${patientId}/allergies`, allergyData);
    return response.data;
  },

  /**
   * Update allergy
   * @param {string} patientId - Patient's user ID
   * @param {string} allergyId - Allergy ID
   * @param {Object} updates - Updated allergy data
   */
  async updateAllergy(patientId, allergyId, updates) {
    const response = await API.put(
      `/medical-records/${patientId}/allergies/${allergyId}`,
      updates
    );
    return response.data;
  },

  /**
   * Delete allergy
   * @param {string} patientId - Patient's user ID
   * @param {string} allergyId - Allergy ID
   */
  async deleteAllergy(patientId, allergyId) {
    const response = await API.delete(
      `/medical-records/${patientId}/allergies/${allergyId}`
    );
    return response.data;
  },

  /**
   * Get active allergies
   * @param {string} patientId - Patient's user ID
   */
  async getActiveAllergies(patientId) {
    const response = await API.get(`/medical-records/${patientId}/allergies/active`);
    return response.data;
  },

  /**
   * Add medical condition to record
   * @param {string} patientId - Patient's user ID
   * @param {Object} conditionData - Condition data
   */
  async addCondition(patientId, conditionData) {
    const response = await API.post(`/medical-records/${patientId}/conditions`, conditionData);
    return response.data;
  },

  /**
   * Update medical condition
   * @param {string} patientId - Patient's user ID
   * @param {string} conditionId - Condition ID
   * @param {Object} updates - Updated condition data
   */
  async updateCondition(patientId, conditionId, updates) {
    const response = await API.put(
      `/medical-records/${patientId}/conditions/${conditionId}`,
      updates
    );
    return response.data;
  },

  /**
   * Delete medical condition
   * @param {string} patientId - Patient's user ID
   * @param {string} conditionId - Condition ID
   */
  async deleteCondition(patientId, conditionId) {
    const response = await API.delete(
      `/medical-records/${patientId}/conditions/${conditionId}`
    );
    return response.data;
  },

  /**
   * Get active medical conditions
   * @param {string} patientId - Patient's user ID
   */
  async getActiveConditions(patientId) {
    const response = await API.get(`/medical-records/${patientId}/conditions/active`);
    return response.data;
  },

  /**
   * Add immunization record
   * @param {string} patientId - Patient's user ID
   * @param {Object} immunizationData - Immunization data
   */
  async addImmunization(patientId, immunizationData) {
    const response = await API.post(
      `/medical-records/${patientId}/immunizations`,
      immunizationData
    );
    return response.data;
  },

  /**
   * Update immunization record
   * @param {string} patientId - Patient's user ID
   * @param {string} immunizationId - Immunization ID
   * @param {Object} updates - Updated immunization data
   */
  async updateImmunization(patientId, immunizationId, updates) {
    const response = await API.put(
      `/medical-records/${patientId}/immunizations/${immunizationId}`,
      updates
    );
    return response.data;
  },

  /**
   * Delete immunization record
   * @param {string} patientId - Patient's user ID
   * @param {string} immunizationId - Immunization ID
   */
  async deleteImmunization(patientId, immunizationId) {
    const response = await API.delete(
      `/medical-records/${patientId}/immunizations/${immunizationId}`
    );
    return response.data;
  },

  /**
   * Add lab result to medical record
   * @param {string} patientId - Patient's user ID
   * @param {Object} labResultData - Lab result data
   */
  async addLabResult(patientId, labResultData) {
    const response = await API.post(
      `/medical-records/${patientId}/lab-results`,
      labResultData
    );
    return response.data;
  },

  /**
   * Update lab result
   * @param {string} patientId - Patient's user ID
   * @param {string} labResultId - Lab result ID
   * @param {Object} updates - Updated lab result data
   */
  async updateLabResult(patientId, labResultId, updates) {
    const response = await API.put(
      `/medical-records/${patientId}/lab-results/${labResultId}`,
      updates
    );
    return response.data;
  },

  /**
   * Delete lab result
   * @param {string} patientId - Patient's user ID
   * @param {string} labResultId - Lab result ID
   */
  async deleteLabResult(patientId, labResultId) {
    const response = await API.delete(
      `/medical-records/${patientId}/lab-results/${labResultId}`
    );
    return response.data;
  },

  /**
   * Update general medical record information
   * @param {string} patientId - Patient's user ID
   * @param {Object} updates - General information updates
   */
  async updateGeneralInfo(patientId, updates) {
    const response = await API.put(`/medical-records/${patientId}/general`, updates);
    return response.data;
  },
};

export default medicalRecordService;
