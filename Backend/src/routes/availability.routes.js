import express from 'express';
import availabilityController from '../controllers/availability.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import verificationMiddleware from '../middlewares/verification.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

router.use(authMiddleware);

// Doctor availability management
router.get(
  '/me',
  roleMiddleware([ROLES.DOCTOR]),
  verificationMiddleware,
  availabilityController.getMyAvailability
);

router.put(
  '/me',
  roleMiddleware([ROLES.DOCTOR]),
  verificationMiddleware,
  availabilityController.updateMyAvailability
);

// Patient/doctor/admin visibility for doctor schedules
router.get(
  '/doctors/:doctorId',
  roleMiddleware([ROLES.PATIENT, ROLES.DOCTOR, ROLES.ADMIN]),
  availabilityController.getDoctorAvailability
);

router.get(
  '/doctors/:doctorId/slots',
  roleMiddleware([ROLES.PATIENT, ROLES.DOCTOR, ROLES.ADMIN]),
  availabilityController.getDoctorSlots
);

// Admin update for doctor availability
router.put(
  '/doctors/:doctorId',
  roleMiddleware([ROLES.ADMIN]),
  availabilityController.updateDoctorAvailability
);

export default router;
