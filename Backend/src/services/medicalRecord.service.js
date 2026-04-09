import MedicalRecord from '../models/MedicalRecord.model.js';
import User from '../models/User.model.js';
import { ROLES } from '../constants/roles.js';

/**
 * Medical Record Service
 * Handles business logic for medical records
 */
class MedicalRecordService {
  /**
   * Get or create medical record for a patient
   * @param {string} patientId - Patient's user ID
   * @returns {Promise<Object>} Medical record
   */
  async getOrCreateMedicalRecord(patientId) {
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Find existing record or create new one
    let record = await MedicalRecord.findOne({ patient: patientId });
    
    if (!record) {
      record = await MedicalRecord.create({ patient: patientId });
    }

    return record;
  }

  /**
   * Get medical record by patient ID
   * @param {string} patientId - Patient's user ID
   * @returns {Promise<Object>} Medical record
   */
  async getMedicalRecordByPatient(patientId) {
    const record = await MedicalRecord.findOne({ patient: patientId })
      .populate('patient', 'name email phone profilePicture')
      .populate('lastUpdatedBy', 'name role')
      .populate('currentVitals.recordedBy', 'name')
      .populate('allergies.recordedBy', 'name')
      .populate('conditions.diagnosedBy', 'name')
      .populate('immunizations.administeredBy', 'name')
      .populate('labResults.orderedBy', 'name');

    if (!record) {
      return await this.getOrCreateMedicalRecord(patientId);
    }

    return record;
  }

  /**
   * Add or update vital signs
   * @param {string} patientId - Patient's user ID
   * @param {Object} vitalsData - Vital signs data
   * @param {string} recordedById - ID of user recording vitals
   * @returns {Promise<Object>} Updated medical record
   */
  async addVitalSigns(patientId, vitalsData, recordedById) {
    const record = await this.getOrCreateMedicalRecord(patientId);

    // Calculate BMI if height and weight provided
    if (vitalsData.height && vitalsData.weight) {
      const heightInMeters = vitalsData.height / 100;
      vitalsData.bmi = (vitalsData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    const vitalEntry = {
      ...vitalsData,
      recordedBy: recordedById,
      recordedAt: new Date(),
    };

    // Add to history
    if (record.currentVitals) {
      record.vitalHistory.push(record.currentVitals);
    }

    // Update current vitals
    record.currentVitals = vitalEntry;
    record.lastUpdatedBy = recordedById;

    await record.save();
    return record;
  }

  /**
   * Add allergy
   * @param {string} patientId - Patient's user ID
   * @param {Object} allergyData - Allergy data
   * @param {string} recordedById - ID of user recording allergy
   * @returns {Promise<Object>} Updated medical record
   */
  async addAllergy(patientId, allergyData, recordedById) {
    const record = await this.getOrCreateMedicalRecord(patientId);

    record.allergies.push({
      ...allergyData,
      recordedBy: recordedById,
    });

    record.lastUpdatedBy = recordedById;
    await record.save();
    return record;
  }

  /**
   * Update allergy
   * @param {string} patientId - Patient's user ID
   * @param {string} allergyId - Allergy ID
   * @param {Object} updates - Updated allergy data
   * @param {string} userId - ID of user updating
   * @returns {Promise<Object>} Updated medical record
   */
  async updateAllergy(patientId, allergyId, updates, userId) {
    const record = await this.getOrCreateMedicalRecord(patientId);
    
    const allergy = record.allergies.id(allergyId);
    if (!allergy) {
      throw new Error('Allergy not found');
    }

    Object.assign(allergy, updates);
    record.lastUpdatedBy = userId;
    
    await record.save();
    return record;
  }

  /**
   * Delete allergy
   * @param {string} patientId - Patient's user ID
   * @param {string} allergyId - Allergy ID
   * @param {string} userId - ID of user deleting
   * @returns {Promise<Object>} Updated medical record
   */
  async deleteAllergy(patientId, allergyId, userId) {
    const record = await this.getOrCreateMedicalRecord(patientId);
    
    record.allergies.pull(allergyId);
    record.lastUpdatedBy = userId;
    
    await record.save();
    return record;
  }

  /**
   * Add medical condition
   * @param {string} patientId - Patient's user ID
   * @param {Object} conditionData - Condition data
   * @param {string} diagnosedById - ID of diagnosing doctor
   * @returns {Promise<Object>} Updated medical record
   */
  async addCondition(patientId, conditionData, diagnosedById) {
    const record = await this.getOrCreateMedicalRecord(patientId);

    record.conditions.push({
      ...conditionData,
      diagnosedBy: diagnosedById,
      updatedAt: new Date(),
    });

    record.lastUpdatedBy = diagnosedById;
    await record.save();
    return record;
  }

  /**
   * Update medical condition
   * @param {string} patientId - Patient's user ID
   * @param {string} conditionId - Condition ID
   * @param {Object} updates - Updated condition data
   * @param {string} userId - ID of user updating
   * @returns {Promise<Object>} Updated medical record
   */
  async updateCondition(patientId, conditionId, updates, userId) {
    const record = await this.getOrCreateMedicalRecord(patientId);
    
    const condition = record.conditions.id(conditionId);
    if (!condition) {
      throw new Error('Condition not found');
    }

    Object.assign(condition, { ...updates, updatedAt: new Date() });
    record.lastUpdatedBy = userId;
    
    await record.save();
    return record;
  }

  /**
   * Delete medical condition
   * @param {string} patientId - Patient's user ID
   * @param {string} conditionId - Condition ID
   * @param {string} userId - ID of user deleting
   * @returns {Promise<Object>} Updated medical record
   */
  async deleteCondition(patientId, conditionId, userId) {
    const record = await this.getOrCreateMedicalRecord(patientId);
    
    record.conditions.pull(conditionId);
    record.lastUpdatedBy = userId;
    
    await record.save();
    return record;
  }

  /**
   * Add immunization record
   * @param {string} patientId - Patient's user ID
   * @param {Object} immunizationData - Immunization data
   * @param {string} administeredById - ID of administering user
   * @returns {Promise<Object>} Updated medical record
   */
  async addImmunization(patientId, immunizationData, administeredById) {
    const record = await this.getOrCreateMedicalRecord(patientId);

    record.immunizations.push({
      ...immunizationData,
      administeredBy: administeredById,
    });

    record.lastUpdatedBy = administeredById;
    await record.save();
    return record;
  }

  /**
   * Update immunization record
   * @param {string} patientId - Patient's user ID
   * @param {string} immunizationId - Immunization ID
   * @param {Object} updates - Updated immunization data
   * @param {string} userId - ID of user updating
   * @returns {Promise<Object>} Updated medical record
   */
  async updateImmunization(patientId, immunizationId, updates, userId) {
    const record = await this.getOrCreateMedicalRecord(patientId);
    
    const immunization = record.immunizations.id(immunizationId);
    if (!immunization) {
      throw new Error('Immunization record not found');
    }

    Object.assign(immunization, updates);
    record.lastUpdatedBy = userId;
    
    await record.save();
    return record;
  }

  /**
   * Delete immunization record
   * @param {string} patientId - Patient's user ID
   * @param {string} immunizationId - Immunization ID
   * @param {string} userId - ID of user deleting
   * @returns {Promise<Object>} Updated medical record
   */
  async deleteImmunization(patientId, immunizationId, userId) {
    const record = await this.getOrCreateMedicalRecord(patientId);
    
    record.immunizations.pull(immunizationId);
    record.lastUpdatedBy = userId;
    
    await record.save();
    return record;
  }

  /**
   * Add lab result
   * @param {string} patientId - Patient's user ID
   * @param {Object} labResultData - Lab result data
   * @param {string} orderedById - ID of ordering doctor
   * @returns {Promise<Object>} Updated medical record
   */
  async addLabResult(patientId, labResultData, orderedById) {
    const record = await this.getOrCreateMedicalRecord(patientId);

    record.labResults.push({
      ...labResultData,
      orderedBy: orderedById,
    });

    record.lastUpdatedBy = orderedById;
    await record.save();
    return record;
  }

  /**
   * Update lab result
   * @param {string} patientId - Patient's user ID
   * @param {string} labResultId - Lab result ID
   * @param {Object} updates - Updated lab result data
   * @param {string} userId - ID of user updating
   * @returns {Promise<Object>} Updated medical record
   */
  async updateLabResult(patientId, labResultId, updates, userId) {
    const record = await this.getOrCreateMedicalRecord(patientId);
    
    const labResult = record.labResults.id(labResultId);
    if (!labResult) {
      throw new Error('Lab result not found');
    }

    Object.assign(labResult, updates);
    record.lastUpdatedBy = userId;
    
    await record.save();
    return record;
  }

  /**
   * Delete lab result
   * @param {string} patientId - Patient's user ID
   * @param {string} labResultId - Lab result ID
   * @param {string} userId - ID of user deleting
   * @returns {Promise<Object>} Updated medical record
   */
  async deleteLabResult(patientId, labResultId, userId) {
    const record = await this.getOrCreateMedicalRecord(patientId);
    
    record.labResults.pull(labResultId);
    record.lastUpdatedBy = userId;
    
    await record.save();
    return record;
  }

  /**
   * Update general medical record information
   * @param {string} patientId - Patient's user ID
   * @param {Object} updates - General updates (bloodType, emergencyContact, etc.)
   * @param {string} userId - ID of user updating
   * @returns {Promise<Object>} Updated medical record
   */
  async updateGeneralInfo(patientId, updates, userId) {
    const record = await this.getOrCreateMedicalRecord(patientId);

    const allowedUpdates = [
      'bloodType',
      'emergencyContact',
      'familyHistory',
      'socialHistory',
      'generalNotes',
    ];

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        record[field] = updates[field];
      }
    });

    record.lastUpdatedBy = userId;
    await record.save();
    return record;
  }

  /**
   * Get vital signs history
   * @param {string} patientId - Patient's user ID
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} Vital signs history
   */
  async getVitalHistory(patientId, limit = 10) {
    const record = await MedicalRecord.findOne({ patient: patientId });
    
    if (!record) {
      return [];
    }

    return record.vitalHistory
      .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
      .slice(0, limit);
  }

  /**
   * Get active allergies
   * @param {string} patientId - Patient's user ID
   * @returns {Promise<Array>} Active allergies
   */
  async getActiveAllergies(patientId) {
    const record = await MedicalRecord.findOne({ patient: patientId });
    
    if (!record) {
      return [];
    }

    return record.allergies.filter((allergy) => allergy.status === 'active');
  }

  /**
   * Get active conditions
   * @param {string} patientId - Patient's user ID
   * @returns {Promise<Array>} Active conditions
   */
  async getActiveConditions(patientId) {
    const record = await MedicalRecord.findOne({ patient: patientId });
    
    if (!record) {
      return [];
    }

    return record.conditions.filter(
      (condition) => condition.status === 'active' || condition.status === 'chronic'
    );
  }
}

export default new MedicalRecordService();
