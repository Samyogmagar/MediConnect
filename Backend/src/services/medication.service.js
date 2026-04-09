import Medication from '../models/Medication.model.js';
import Reminder from '../models/Reminder.model.js';
import User from '../models/User.model.js';
import Appointment from '../models/Appointment.model.js';
import MESSAGES from '../constants/messages.js';
import notificationService from './notification.service.js';

/**
 * Medication Service
 * Business logic for medication prescription and reminder management
 */
class MedicationService {
  /**
   * Prescribe medication to a patient (Doctor only)
   * @param {Object} medicationData - Medication details
   * @param {string} doctorId - ID of the doctor prescribing
   * @returns {Promise<Object>} Created medication with generated reminders
   */
  async prescribeMedication(medicationData, doctorId) {
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
    } = medicationData;

    // Validate required fields
    if (!patientId) {
      throw { statusCode: 400, message: MESSAGES.MEDICATION.PATIENT_REQUIRED };
    }
    if (!medicationName) {
      throw { statusCode: 400, message: MESSAGES.MEDICATION.MEDICATION_NAME_REQUIRED };
    }
    if (!dosage) {
      throw { statusCode: 400, message: MESSAGES.MEDICATION.DOSAGE_REQUIRED };
    }
    if (!frequency) {
      throw { statusCode: 400, message: MESSAGES.MEDICATION.FREQUENCY_REQUIRED };
    }
    if (!duration || !duration.value || !duration.unit) {
      throw { statusCode: 400, message: MESSAGES.MEDICATION.DURATION_REQUIRED };
    }
    if (!appointmentId) {
      throw { statusCode: 400, message: 'Appointment ID is required' };
    }

    // Verify patient exists and has patient role
    const patient = await User.findById(patientId);
    if (!patient) {
      throw { statusCode: 404, message: MESSAGES.USER.NOT_FOUND };
    }
    if (patient.role !== 'patient') {
      throw { statusCode: 400, message: MESSAGES.MEDICATION.INVALID_PATIENT };
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw { statusCode: 404, message: MESSAGES.APPOINTMENT.NOT_FOUND };
    }
    if (appointment.doctorId.toString() !== doctorId) {
      throw { statusCode: 403, message: MESSAGES.APPOINTMENT.DOCTOR_ACCESS_DENIED };
    }
    if (appointment.patientId.toString() !== patientId) {
      throw { statusCode: 400, message: 'Appointment does not belong to this patient' };
    }
    if (appointment.status !== 'completed') {
      throw { statusCode: 400, message: 'Medication can be issued only after consultation is completed' };
    }

    // Create medication
    const medication = await Medication.create({
      patientId,
      doctorId,
      appointmentId,
      medicationName,
      dosage,
      frequency,
      frequencyTimes: frequencyTimes || [],
      duration,
      startDate: startDate || new Date(),
      instructions,
      reason,
      status: 'active',
      remindersEnabled: remindersEnabled !== false, // Default true
    });

    // Populate references
    await medication.populate([
      { path: 'patientId', select: 'name email contactNumber' },
      { path: 'doctorId', select: 'name email professionalDetails' },
    ]);

    // Generate reminders if enabled
    let reminders = [];
    if (medication.remindersEnabled) {
      reminders = await this.generateReminders(medication);
    }

    // Send notification to patient
    await notificationService.notifyMedicationPrescribed(medication);

    return {
      medication,
      remindersGenerated: reminders.length,
      reminders: reminders.slice(0, 5), // Return first 5 reminders as preview
    };
  }

  /**
   * Generate reminder schedule for medication
   * @param {Object} medication - Medication document
   * @returns {Promise<Array>} Created reminders
   */
  async generateReminders(medication) {
    // Get default times based on frequency
    let times = medication.frequencyTimes;

    if (!times || times.length === 0) {
      times = this.getDefaultTimesForFrequency(medication.frequency);
    }

    if (times.length === 0) {
      // No reminders for 'as_needed' or if times not specified
      return [];
    }

    const reminders = [];
    const start = new Date(medication.startDate);
    const end = new Date(medication.endDate);

    // Generate reminders for each day
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      for (const time of times) {
        const [hours, minutes] = time.split(':').map(Number);
        const reminderDateTime = new Date(date);
        reminderDateTime.setHours(hours, minutes, 0, 0);

        // Only create reminders for future times
        if (reminderDateTime > new Date()) {
          reminders.push({
            medicationId: medication._id,
            patientId: medication.patientId,
            reminderTime: reminderDateTime,
            reminderDate: new Date(date.setHours(0, 0, 0, 0)),
            timeOfDay: time,
            status: 'pending',
            notificationMethod: 'push',
          });
        }
      }
    }

    // Bulk insert reminders
    if (reminders.length > 0) {
      return await Reminder.insertMany(reminders);
    }

    return [];
  }

  /**
   * Get default reminder times based on frequency
   * @param {string} frequency - Medication frequency
   * @returns {Array<string>} Default times in HH:MM format
   */
  getDefaultTimesForFrequency(frequency) {
    const timeMap = {
      once_daily: ['08:00'],
      twice_daily: ['08:00', '20:00'],
      three_times_daily: ['08:00', '14:00', '20:00'],
      four_times_daily: ['08:00', '12:00', '16:00', '20:00'],
      every_6_hours: ['06:00', '12:00', '18:00', '00:00'],
      every_8_hours: ['08:00', '16:00', '00:00'],
      every_12_hours: ['08:00', '20:00'],
      before_meals: ['07:00', '12:00', '18:00'],
      after_meals: ['08:00', '13:00', '19:00'],
      at_bedtime: ['22:00'],
      as_needed: [], // No automatic reminders
    };

    return timeMap[frequency] || [];
  }

  /**
   * Get medications with role-based filtering
   * @param {Object} filters - Query filters (status)
   * @param {string} userId - User ID
   * @param {string} userRole - User role (patient, doctor, admin)
   * @returns {Promise<Array>} List of medications
   */
  async getMedications(filters, userId, userRole) {
    const query = {};

    // Role-based filtering
    if (userRole === 'patient') {
      query.patientId = userId;
    } else if (userRole === 'doctor') {
      query.doctorId = userId;
    }
    // Admin can see all medications (no additional filter)

    // Apply status filter
    if (filters.status) {
      query.status = filters.status;
    }

    const medications = await Medication.find(query)
      .populate('patientId', 'name email contactNumber')
      .populate('doctorId', 'name email professionalDetails')
      .sort({ prescribedAt: -1 });

    return medications;
  }

  /**
   * Get active medications for patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} Active medications
   */
  async getActiveMedications(patientId) {
    return await Medication.getActiveMedications(patientId);
  }

  /**
   * Get medication by ID with access control
   * @param {string} medicationId - Medication ID
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {Promise<Object>} Medication with reminders
   */
  async getMedicationById(medicationId, userId, userRole) {
    const medication = await Medication.findById(medicationId)
      .populate('patientId', 'name email contactNumber address')
      .populate('doctorId', 'name email professionalDetails');

    if (!medication) {
      throw { statusCode: 404, message: MESSAGES.MEDICATION.NOT_FOUND };
    }

    // Access control
    if (userRole === 'patient' && medication.patientId._id.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.MEDICATION.PATIENT_ACCESS_DENIED };
    }

    if (userRole === 'doctor' && medication.doctorId._id.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.MEDICATION.DOCTOR_ACCESS_DENIED };
    }

    // Get associated reminders
    const reminders = await Reminder.find({ medicationId: medication._id })
      .sort({ reminderTime: 1 })
      .limit(10); // Limit to next 10 reminders

    return {
      medication,
      upcomingReminders: reminders,
    };
  }

  /**
   * Update medication (Doctor only)
   * @param {string} medicationId - Medication ID
   * @param {Object} updates - Fields to update
   * @param {string} doctorId - Doctor ID
   * @returns {Promise<Object>} Updated medication
   */
  async updateMedication(medicationId, updates, doctorId) {
    const medication = await Medication.findById(medicationId);

    if (!medication) {
      throw { statusCode: 404, message: MESSAGES.MEDICATION.NOT_FOUND };
    }

    // Verify doctor access
    if (medication.doctorId.toString() !== doctorId) {
      throw { statusCode: 403, message: MESSAGES.MEDICATION.DOCTOR_ONLY };
    }

    // Cannot update completed or discontinued medications
    if (medication.status === 'completed') {
      throw { statusCode: 400, message: MESSAGES.MEDICATION.CANNOT_MODIFY_COMPLETED };
    }

    if (medication.status === 'discontinued') {
      throw { statusCode: 400, message: MESSAGES.MEDICATION.ALREADY_DISCONTINUED };
    }

    // Apply updates (only allow certain fields)
    const allowedUpdates = ['instructions', 'dosage', 'frequency', 'frequencyTimes', 'remindersEnabled'];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        medication[key] = updates[key];
      }
    });

    await medication.save();

    // Regenerate reminders if frequency changed
    if (updates.frequency || updates.frequencyTimes) {
      // Cancel existing pending reminders
      await Reminder.updateMany(
        { medicationId: medication._id, status: 'pending' },
        { $set: { status: 'cancelled' } }
      );

      // Generate new reminders
      if (medication.remindersEnabled) {
        await this.generateReminders(medication);
      }
    }

    await medication.populate([
      { path: 'patientId', select: 'name email contactNumber' },
      { path: 'doctorId', select: 'name email professionalDetails' },
    ]);

    return medication;
  }

  /**
   * Discontinue medication (Doctor only)
   * @param {string} medicationId - Medication ID
   * @param {string} doctorId - Doctor ID
   * @param {string} reason - Discontinuation reason
   * @returns {Promise<Object>} Discontinued medication
   */
  async discontinueMedication(medicationId, doctorId, reason) {
    if (!reason) {
      throw { statusCode: 400, message: MESSAGES.MEDICATION.DISCONTINUATION_REASON_REQUIRED };
    }

    const medication = await Medication.findById(medicationId);

    if (!medication) {
      throw { statusCode: 404, message: MESSAGES.MEDICATION.NOT_FOUND };
    }

    // Verify doctor access
    if (medication.doctorId.toString() !== doctorId) {
      throw { statusCode: 403, message: MESSAGES.MEDICATION.DOCTOR_ONLY };
    }

    if (medication.status === 'discontinued') {
      throw { statusCode: 400, message: MESSAGES.MEDICATION.ALREADY_DISCONTINUED };
    }

    // Update medication status
    medication.status = 'discontinued';
    medication.discontinuedReason = reason;
    medication.discontinuedAt = new Date();

    await medication.save();

    // Cancel all pending reminders
    await Reminder.updateMany(
      { medicationId: medication._id, status: 'pending' },
      { $set: { status: 'cancelled' } }
    );

    await medication.populate([
      { path: 'patientId', select: 'name email contactNumber' },
      { path: 'doctorId', select: 'name email professionalDetails' },
    ]);

    // Send notification to patient
    await notificationService.notifyMedicationDiscontinued(medication, reason);

    return medication;
  }

  /**
   * Delete discontinued medication (Doctor only)
   * @param {string} medicationId - Medication ID
   * @param {string} doctorId - Doctor ID
   * @returns {Promise<void>}
   */
  async deleteDiscontinuedMedication(medicationId, doctorId) {
    const medication = await Medication.findById(medicationId);

    if (!medication) {
      throw { statusCode: 404, message: MESSAGES.MEDICATION.NOT_FOUND };
    }

    if (medication.doctorId.toString() !== doctorId) {
      throw { statusCode: 403, message: MESSAGES.MEDICATION.DOCTOR_ONLY };
    }

    if (medication.status !== 'discontinued') {
      throw { statusCode: 400, message: 'Only discontinued medications can be deleted' };
    }

    await Reminder.deleteMany({ medicationId: medication._id });
    await Medication.findByIdAndDelete(medicationId);
  }

  /**
   * Get patient's reminders for today
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} Today's reminders
   */
  async getTodaysReminders(patientId) {
    const today = new Date();
    return await Reminder.getPatientRemindersForDate(patientId, today);
  }

  /**
   * Get patient's reminders for a date range
   * @param {string} patientId - Patient ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Reminders in range
   */
  async getReminders(patientId, startDate, endDate) {
    const query = { patientId };

    if (startDate && endDate) {
      query.reminderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return await Reminder.find(query)
      .populate('medicationId', 'medicationName dosage instructions')
      .sort({ reminderTime: 1 });
  }

  /**
   * Acknowledge reminder (Patient only)
   * @param {string} reminderId - Reminder ID
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Acknowledged reminder
   */
  async acknowledgeReminder(reminderId, patientId) {
    const reminder = await Reminder.findById(reminderId);

    if (!reminder) {
      throw { statusCode: 404, message: MESSAGES.REMINDER.NOT_FOUND };
    }

    // Verify patient access
    if (reminder.patientId.toString() !== patientId) {
      throw { statusCode: 403, message: MESSAGES.REMINDER.PATIENT_ACCESS_DENIED };
    }

    if (reminder.status === 'acknowledged') {
      throw { statusCode: 400, message: MESSAGES.REMINDER.ALREADY_ACKNOWLEDGED };
    }

    if (reminder.status === 'missed') {
      throw { statusCode: 400, message: MESSAGES.REMINDER.CANNOT_ACKNOWLEDGE_MISSED };
    }

    await reminder.acknowledge();

    await reminder.populate('medicationId', 'medicationName dosage');

    return reminder;
  }

  /**
   * Get medication adherence statistics
   * @param {string} patientId - Patient ID
   * @param {number} days - Number of days to analyze (default 7)
   * @returns {Promise<Object>} Adherence statistics
   */
  async getAdherenceStats(patientId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reminders = await Reminder.find({
      patientId,
      reminderDate: { $gte: startDate },
    });

    const total = reminders.length;
    const acknowledged = reminders.filter((r) => r.status === 'acknowledged').length;
    const missed = reminders.filter((r) => r.status === 'missed').length;
    const pending = reminders.filter((r) => r.status === 'pending').length;

    const adherenceRate = total > 0 ? ((acknowledged / (total - pending)) * 100).toFixed(2) : 0;

    return {
      period: `${days} days`,
      totalReminders: total,
      acknowledged,
      missed,
      pending,
      adherenceRate: parseFloat(adherenceRate),
    };
  }

  /**
   * Auto-complete expired medications (Maintenance task)
   * @returns {Promise<number>} Number of medications auto-completed
   */
  async autoCompleteExpiredMedications() {
    return await Medication.autoCompleteExpired();
  }

  /**
   * Mark missed reminders (Maintenance task)
   * @returns {Promise<number>} Number of reminders marked as missed
   */
  async markMissedReminders() {
    return await Reminder.markMissedReminders();
  }
}

export default new MedicationService();
