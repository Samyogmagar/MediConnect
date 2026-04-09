import medicalRecordService from '../services/medicalRecord.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';
import { ROLES } from '../constants/roles.js';

/**
 * Medical Record Controller
 * Handles HTTP requests for medical records
 */
class MedicalRecordController {
  /**
   * Get medical record by patient ID
   * @route GET /api/medical-records/:patientId
   * @access Private (Doctor, Patient self, Admin)
   */
  async getMedicalRecord(req, res) {
    try {
      const { patientId } = req.params;
      const userId = req.user.userId.toString();
      const userRole = req.user.role;

      // Authorization: Only patient themselves, doctors, or admins can view
      if (
        userRole !== ROLES.DOCTOR &&
        userRole !== ROLES.ADMIN &&
        patientId !== userId
      ) {
        return errorResponse(res, 'Not authorized to view this medical record', 403);
      }

      const record = await medicalRecordService.getMedicalRecordByPatient(patientId);
      return successResponse(res, 200, 'Medical record retrieved successfully', record);
    } catch (error) {
      console.error('Get medical record error:', error);
      return errorResponse(res, error.message || 'Failed to retrieve medical record', 500);
    }
  }

  /**
   * Add vital signs
   * @route POST /api/medical-records/:patientId/vitals
   * @access Private (Doctor, Admin)
   */
  async addVitalSigns(req, res) {
    try {
      const { patientId } = req.params;
      const vitalsData = req.body;
      const recordedById = req.user.userId;

      // Validate required fields
      if (!vitalsData || Object.keys(vitalsData).length === 0) {
        return errorResponse(res, 'Vital signs data is required', 400);
      }

      const record = await medicalRecordService.addVitalSigns(
        patientId,
        vitalsData,
        recordedById
      );

      return successResponse(res, 201, 'Vital signs added successfully', record);
    } catch (error) {
      console.error('Add vital signs error:', error);
      return errorResponse(res, error.message || 'Failed to add vital signs', 500);
    }
  }

  /**
   * Get vital signs history
   * @route GET /api/medical-records/:patientId/vitals/history
   * @access Private (Doctor, Patient self, Admin)
   */
  async getVitalHistory(req, res) {
    try {
      const { patientId } = req.params;
      const limit = parseInt(req.query.limit) || 10;

      const history = await medicalRecordService.getVitalHistory(patientId, limit);
      return successResponse(res, 200, 'Vital signs history retrieved successfully', history);
    } catch (error) {
      console.error('Get vital history error:', error);
      return errorResponse(res, error.message || 'Failed to retrieve vital history', 500);
    }
  }

  /**
   * Add allergy
   * @route POST /api/medical-records/:patientId/allergies
   * @access Private (Doctor, Admin)
   */
  async addAllergy(req, res) {
    try {
      const { patientId } = req.params;
      const allergyData = req.body;
      const recordedById = req.user.userId;

      // Validate required fields
      if (!allergyData.allergen) {
        return errorResponse(res, 'Allergen name is required', 400);
      }

      const record = await medicalRecordService.addAllergy(
        patientId,
        allergyData,
        recordedById
      );

      return successResponse(res, 201, 'Allergy added successfully', record);
    } catch (error) {
      console.error('Add allergy error:', error);
      return errorResponse(res, error.message || 'Failed to add allergy', 500);
    }
  }

  /**
   * Update allergy
   * @route PUT /api/medical-records/:patientId/allergies/:allergyId
   * @access Private (Doctor, Admin)
   */
  async updateAllergy(req, res) {
    try {
      const { patientId, allergyId } = req.params;
      const updates = req.body;
      const userId = req.user.userId;

      const record = await medicalRecordService.updateAllergy(
        patientId,
        allergyId,
        updates,
        userId
      );

      return successResponse(res, 200, 'Allergy updated successfully', record);
    } catch (error) {
      console.error('Update allergy error:', error);
      return errorResponse(res, error.message || 'Failed to update allergy', 500);
    }
  }

  /**
   * Delete allergy
   * @route DELETE /api/medical-records/:patientId/allergies/:allergyId
   * @access Private (Doctor, Admin)
   */
  async deleteAllergy(req, res) {
    try {
      const { patientId, allergyId } = req.params;
      const userId = req.user.userId;

      const record = await medicalRecordService.deleteAllergy(
        patientId,
        allergyId,
        userId
      );

      return successResponse(res, 200, 'Allergy deleted successfully', record);
    } catch (error) {
      console.error('Delete allergy error:', error);
      return errorResponse(res, error.message || 'Failed to delete allergy', 500);
    }
  }

  /**
   * Get active allergies
   * @route GET /api/medical-records/:patientId/allergies/active
   * @access Private (Doctor, Patient self, Admin)
   */
  async getActiveAllergies(req, res) {
    try {
      const { patientId } = req.params;

      const allergies = await medicalRecordService.getActiveAllergies(patientId);
      return successResponse(res, 200, 'Active allergies retrieved successfully', allergies);
    } catch (error) {
      console.error('Get active allergies error:', error);
      return errorResponse(res, error.message || 'Failed to retrieve active allergies', 500);
    }
  }

  /**
   * Add medical condition
   * @route POST /api/medical-records/:patientId/conditions
   * @access Private (Doctor, Admin)
   */
  async addCondition(req, res) {
    try {
      const { patientId } = req.params;
      const conditionData = req.body;
      const diagnosedById = req.user.userId;

      // Validate required fields
      if (!conditionData.name) {
        return errorResponse(res, 'Condition name is required', 400);
      }

      const record = await medicalRecordService.addCondition(
        patientId,
        conditionData,
        diagnosedById
      );

      return successResponse(res, 201, 'Condition added successfully', record);
    } catch (error) {
      console.error('Add condition error:', error);
      return errorResponse(res, error.message || 'Failed to add condition', 500);
    }
  }

  /**
   * Update medical condition
   * @route PUT /api/medical-records/:patientId/conditions/:conditionId
   * @access Private (Doctor, Admin)
   */
  async updateCondition(req, res) {
    try {
      const { patientId, conditionId } = req.params;
      const updates = req.body;
      const userId = req.user.userId;

      const record = await medicalRecordService.updateCondition(
        patientId,
        conditionId,
        updates,
        userId
      );

      return successResponse(res, 200, 'Condition updated successfully', record);
    } catch (error) {
      console.error('Update condition error:', error);
      return errorResponse(res, error.message || 'Failed to update condition', 500);
    }
  }

  /**
   * Delete medical condition
   * @route DELETE /api/medical-records/:patientId/conditions/:conditionId
   * @access Private (Doctor, Admin)
   */
  async deleteCondition(req, res) {
    try {
      const { patientId, conditionId } = req.params;
      const userId = req.user.userId;

      const record = await medicalRecordService.deleteCondition(
        patientId,
        conditionId,
        userId
      );

      return successResponse(res, 200, 'Condition deleted successfully', record);
    } catch (error) {
      console.error('Delete condition error:', error);
      return errorResponse(res, error.message || 'Failed to delete condition', 500);
    }
  }

  /**
   * Get active conditions
   * @route GET /api/medical-records/:patientId/conditions/active
   * @access Private (Doctor, Patient self, Admin)
   */
  async getActiveConditions(req, res) {
    try {
      const { patientId } = req.params;

      const conditions = await medicalRecordService.getActiveConditions(patientId);
      return successResponse(res, 200, 'Active conditions retrieved successfully', conditions);
    } catch (error) {
      console.error('Get active conditions error:', error);
      return errorResponse(res, error.message || 'Failed to retrieve active conditions', 500);
    }
  }

  /**
   * Add immunization
   * @route POST /api/medical-records/:patientId/immunizations
   * @access Private (Doctor, Admin)
   */
  async addImmunization(req, res) {
    try {
      const { patientId } = req.params;
      const immunizationData = req.body;
      const administeredById = req.user.userId;

      // Validate required fields
      if (!immunizationData.vaccineName || !immunizationData.administeredDate) {
        return errorResponse(res, 'Vaccine name and administered date are required', 400);
      }

      const record = await medicalRecordService.addImmunization(
        patientId,
        immunizationData,
        administeredById
      );

      return successResponse(res, 201, 'Immunization added successfully', record);
    } catch (error) {
      console.error('Add immunization error:', error);
      return errorResponse(res, error.message || 'Failed to add immunization', 500);
    }
  }

  /**
   * Update immunization
   * @route PUT /api/medical-records/:patientId/immunizations/:immunizationId
   * @access Private (Doctor, Admin)
   */
  async updateImmunization(req, res) {
    try {
      const { patientId, immunizationId } = req.params;
      const updates = req.body;
      const userId = req.user.userId;

      const record = await medicalRecordService.updateImmunization(
        patientId,
        immunizationId,
        updates,
        userId
      );

      return successResponse(res, 200, 'Immunization updated successfully', record);
    } catch (error) {
      console.error('Update immunization error:', error);
      return errorResponse(res, error.message || 'Failed to update immunization', 500);
    }
  }

  /**
   * Delete immunization
   * @route DELETE /api/medical-records/:patientId/immunizations/:immunizationId
   * @access Private (Doctor, Admin)
   */
  async deleteImmunization(req, res) {
    try {
      const { patientId, immunizationId } = req.params;
      const userId = req.user.userId;

      const record = await medicalRecordService.deleteImmunization(
        patientId,
        immunizationId,
        userId
      );

      return successResponse(res, 200, 'Immunization deleted successfully', record);
    } catch (error) {
      console.error('Delete immunization error:', error);
      return errorResponse(res, error.message || 'Failed to delete immunization', 500);
    }
  }

  /**
   * Add lab result
   * @route POST /api/medical-records/:patientId/lab-results
   * @access Private (Doctor, Lab, Admin)
   */
  async addLabResult(req, res) {
    try {
      const { patientId } = req.params;
      const labResultData = req.body;
      const orderedById = req.user.userId;

      // Validate required fields
      if (!labResultData.testName) {
        return errorResponse(res, 'Test name is required', 400);
      }

      const record = await medicalRecordService.addLabResult(
        patientId,
        labResultData,
        orderedById
      );

      return successResponse(res, 201, 'Lab result added successfully', record);
    } catch (error) {
      console.error('Add lab result error:', error);
      return errorResponse(res, error.message || 'Failed to add lab result', 500);
    }
  }

  /**
   * Update lab result
   * @route PUT /api/medical-records/:patientId/lab-results/:labResultId
   * @access Private (Doctor, Lab, Admin)
   */
  async updateLabResult(req, res) {
    try {
      const { patientId, labResultId } = req.params;
      const updates = req.body;
      const userId = req.user.userId;

      const record = await medicalRecordService.updateLabResult(
        patientId,
        labResultId,
        updates,
        userId
      );

      return successResponse(res, 200, 'Lab result updated successfully', record);
    } catch (error) {
      console.error('Update lab result error:', error);
      return errorResponse(res, error.message || 'Failed to update lab result', 500);
    }
  }

  /**
   * Delete lab result
   * @route DELETE /api/medical-records/:patientId/lab-results/:labResultId
   * @access Private (Doctor, Lab, Admin)
   */
  async deleteLabResult(req, res) {
    try {
      const { patientId, labResultId } = req.params;
      const userId = req.user.userId;

      const record = await medicalRecordService.deleteLabResult(
        patientId,
        labResultId,
        userId
      );

      return successResponse(res, 200, 'Lab result deleted successfully', record);
    } catch (error) {
      console.error('Delete lab result error:', error);
      return errorResponse(res, error.message || 'Failed to delete lab result', 500);
    }
  }

  /**
   * Update general medical record information
   * @route PUT /api/medical-records/:patientId/general
   * @access Private (Doctor, Admin)
   */
  async updateGeneralInfo(req, res) {
    try {
      const { patientId } = req.params;
      const updates = req.body;
      const userId = req.user.userId;

      const record = await medicalRecordService.updateGeneralInfo(
        patientId,
        updates,
        userId
      );

      return successResponse(res, 200, 'General information updated successfully', record);
    } catch (error) {
      console.error('Update general info error:', error);
      return errorResponse(res, error.message || 'Failed to update general information', 500);
    }
  }
}

export default new MedicalRecordController();
