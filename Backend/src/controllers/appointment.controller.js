import appointmentService from '../services/appointment.service.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.util.js';
import MESSAGES from '../constants/messages.js';

/**
 * Appointment Controller
 * Thin controller layer - delegates business logic to service
 */
class AppointmentController {
  /**
   * Initiate Khalti payment for appointment booking (Patient only)
   * POST /api/appointments/payments/khalti/initiate
   */
  async initiateKhaltiPayment(req, res) {
    try {
      const { doctorId, dateTime, reason, paymentAmount } = req.body;

      const errors = [];
      if (!doctorId) errors.push({ field: 'doctorId', message: MESSAGES.APPOINTMENT.DOCTOR_REQUIRED });
      if (!dateTime) errors.push({ field: 'dateTime', message: MESSAGES.APPOINTMENT.DATETIME_REQUIRED });
      if (!reason) errors.push({ field: 'reason', message: MESSAGES.APPOINTMENT.REASON_REQUIRED });
      if (errors.length > 0) {
        return validationErrorResponse(res, 'Validation failed', errors);
      }

      const payment = await appointmentService.initiateKhaltiAppointmentPayment(
        { doctorId, dateTime, reason, paymentAmount, origin: req.headers.origin },
        req.user.userId
      );

      return successResponse(res, 200, 'Khalti payment initiated successfully', { payment });
    } catch (error) {
      console.error('Initiate Khalti payment error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Create a new appointment (Patient only)
   * POST /api/appointments
   */
  async createAppointment(req, res) {
    try {
      const { doctorId, dateTime, reason, notes, paymentMethod, khaltiPidx, followUpOf } = req.body;

      // Validation
      const errors = [];
      if (!doctorId) errors.push({ field: 'doctorId', message: MESSAGES.APPOINTMENT.DOCTOR_REQUIRED });
      if (!dateTime) errors.push({ field: 'dateTime', message: MESSAGES.APPOINTMENT.DATETIME_REQUIRED });
      if (!reason) errors.push({ field: 'reason', message: MESSAGES.APPOINTMENT.REASON_REQUIRED });
      if (!paymentMethod) {
        errors.push({ field: 'paymentMethod', message: MESSAGES.APPOINTMENT.PAYMENT_METHOD_REQUIRED });
      }
      if (paymentMethod === 'khalti' && !khaltiPidx) {
        errors.push({ field: 'khaltiPidx', message: MESSAGES.APPOINTMENT.KHALTI_PIDX_REQUIRED });
      }

      if (errors.length > 0) {
        return validationErrorResponse(res, 'Validation failed', errors);
      }

      const appointment = await appointmentService.createAppointment(
        { doctorId, dateTime, reason, notes, paymentMethod, khaltiPidx, followUpOf },
        req.user.userId
      );

      return successResponse(res, 201, MESSAGES.APPOINTMENT.CREATED, { appointment });
    } catch (error) {
      console.error('Create appointment error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get all appointments for the current user
   * GET /api/appointments
   */
  async getAppointments(req, res) {
    try {
      const { status, dateFrom, dateTo } = req.query;
      const filters = { status, dateFrom, dateTo };

      const appointments = await appointmentService.getAppointments(
        req.user.userId,
        req.user.role,
        filters
      );

      return successResponse(res, 200, 'Appointments retrieved successfully', {
        appointments,
        count: appointments.length,
      });
    } catch (error) {
      console.error('Get appointments error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get appointment by ID
   * GET /api/appointments/:id
   */
  async getAppointmentById(req, res) {
    try {
      const { id } = req.params;

      const appointment = await appointmentService.getAppointmentById(
        id,
        req.user.userId,
        req.user.role
      );

      return successResponse(res, 200, 'Appointment retrieved successfully', { appointment });
    } catch (error) {
      console.error('Get appointment error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Reschedule appointment (Patient only)
   * PUT /api/appointments/:id/reschedule
   */
  async rescheduleAppointment(req, res) {
    try {
      const { id } = req.params;
      const { dateTime, reason, notes } = req.body;

      if (!dateTime) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'dateTime', message: MESSAGES.APPOINTMENT.DATETIME_REQUIRED },
        ]);
      }

      const appointment = await appointmentService.rescheduleAppointment(
        id,
        req.user.userId,
        { dateTime, reason, notes }
      );

      return successResponse(res, 200, MESSAGES.APPOINTMENT.UPDATED, { appointment });
    } catch (error) {
      console.error('Reschedule appointment error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Cancel appointment (Patient only)
   * PUT /api/appointments/:id/cancel
   */
  async cancelAppointment(req, res) {
    try {
      const { id } = req.params;

      const appointment = await appointmentService.cancelAppointment(id, req.user.userId);

      return successResponse(res, 200, MESSAGES.APPOINTMENT.CANCELLED, { appointment });
    } catch (error) {
      console.error('Cancel appointment error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Approve appointment (Doctor only)
   * PUT /api/appointments/:id/approve
   */
  async approveAppointment(req, res) {
    try {
      const { id } = req.params;

      const appointment = await appointmentService.approveAppointment(id, req.user.userId);

      return successResponse(res, 200, MESSAGES.APPOINTMENT.APPROVED, { appointment });
    } catch (error) {
      console.error('Approve appointment error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Reject appointment (Doctor only)
   * PUT /api/appointments/:id/reject
   */
  async rejectAppointment(req, res) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'rejectionReason', message: 'Rejection reason is required' },
        ]);
      }

      const appointment = await appointmentService.rejectAppointment(
        id,
        req.user.userId,
        rejectionReason
      );

      return successResponse(res, 200, MESSAGES.APPOINTMENT.REJECTED, { appointment });
    } catch (error) {
      console.error('Reject appointment error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Complete appointment (Doctor only)
   * PUT /api/appointments/:id/complete
   */
  async completeAppointment(req, res) {
    try {
      const { id } = req.params;
      const { completionNotes } = req.body;

      const appointment = await appointmentService.completeAppointment(
        id,
        req.user.userId,
        completionNotes
      );

      return successResponse(res, 200, MESSAGES.APPOINTMENT.COMPLETED, { appointment });
    } catch (error) {
      console.error('Complete appointment error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Reschedule appointment (Doctor only)
   * PUT /api/appointments/:id/reschedule-by-doctor
   */
  async rescheduleAppointmentByDoctor(req, res) {
    try {
      const { id } = req.params;
      const { dateTime, reason, notes } = req.body;

      if (!dateTime) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'dateTime', message: MESSAGES.APPOINTMENT.DATETIME_REQUIRED },
        ]);
      }

      const appointment = await appointmentService.rescheduleAppointmentByDoctor(
        id,
        req.user.userId,
        { dateTime, reason, notes }
      );

      return successResponse(res, 200, MESSAGES.APPOINTMENT.UPDATED, { appointment });
    } catch (error) {
      console.error('Doctor reschedule appointment error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }
}

export default new AppointmentController();
