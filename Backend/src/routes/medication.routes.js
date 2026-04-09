import express from 'express';
import medicationController from '../controllers/medication.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { doctorOnly } from '../middlewares/role.middleware.js';

const router = express.Router();

/**
 * Medication Routes
 * Base path: /api/medications
 */

// ==================== DOCTOR ROUTES ====================

/**
 * Prescribe medication to patient
 * POST /api/medications/prescribe
 * Access: Doctor only
 */
router.post('/prescribe', authMiddleware, doctorOnly, medicationController.prescribeMedication);

/**
 * Update medication details
 * PUT /api/medications/:id
 * Access: Doctor only (prescribing doctor)
 */
router.put('/:id', authMiddleware, doctorOnly, medicationController.updateMedication);

/**
 * Discontinue medication
 * PUT /api/medications/:id/discontinue
 * Access: Doctor only (prescribing doctor)
 */
router.put('/:id/discontinue', authMiddleware, doctorOnly, medicationController.discontinueMedication);

/**
 * Delete a discontinued medication
 * DELETE /api/medications/:id
 * Access: Doctor only (prescribing doctor)
 */
router.delete('/:id', authMiddleware, doctorOnly, medicationController.deleteDiscontinuedMedication);

/**
 * Delete a discontinued medication (explicit route)
 * DELETE /api/medications/discontinued/:id
 * Access: Doctor only (prescribing doctor)
 */
router.delete('/discontinued/:id', authMiddleware, doctorOnly, medicationController.deleteDiscontinuedMedication);

// ==================== PATIENT ROUTES ====================

/**
 * Acknowledge reminder (mark as taken)
 * PUT /api/medications/reminders/:id/acknowledge
 * Access: Patient only (own reminders)
 */
router.put('/reminders/:id/acknowledge', authMiddleware, medicationController.acknowledgeReminder);

// ==================== SHARED ROUTES ====================
// Access controlled by service layer based on user role

/**
 * Get active medications
 * GET /api/medications/active
 * Access: Patient (own medications), Doctor (specify patientId), Admin (all)
 * Query params: patientId (required for doctor/admin)
 */
router.get('/active', authMiddleware, medicationController.getActiveMedications);

/**
 * Get today's reminders
 * GET /api/medications/reminders/today
 * Access: Patient (own reminders), Doctor (specify patientId), Admin (all)
 * Query params: patientId (required for doctor/admin)
 */
router.get('/reminders/today', authMiddleware, medicationController.getTodaysReminders);

/**
 * Get reminders for date range
 * GET /api/medications/reminders
 * Access: Patient (own reminders), Doctor (specify patientId), Admin (all)
 * Query params: patientId, startDate, endDate
 */
router.get('/reminders', authMiddleware, medicationController.getReminders);

/**
 * Get medication adherence statistics
 * GET /api/medications/adherence
 * Access: Patient (own stats), Doctor (specify patientId), Admin (all)
 * Query params: patientId (required for doctor/admin), days (default 7)
 */
router.get('/adherence', authMiddleware, medicationController.getAdherenceStats);

/**
 * Get all medications (with role-based filtering)
 * GET /api/medications
 * Access: All authenticated users (filtered by role in service layer)
 * Query params: status (active, completed, discontinued)
 */
router.get('/', authMiddleware, medicationController.getMedications);

/**
 * Get medication by ID
 * GET /api/medications/:id
 * Access: All authenticated users (access control in service layer)
 */
router.get('/:id', authMiddleware, medicationController.getMedicationById);

export default router;
