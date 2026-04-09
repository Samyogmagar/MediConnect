import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import verificationMiddleware from '../middlewares/verification.middleware.js';
import {
  patientDashboard,
  doctorDashboard,
  labDashboard,
  adminDashboard,
  superAdminDashboard,
} from '../controllers/dashboard.controller.js';

const router = Router();

// All dashboard routes require authentication
router.use(authMiddleware);

// Patient dashboard — patients only
router.get('/patient', roleMiddleware(['patient']), patientDashboard);

// Doctor dashboard — verified doctors only
router.get('/doctor', roleMiddleware(['doctor']), verificationMiddleware, doctorDashboard);

// Lab dashboard — verified labs only
router.get('/lab', roleMiddleware(['lab']), verificationMiddleware, labDashboard);

// Admin dashboard
router.get('/admin', roleMiddleware(['admin']), adminDashboard);

// Super admin dashboard (admin role with extended metrics)
router.get('/super-admin', roleMiddleware(['admin']), superAdminDashboard);

export default router;
