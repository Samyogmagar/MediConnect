import express from 'express';
import roleApplicationController from '../controllers/roleApplication.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { adminOnly, patientOnly } from '../middlewares/role.middleware.js';

const router = express.Router();

/**
 * Role Application Routes
 * Base path: /api/role-applications
 */

// Patient routes - Submit, update, delete applications
router.post('/', authMiddleware, patientOnly, roleApplicationController.submitApplication);
router.put('/:id', authMiddleware, patientOnly, roleApplicationController.updateApplication);
router.delete('/:id', authMiddleware, patientOnly, roleApplicationController.deleteApplication);

// Admin routes - Review and manage applications
router.put('/:id/approve', authMiddleware, adminOnly, roleApplicationController.approveApplication);
router.put('/:id/reject', authMiddleware, adminOnly, roleApplicationController.rejectApplication);
router.get('/statistics/pending', authMiddleware, adminOnly, roleApplicationController.getPendingCount);

// Shared routes - View applications (access controlled by service layer)
router.get('/', authMiddleware, roleApplicationController.getApplications);
router.get('/:id', authMiddleware, roleApplicationController.getApplicationById);

export default router;
