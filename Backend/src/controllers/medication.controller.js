import medicationService from '../services/medication.service.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.util.js';
import MESSAGES from '../constants/messages.js';

/**
 * Medication Controller
 * Thin controller layer - delegates business logic to service
 */
class MedicationController {
  /**
   * Prescribe medication to a patient (Doctor only)
   * POST /api/medications/prescribe
   */
  async prescribeMedication(req, res) {
    try {
      const {
        patientId,
        medicationName,
        dosage,
        frequency,
        frequencyTimes,
        duration,
        startDate,
        instructions,
        reason,
        remindersEnabled,
        appointmentId,
      } = req.body;

      // Validation
      const errors = [];
      if (!patientId) errors.push({ field: 'patientId', message: MESSAGES.MEDICATION.PATIENT_REQUIRED });
      if (!medicationName)
        errors.push({ field: 'medicationName', message: MESSAGES.MEDICATION.MEDICATION_NAME_REQUIRED });
      if (!dosage) errors.push({ field: 'dosage', message: MESSAGES.MEDICATION.DOSAGE_REQUIRED });
      if (!frequency) errors.push({ field: 'frequency', message: MESSAGES.MEDICATION.FREQUENCY_REQUIRED });
      if (!duration || !duration.value || !duration.unit) {
        errors.push({ field: 'duration', message: MESSAGES.MEDICATION.DURATION_REQUIRED });
      }
      if (!appointmentId) {
        errors.push({ field: 'appointmentId', message: 'Appointment ID is required' });
      }

      if (errors.length > 0) {
        return validationErrorResponse(res, 'Validation failed', errors);
      }

      const result = await medicationService.prescribeMedication(
        {
          patientId,
          medicationName,
          dosage,
          frequency,
          frequencyTimes,
          duration,
          startDate,
          instructions,
          reason,
          remindersEnabled,
          appointmentId,
        },
        req.user.userId
      );

      return successResponse(res, 201, MESSAGES.MEDICATION.PRESCRIBED, result);
    } catch (error) {
      console.error('Prescribe medication error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get medications with filters
   * GET /api/medications
   */
  async getMedications(req, res) {
    try {
      const { status } = req.query;
      const filters = { status };

      const medications = await medicationService.getMedications(filters, req.user.userId, req.user.role);

      return successResponse(res, 200, 'Medications retrieved successfully', {
        medications,
        count: medications.length,
      });
    } catch (error) {
      console.error('Get medications error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get active medications for patient
   * GET /api/medications/active
   */
  async getActiveMedications(req, res) {
    try {
      // Patients can only view their own, doctors/admins need to specify patientId
      const patientId = req.user.role === 'patient' ? req.user.userId : req.query.patientId;

      if (!patientId) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'patientId', message: MESSAGES.MEDICATION.PATIENT_REQUIRED },
        ]);
      }

      const medications = await medicationService.getActiveMedications(patientId);

      return successResponse(res, 200, 'Active medications retrieved successfully', {
        medications,
        count: medications.length,
      });
    } catch (error) {
      console.error('Get active medications error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get medication by ID
   * GET /api/medications/:id
   */
  async getMedicationById(req, res) {
    try {
      const { id } = req.params;

      const result = await medicationService.getMedicationById(id, req.user.userId, req.user.role);

      return successResponse(res, 200, 'Medication retrieved successfully', result);
    } catch (error) {
      console.error('Get medication by ID error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Update medication (Doctor only)
   * PUT /api/medications/:id
   */
  async updateMedication(req, res) {
    try {
      const { id } = req.params;
      const { instructions, dosage, frequency, frequencyTimes, remindersEnabled } = req.body;

      const updates = {};
      if (instructions !== undefined) updates.instructions = instructions;
      if (dosage !== undefined) updates.dosage = dosage;
      if (frequency !== undefined) updates.frequency = frequency;
      if (frequencyTimes !== undefined) updates.frequencyTimes = frequencyTimes;
      if (remindersEnabled !== undefined) updates.remindersEnabled = remindersEnabled;

      const medication = await medicationService.updateMedication(id, updates, req.user.userId);

      return successResponse(res, 200, MESSAGES.MEDICATION.UPDATED, { medication });
    } catch (error) {
      console.error('Update medication error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Discontinue medication (Doctor only)
   * PUT /api/medications/:id/discontinue
   */
  async discontinueMedication(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'reason', message: MESSAGES.MEDICATION.DISCONTINUATION_REASON_REQUIRED },
        ]);
      }

      const medication = await medicationService.discontinueMedication(id, req.user.userId, reason);

      return successResponse(res, 200, MESSAGES.MEDICATION.DISCONTINUED, { medication });
    } catch (error) {
      console.error('Discontinue medication error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Delete discontinued medication (Doctor only)
   * DELETE /api/medications/:id
   */
  async deleteDiscontinuedMedication(req, res) {
    try {
      const { id } = req.params;

      await medicationService.deleteDiscontinuedMedication(id, req.user.userId);

      return successResponse(res, 200, 'Discontinued medication deleted successfully');
    } catch (error) {
      console.error('Delete discontinued medication error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get today's reminders for patient
   * GET /api/medications/reminders/today
   */
  async getTodaysReminders(req, res) {
    try {
      const patientId = req.user.role === 'patient' ? req.user.userId : req.query.patientId;

      if (!patientId) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'patientId', message: MESSAGES.MEDICATION.PATIENT_REQUIRED },
        ]);
      }

      const reminders = await medicationService.getTodaysReminders(patientId);

      return successResponse(res, 200, 'Today\'s reminders retrieved successfully', {
        reminders,
        count: reminders.length,
      });
    } catch (error) {
      console.error('Get today\'s reminders error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get reminders for a date range
   * GET /api/medications/reminders
   */
  async getReminders(req, res) {
    try {
      const patientId = req.user.role === 'patient' ? req.user.userId : req.query.patientId;
      const { startDate, endDate } = req.query;

      if (!patientId) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'patientId', message: MESSAGES.MEDICATION.PATIENT_REQUIRED },
        ]);
      }

      const reminders = await medicationService.getReminders(patientId, startDate, endDate);

      return successResponse(res, 200, 'Reminders retrieved successfully', {
        reminders,
        count: reminders.length,
      });
    } catch (error) {
      console.error('Get reminders error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Acknowledge reminder (Patient only)
   * PUT /api/medications/reminders/:id/acknowledge
   */
  async acknowledgeReminder(req, res) {
    try {
      const { id } = req.params;

      const reminder = await medicationService.acknowledgeReminder(id, req.user.userId);

      return successResponse(res, 200, MESSAGES.REMINDER.ACKNOWLEDGED, { reminder });
    } catch (error) {
      console.error('Acknowledge reminder error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get medication adherence statistics
   * GET /api/medications/adherence
   */
  async getAdherenceStats(req, res) {
    try {
      const patientId = req.user.role === 'patient' ? req.user.userId : req.query.patientId;
      const days = parseInt(req.query.days) || 7;

      if (!patientId) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'patientId', message: MESSAGES.MEDICATION.PATIENT_REQUIRED },
        ]);
      }

      const stats = await medicationService.getAdherenceStats(patientId, days);

      return successResponse(res, 200, 'Adherence statistics retrieved successfully', { stats });
    } catch (error) {
      console.error('Get adherence stats error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }
}

export default new MedicationController();
