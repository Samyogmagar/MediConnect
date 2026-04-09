import express from 'express';
import medicalRecordController from '../controllers/medicalRecord.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/medical-records/:patientId
 * @desc    Get medical record for a patient
 * @access  Private (Doctor, Patient self, Admin)
 */
router.get('/:patientId', medicalRecordController.getMedicalRecord);

/**
 * @route   POST /api/medical-records/:patientId/vitals
 * @desc    Add vital signs
 * @access  Private (Doctor, Admin)
 */
router.post(
  '/:patientId/vitals',
  roleMiddleware([ROLES.DOCTOR, ROLES.ADMIN]),
  medicalRecordController.addVitalSigns
);

/**
 * @route   GET /api/medical-records/:patientId/vitals/history
 * @desc    Get vital signs history
 * @access  Private
 */
router.get('/:patientId/vitals/history', medicalRecordController.getVitalHistory);

/**
 * @route   POST /api/medical-records/:patientId/allergies
 * @desc    Add allergy
 * @access  Private (Doctor, Admin)
 */
router.post(
  '/:patientId/allergies',
  roleMiddleware([ROLES.DOCTOR, ROLES.ADMIN]),
  medicalRecordController.addAllergy
);

/**
 * @route   PUT /api/medical-records/:patientId/allergies/:allergyId
 * @desc    Update allergy
 * @access  Private (Doctor, Admin)
 */
router.put(
  '/:patientId/allergies/:allergyId',
  roleMiddleware([ROLES.DOCTOR, ROLES.ADMIN]),
  medicalRecordController.updateAllergy
);

/**
 * @route   DELETE /api/medical-records/:patientId/allergies/:allergyId
 * @desc    Delete allergy
 * @access  Private (Doctor, Admin)
 */
router.delete(
  '/:patientId/allergies/:allergyId',
  roleMiddleware([ROLES.DOCTOR, ROLES.ADMIN]),
  medicalRecordController.deleteAllergy
);

/**
 * @route   GET /api/medical-records/:patientId/allergies/active
 * @desc    Get active allergies
 * @access  Private
 */
router.get('/:patientId/allergies/active', medicalRecordController.getActiveAllergies);

/**
 * @route   POST /api/medical-records/:patientId/conditions
 * @desc    Add medical condition
 * @access  Private (Doctor, Admin)
 */
router.post(
  '/:patientId/conditions',
  roleMiddleware([ROLES.DOCTOR, ROLES.ADMIN]),
  medicalRecordController.addCondition
);

/**
 * @route   PUT /api/medical-records/:patientId/conditions/:conditionId
 * @desc    Update medical condition
 * @access  Private (Doctor, Admin)
 */
router.put(
  '/:patientId/conditions/:conditionId',
  roleMiddleware([ROLES.DOCTOR, ROLES.ADMIN]),
  medicalRecordController.updateCondition
);

/**
 * @route   DELETE /api/medical-records/:patientId/conditions/:conditionId
 * @desc    Delete medical condition
 * @access  Private (Doctor, Admin)
 */
router.delete(
  '/:patientId/conditions/:conditionId',
  roleMiddleware([ROLES.DOCTOR, ROLES.ADMIN]),
  medicalRecordController.deleteCondition
);

/**
 * @route   GET /api/medical-records/:patientId/conditions/active
 * @desc    Get active conditions
 * @access  Private
 */
router.get('/:patientId/conditions/active', medicalRecordController.getActiveConditions);

/**
 * @route   POST /api/medical-records/:patientId/immunizations
 * @desc    Add immunization record
 * @access  Private (Doctor, Admin)
 */
router.post(
  '/:patientId/immunizations',
  roleMiddleware([ROLES.DOCTOR, ROLES.ADMIN]),
  medicalRecordController.addImmunization
);

/**
 * @route   PUT /api/medical-records/:patientId/immunizations/:immunizationId
 * @desc    Update immunization record
 * @access  Private (Doctor, Admin)
 */
router.put(
  '/:patientId/immunizations/:immunizationId',
  roleMiddleware([ROLES.DOCTOR, ROLES.ADMIN]),
  medicalRecordController.updateImmunization
);

/**
 * @route   DELETE /api/medical-records/:patientId/immunizations/:immunizationId
 * @desc    Delete immunization record
 * @access  Private (Doctor, Admin)
 */
router.delete(
  '/:patientId/immunizations/:immunizationId',
  roleMiddleware([ROLES.DOCTOR, ROLES.ADMIN]),
  medicalRecordController.deleteImmunization
);

/**
 * @route   POST /api/medical-records/:patientId/lab-results
 * @desc    Add lab result
 * @access  Private (Doctor, Lab, Admin)
 */
router.post(
  '/:patientId/lab-results',
  roleMiddleware([ROLES.DOCTOR, ROLES.LAB, ROLES.ADMIN]),
  medicalRecordController.addLabResult
);

/**
 * @route   PUT /api/medical-records/:patientId/lab-results/:labResultId
 * @desc    Update lab result
 * @access  Private (Doctor, Lab, Admin)
 */
router.put(
  '/:patientId/lab-results/:labResultId',
  roleMiddleware([ROLES.DOCTOR, ROLES.LAB, ROLES.ADMIN]),
  medicalRecordController.updateLabResult
);

/**
 * @route   DELETE /api/medical-records/:patientId/lab-results/:labResultId
 * @desc    Delete lab result
 * @access  Private (Doctor, Lab, Admin)
 */
router.delete(
  '/:patientId/lab-results/:labResultId',
  roleMiddleware([ROLES.DOCTOR, ROLES.LAB, ROLES.ADMIN]),
  medicalRecordController.deleteLabResult
);

/**
 * @route   PUT /api/medical-records/:patientId/general
 * @desc    Update general medical record information
 * @access  Private (Doctor, Admin)
 */
router.put(
  '/:patientId/general',
  roleMiddleware([ROLES.DOCTOR, ROLES.ADMIN]),
  medicalRecordController.updateGeneralInfo
);

export default router;
