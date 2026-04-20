import express from 'express';
import appointmentController from '../controllers/appointment.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import verificationMiddleware from '../middlewares/verification.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

/**
 * Appointment Routes
 * Base path: /api/appointments
 */

// All routes require authentication
router.use(authMiddleware);

// ==================== PATIENT ROUTES ====================

/**
 * @route   POST /api/appointments/payments/khalti/initiate
 * @desc    Initiate Khalti payment for appointment booking
 * @access  Private (Patient only)
 * @body    { doctorId, dateTime, reason, paymentAmount }
 */
router.post(
  '/payments/khalti/initiate',
  roleMiddleware([ROLES.PATIENT]),
  appointmentController.initiateKhaltiPayment
);

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment request
 * @access  Private (Patient only)
 * @body    { doctorId, dateTime, reason, notes?, paymentMethod, paymentAmount, khaltiPidx? }
 */
router.post(
  '/',
  roleMiddleware([ROLES.PATIENT]),
  appointmentController.createAppointment
);

/**
 * @route   PUT /api/appointments/:id/reschedule
 * @desc    Reschedule a pending appointment
 * @access  Private (Patient only - own appointments)
 * @body    { dateTime, reason?, notes? }
 */
router.put(
  '/:id/reschedule',
  roleMiddleware([ROLES.PATIENT]),
  appointmentController.rescheduleAppointment
);

/**
 * @route   PUT /api/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Private (Patient only - own appointments)
 */
router.put(
  '/:id/cancel',
  roleMiddleware([ROLES.PATIENT]),
  appointmentController.cancelAppointment
);

// ==================== DOCTOR ROUTES ====================

/**
 * @route   PUT /api/appointments/:id/approve
 * @desc    Approve a pending appointment
 * @access  Private (Doctor only - assigned appointments, verified doctors only)
 */
router.put(
  '/:id/approve',
  roleMiddleware([ROLES.DOCTOR]),
  verificationMiddleware,
  appointmentController.approveAppointment
);

/**
 * @route   PUT /api/appointments/:id/reject
 * @desc    Reject a pending appointment
 * @access  Private (Doctor only - assigned appointments, verified doctors only)
 * @body    { rejectionReason }
 */
router.put(
  '/:id/reject',
  roleMiddleware([ROLES.DOCTOR]),
  verificationMiddleware,
  appointmentController.rejectAppointment
);

/**
 * @route   PUT /api/appointments/:id/complete
 * @desc    Complete an approved appointment
 * @access  Private (Doctor only - assigned appointments, verified doctors only)
 * @body    { completionNotes? }
 */
router.put(
  '/:id/complete',
  roleMiddleware([ROLES.DOCTOR]),
  verificationMiddleware,
  appointmentController.completeAppointment
);

/**
 * @route   PUT /api/appointments/:id/reschedule-by-doctor
 * @desc    Reschedule a pending/confirmed appointment by doctor
 * @access  Private (Doctor only - assigned appointments, verified doctors only)
 * @body    { dateTime, reason? }
 */
router.put(
  '/:id/reschedule-by-doctor',
  roleMiddleware([ROLES.DOCTOR]),
  verificationMiddleware,
  appointmentController.rescheduleAppointmentByDoctor
);

// ==================== SHARED ROUTES (Patient, Doctor, Admin) ====================

/**
 * @route   GET /api/appointments
 * @desc    Get appointments based on user role
 *          - Patient: Own appointments
 *          - Doctor: Assigned appointments
 *          - Admin: All appointments
 * @access  Private
 * @query   status?, dateFrom?, dateTo?
 */
router.get(
  '/',
  roleMiddleware([ROLES.PATIENT, ROLES.DOCTOR, ROLES.ADMIN]),
  appointmentController.getAppointments
);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment by ID
 * @access  Private (Patient: own, Doctor: assigned, Admin: all)
 */
router.get(
  '/:id',
  roleMiddleware([ROLES.PATIENT, ROLES.DOCTOR, ROLES.ADMIN]),
  appointmentController.getAppointmentById
);

export default router;
