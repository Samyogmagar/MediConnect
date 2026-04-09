import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import diagnosticController from '../controllers/diagnostic.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { adminOnly, doctorOnly, labOnly } from '../middlewares/role.middleware.js';

const router = express.Router();

const reportUploadDir = path.join(process.cwd(), 'uploads', 'diagnostic-reports');
if (!fs.existsSync(reportUploadDir)) {
	fs.mkdirSync(reportUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, reportUploadDir);
	},
	filename: (_req, file, cb) => {
		const timestamp = Date.now();
		const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
		cb(null, `${timestamp}-${safeName}`);
	},
});

const uploadReport = multer({
	storage,
	limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * Diagnostic Test Routes
 * Base path: /api/diagnostics
 */

// ==================== DOCTOR ROUTES ====================

/**
 * Assign diagnostic test to patient
 * POST /api/diagnostics/assign
 * Access: Doctor only
 */
router.post('/assign', authMiddleware, doctorOnly, diagnosticController.assignTest);

/**
 * Cancel diagnostic test
 * PUT /api/diagnostics/:id/cancel
 * Access: Doctor only
 */
router.put('/:id/cancel', authMiddleware, doctorOnly, diagnosticController.cancelTest);

// ==================== LAB ROUTES ====================

/**
 * Update test status (assigned -> in_progress -> completed)
 * PUT /api/diagnostics/:id/status
 * Access: Lab only
 */
router.put('/:id/status', authMiddleware, labOnly, diagnosticController.updateTestStatus);

/**
 * Upload test report metadata
 * PUT /api/diagnostics/:id/report
 * Access: Lab only
 */
router.put('/:id/report', authMiddleware, labOnly, diagnosticController.uploadReport);
router.put('/:id/report-file', authMiddleware, labOnly, uploadReport.single('report'), diagnosticController.uploadReport);

/**
 * Get lab pending tests statistics
 * GET /api/diagnostics/lab/pending
 * Access: Lab only
 */
router.get('/lab/pending', authMiddleware, labOnly, diagnosticController.getLabPendingTests);

// ==================== ADMIN ROUTES ====================

/**
 * Get test statistics for admin dashboard
 * GET /api/diagnostics/statistics/overview
 * Access: Admin only
 */
router.get('/statistics/overview', authMiddleware, adminOnly, diagnosticController.getStatistics);

// ==================== SHARED ROUTES ====================
// Access controlled by service layer based on user role

/**
 * Get completed tests with reports
 * GET /api/diagnostics/completed
 * Access: Patient (own tests), Doctor (assigned tests), Lab (processed tests), Admin (all)
 */
router.get('/completed', authMiddleware, diagnosticController.getCompletedTests);

/**
 * Get all diagnostic tests (with role-based filtering)
 * GET /api/diagnostics
 * Access: All authenticated users (filtered by role in service layer)
 * Query params: status, urgency, testType
 */
router.get('/', authMiddleware, diagnosticController.getTests);

/**
 * Get diagnostic test by ID
 * GET /api/diagnostics/:id
 * Access: All authenticated users (access control in service layer)
 */
router.get('/:id', authMiddleware, diagnosticController.getTestById);

export default router;
