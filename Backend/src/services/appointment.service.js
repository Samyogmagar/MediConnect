import Appointment from '../models/Appointment.model.js';
import User from '../models/User.model.js';
import { ROLES } from '../constants/roles.js';
import MESSAGES from '../constants/messages.js';
import notificationService from './notification.service.js';
import paymentService from './payment.service.js';
import env from '../config/env.js';
import availabilityService from './availability.service.js';

/**
 * Appointment Service
 * Contains all business logic for appointment management
 */
class AppointmentService {
  async _validateBookableSlot({ userId, doctorId, dateTime }) {
    const patient = await User.findById(userId);
    if (!patient || patient.role !== ROLES.PATIENT) {
      throw { statusCode: 403, message: MESSAGES.APPOINTMENT.PATIENT_ONLY };
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== ROLES.DOCTOR) {
      throw { statusCode: 404, message: 'Doctor not found' };
    }

    if (!doctor.isVerified) {
      throw { statusCode: 400, message: 'Doctor is not verified yet' };
    }

    const appointmentDate = new Date(dateTime);
    if (appointmentDate <= new Date()) {
      throw { statusCode: 400, message: MESSAGES.APPOINTMENT.PAST_DATE };
    }

    await availabilityService.ensureSlotIsAvailable(doctorId, appointmentDate);

    const existingAppointment = await Appointment.findOne({
      doctorId,
      dateTime: appointmentDate,
      status: { $in: ['pending', 'confirmed', 'approved'] },
    });

    if (existingAppointment) {
      throw { statusCode: 409, message: MESSAGES.APPOINTMENT.ALREADY_BOOKED };
    }

    const fee = Number(doctor?.professionalDetails?.consultationFee) || env.DEFAULT_CONSULTATION_FEE;

    return { patient, doctor, appointmentDate, consultationFee: fee };
  }

  async initiateKhaltiAppointmentPayment(payload, userId) {
    const { doctorId, dateTime, reason, paymentAmount, origin } = payload;

    const { patient, consultationFee } = await this._validateBookableSlot({ userId, doctorId, dateTime });

    const amount = Number(consultationFee);

    // Validate that submitted amount matches doctor's fee (if provided from frontend)
    if (paymentAmount && Number(paymentAmount) !== amount) {
      throw {
        statusCode: 400,
        message: `Invalid payment amount. Expected NPR ${amount} but got NPR ${paymentAmount}`,
      };
    }

    const orderId = `APPT-${userId}-${Date.now()}`;

    const customerInfo = {
      name: patient.name || 'MediConnect User',
    };
    if (patient.email) customerInfo.email = patient.email;
    if (patient.phone) customerInfo.phone = patient.phone;

    const websiteUrl = origin || env.FRONTEND_URL;
    const returnUrl = `${websiteUrl}/patient/book-appointment/${doctorId}`;

    if (!websiteUrl) {
      throw { statusCode: 500, message: 'Frontend URL is not configured for Khalti payments' };
    }

    const initiation = await paymentService.initiateKhaltiPayment({
      amount,
      purchaseOrderId: orderId,
      purchaseOrderName: `Appointment booking - ${reason || 'Consultation'}`,
      customerInfo,
      returnUrl,
      websiteUrl,
    });

    return {
      ...initiation,
      orderId,
    };
  }

  /**
   * Create a new appointment (Patient only)
   * @param {Object} appointmentData - Appointment data
   * @param {string} userId - Patient user ID
   * @returns {Object} Created appointment
   */
  async createAppointment(appointmentData, userId) {
    const { doctorId, dateTime, reason, notes, paymentMethod, khaltiPidx, followUpOf } = appointmentData;
    const { appointmentDate, consultationFee } = await this._validateBookableSlot({ userId, doctorId, dateTime });

    const amount = Number(consultationFee);

    let payment;
    if (paymentMethod === 'khalti') {
      const verification = await paymentService.verifyKhaltiPayment({ pidx: khaltiPidx, amount });
      payment = {
        method: 'khalti',
        provider: 'khalti',
        status: verification.verified ? 'completed' : 'failed',
        amount,
        currency: 'NPR',
        transactionId: verification.transactionId,
        khaltiPidx: verification.pidx,
        paidAt: new Date(),
      };
    } else if (paymentMethod === 'cod') {
      payment = paymentService.buildCodPayment(amount);
    } else {
      throw { statusCode: 400, message: MESSAGES.APPOINTMENT.PAYMENT_METHOD_REQUIRED };
    }

    if (payment.status !== 'completed') {
      throw { statusCode: 400, message: MESSAGES.APPOINTMENT.PAYMENT_NOT_COMPLETED };
    }

    let followUpAppointmentId = undefined;
    if (followUpOf) {
      const baseAppointment = await Appointment.findById(followUpOf);
      if (!baseAppointment) {
        throw { statusCode: 404, message: 'Follow-up base appointment not found' };
      }

      if (baseAppointment.patientId.toString() !== userId) {
        throw { statusCode: 403, message: MESSAGES.APPOINTMENT.PATIENT_ACCESS_DENIED };
      }

      if (baseAppointment.doctorId.toString() !== doctorId) {
        throw { statusCode: 400, message: 'Follow-up must be booked with the same doctor' };
      }

      if (baseAppointment.status !== 'completed') {
        throw { statusCode: 400, message: 'Follow-up can only be created from completed consultations' };
      }

      followUpAppointmentId = baseAppointment._id;
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: userId,
      doctorId,
      followUpOf: followUpAppointmentId,
      dateTime: appointmentDate,
      reason,
      notes,
      status: 'pending',
      payment,
    });

    // Populate patient and doctor details
    await appointment.populate([
      { path: 'patientId', select: 'name email phone' },
      { path: 'doctorId', select: 'name email professionalDetails' },
    ]);

    // Keep booking successful even if downstream notification channels fail.
    try {
      await notificationService.notifyAppointmentCreated(appointment);
    } catch (notificationError) {
      console.error(
        'Appointment notification dispatch failed:',
        notificationError?.message || notificationError
      );
    }

    return appointment;
  }

  /**
   * Get appointments by user role
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @param {Object} filters - Optional filters
   * @returns {Array} List of appointments
   */
  async getAppointments(userId, role, filters = {}) {
    let query = {};

    // Apply role-based filtering
    if (role === ROLES.PATIENT) {
      query.patientId = userId;
    } else if (role === ROLES.DOCTOR) {
      query.doctorId = userId;
    }
    // Admin can see all appointments (no filter)

    // Apply additional filters
    if (filters.status) {
      if (filters.status === 'confirmed') {
        query.status = { $in: ['confirmed', 'approved'] };
      } else if (filters.status === 'cancelled') {
        query.status = { $in: ['cancelled', 'rejected'] };
      } else {
        query.status = filters.status;
      }
    }
    if (filters.dateFrom) {
      query.dateTime = { ...query.dateTime, $gte: new Date(filters.dateFrom) };
    }
    if (filters.dateTo) {
      query.dateTime = { ...query.dateTime, $lte: new Date(filters.dateTo) };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone profileImageUrl address dateOfBirth gender bloodGroup allergies medicalHistory')
      .populate('doctorId', 'name email professionalDetails profileImageUrl')
      .populate('followUpOf', 'dateTime status reason')
      .sort({ dateTime: -1 });

    return appointments;
  }

  /**
   * Get appointment by ID with access control
   * @param {string} appointmentId - Appointment ID
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @returns {Object} Appointment
   */
  async getAppointmentById(appointmentId, userId, role) {
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email professionalDetails');
      

    if (!appointment) {
      throw { statusCode: 404, message: MESSAGES.APPOINTMENT.NOT_FOUND };
    }

    // Access control
    if (role === ROLES.PATIENT && appointment.patientId._id.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.APPOINTMENT.PATIENT_ACCESS_DENIED };
    }

    if (role === ROLES.DOCTOR && appointment.doctorId._id.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.APPOINTMENT.DOCTOR_ACCESS_DENIED };
    }

    return appointment;
  }

  /**
   * Reschedule appointment (Patient only, only pending appointments)
   * @param {string} appointmentId - Appointment ID
   * @param {string} userId - Patient user ID
   * @param {Object} updateData - New date/time
   * @returns {Object} Updated appointment
   */
  async rescheduleAppointment(appointmentId, userId, updateData) {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw { statusCode: 404, message: MESSAGES.APPOINTMENT.NOT_FOUND };
    }

    // Only patient can reschedule
    if (appointment.patientId.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.APPOINTMENT.PATIENT_ACCESS_DENIED };
    }

    // Only pending appointments can be rescheduled
    if (appointment.status !== 'pending') {
      throw { statusCode: 400, message: MESSAGES.APPOINTMENT.CANNOT_MODIFY };
    }

    const newDateTime = new Date(updateData.dateTime);

    // Check if new date is in the future
    if (newDateTime <= new Date()) {
      throw { statusCode: 400, message: MESSAGES.APPOINTMENT.PAST_DATE };
    }

    await availabilityService.ensureSlotIsAvailable(appointment.doctorId, newDateTime);

    // Check for double booking at new time
    const existingAppointment = await Appointment.findOne({
      _id: { $ne: appointmentId },
      doctorId: appointment.doctorId,
      dateTime: newDateTime,
      status: { $in: ['pending', 'confirmed', 'approved'] },
    });

    if (existingAppointment) {
      throw { statusCode: 409, message: MESSAGES.APPOINTMENT.ALREADY_BOOKED };
    }

    appointment.dateTime = newDateTime;
    if (updateData.reason) appointment.reason = updateData.reason;
    if (updateData.notes) appointment.notes = updateData.notes;

    await appointment.save();
    await appointment.populate([
      { path: 'patientId', select: 'name email phone' },
      { path: 'doctorId', select: 'name email professionalDetails' },
    ]);

    return appointment;
  }

  /**
   * Cancel appointment (Patient only)
   * @param {string} appointmentId - Appointment ID
   * @param {string} userId - Patient user ID
   * @returns {Object} Cancelled appointment
   */
  async cancelAppointment(appointmentId, userId) {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw { statusCode: 404, message: MESSAGES.APPOINTMENT.NOT_FOUND };
    }

    // Only patient can cancel
    if (appointment.patientId.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.APPOINTMENT.PATIENT_ACCESS_DENIED };
    }

    // Cannot cancel completed or already cancelled appointments
    if (['completed', 'cancelled'].includes(appointment.status)) {
      throw { statusCode: 400, message: MESSAGES.APPOINTMENT.CANNOT_MODIFY };
    }

    appointment.status = 'cancelled';
    await appointment.save();
    await appointment.populate([
      { path: 'patientId', select: 'name email phone' },
      { path: 'doctorId', select: 'name email professionalDetails' },
    ]);

    // Send notification to the other party
    await notificationService.notifyAppointmentCancelled(appointment, userId);

    return appointment;
  }

  /**
   * Approve appointment (Doctor only)
   * @param {string} appointmentId - Appointment ID
   * @param {string} userId - Doctor user ID
   * @returns {Object} Approved appointment
   */
  async approveAppointment(appointmentId, userId) {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw { statusCode: 404, message: MESSAGES.APPOINTMENT.NOT_FOUND };
    }

    // Only assigned doctor can approve
    if (appointment.doctorId.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.APPOINTMENT.DOCTOR_ACCESS_DENIED };
    }

    // Only pending appointments can be approved
    if (appointment.status !== 'pending') {
      throw { statusCode: 400, message: MESSAGES.APPOINTMENT.CANNOT_MODIFY };
    }

    appointment.status = 'confirmed';
    await appointment.save();
    await appointment.populate([
      { path: 'patientId', select: 'name email phone' },
      { path: 'doctorId', select: 'name email professionalDetails' },
    ]);

    // Send notification to patient
    await notificationService.notifyAppointmentApproved(appointment);

    return appointment;
  }

  /**
   * Reject appointment (Doctor only)
   * @param {string} appointmentId - Appointment ID
   * @param {string} userId - Doctor user ID
   * @param {string} rejectionReason - Reason for rejection
   * @returns {Object} Rejected appointment
   */
  async rejectAppointment(appointmentId, userId, rejectionReason) {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw { statusCode: 404, message: MESSAGES.APPOINTMENT.NOT_FOUND };
    }

    // Only assigned doctor can reject
    if (appointment.doctorId.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.APPOINTMENT.DOCTOR_ACCESS_DENIED };
    }

    // Only pending appointments can be rejected
    if (appointment.status !== 'pending') {
      throw { statusCode: 400, message: MESSAGES.APPOINTMENT.CANNOT_MODIFY };
    }

    appointment.status = 'cancelled';
    appointment.rejectionReason = rejectionReason;
    await appointment.save();
    await appointment.populate([
      { path: 'patientId', select: 'name email phone' },
      { path: 'doctorId', select: 'name email professionalDetails' },
    ]);

    // Send notification to patient
    await notificationService.notifyAppointmentRejected(appointment, rejectionReason);

    return appointment;
  }

  /**
   * Complete appointment (Doctor only)
   * @param {string} appointmentId - Appointment ID
   * @param {string} userId - Doctor user ID
   * @param {string} completionNotes - Notes after completing appointment
   * @returns {Object} Completed appointment
   */
  async completeAppointment(appointmentId, userId, completionNotes) {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw { statusCode: 404, message: MESSAGES.APPOINTMENT.NOT_FOUND };
    }

    // Only assigned doctor can complete
    if (appointment.doctorId.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.APPOINTMENT.DOCTOR_ACCESS_DENIED };
    }

    // Only approved appointments can be completed
    if (!['confirmed', 'approved'].includes(appointment.status)) {
      throw { statusCode: 400, message: 'Only confirmed appointments can be completed' };
    }

    appointment.status = 'completed';
    appointment.completionNotes = completionNotes;
    await appointment.save();
    await appointment.populate([
      { path: 'patientId', select: 'name email phone' },
      { path: 'doctorId', select: 'name email professionalDetails' },
    ]);

    // Send notification to patient
    await notificationService.notifyAppointmentCompleted(appointment);

    return appointment;
  }

  /**
   * Reschedule appointment (Doctor only)
   * @param {string} appointmentId - Appointment ID
   * @param {string} userId - Doctor user ID
   * @param {Object} updateData - New date/time and optional reason
   * @returns {Object} Updated appointment
   */
  async rescheduleAppointmentByDoctor(appointmentId, userId, updateData) {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw { statusCode: 404, message: MESSAGES.APPOINTMENT.NOT_FOUND };
    }

    if (appointment.doctorId.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.APPOINTMENT.DOCTOR_ACCESS_DENIED };
    }

    if (!['pending', 'confirmed', 'approved'].includes(appointment.status)) {
      throw { statusCode: 400, message: MESSAGES.APPOINTMENT.CANNOT_MODIFY };
    }

    const newDateTime = new Date(updateData.dateTime);
    if (Number.isNaN(newDateTime.getTime())) {
      throw { statusCode: 400, message: MESSAGES.APPOINTMENT.DATETIME_REQUIRED };
    }

    if (newDateTime <= new Date()) {
      throw { statusCode: 400, message: MESSAGES.APPOINTMENT.PAST_DATE };
    }

    await availabilityService.ensureSlotIsAvailable(appointment.doctorId, newDateTime);

    const existingAppointment = await Appointment.findOne({
      _id: { $ne: appointmentId },
      doctorId: appointment.doctorId,
      dateTime: newDateTime,
      status: { $in: ['pending', 'confirmed', 'approved'] },
    });

    if (existingAppointment) {
      throw { statusCode: 409, message: MESSAGES.APPOINTMENT.ALREADY_BOOKED };
    }

    const previousDateTime = appointment.dateTime;

    appointment.dateTime = newDateTime;
    appointment.status = 'confirmed';
    if (updateData.reason) {
      const reasonNote = `Doctor reschedule reason: ${updateData.reason}`;
      appointment.notes = appointment.notes ? `${appointment.notes}\n${reasonNote}` : reasonNote;
    }
    if (updateData.notes) {
      const detailsNote = `Doctor reschedule notes: ${updateData.notes}`;
      appointment.notes = appointment.notes ? `${appointment.notes}\n${detailsNote}` : detailsNote;
    }

    await appointment.save();
    await appointment.populate([
      { path: 'patientId', select: 'name email phone' },
      { path: 'doctorId', select: 'name email professionalDetails' },
    ]);

    await notificationService.notifyAppointmentRescheduled(
      appointment,
      previousDateTime,
      userId,
      updateData.reason || ''
    );

    return appointment;
  }
}

export default new AppointmentService();
