import diagnosticService from '../services/diagnostic.service.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.util.js';
import MESSAGES from '../constants/messages.js';

/**
 * Diagnostic Test Controller
 * Thin controller layer - delegates business logic to service
 */
class DiagnosticController {
  /**
   * Assign a diagnostic test to a patient (Doctor only)
   * POST /api/diagnostics/assign
   */
  async assignTest(req, res) {
    try {
      const { patientId, labId, testName, testType, description, urgency, instructions, estimatedCompletionDate, appointmentId } =
        req.body;

      // Validation
      const errors = [];
      if (!patientId) errors.push({ field: 'patientId', message: MESSAGES.DIAGNOSTIC.PATIENT_REQUIRED });
      if (!labId) errors.push({ field: 'labId', message: MESSAGES.DIAGNOSTIC.LAB_REQUIRED });
      if (!testName) errors.push({ field: 'testName', message: MESSAGES.DIAGNOSTIC.TEST_NAME_REQUIRED });
      if (!testType) errors.push({ field: 'testType', message: MESSAGES.DIAGNOSTIC.TEST_TYPE_REQUIRED });
      if (!appointmentId) errors.push({ field: 'appointmentId', message: 'Appointment ID is required' });

      if (errors.length > 0) {
        return validationErrorResponse(res, 'Validation failed', errors);
      }

      const test = await diagnosticService.assignTest(
        {
          patientId,
          labId,
          testName,
          testType,
          description,
          urgency,
          instructions,
          estimatedCompletionDate,
          appointmentId,
        },
        req.user.userId
      );

      return successResponse(res, 201, MESSAGES.DIAGNOSTIC.ASSIGNED, { test });
    } catch (error) {
      console.error('Assign test error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get diagnostic tests with filters
   * GET /api/diagnostics
   */
  async getTests(req, res) {
    try {
      const { status, urgency, testType, patientId } = req.query;
      const filters = { status, urgency, testType, patientId };

      const tests = await diagnosticService.getTests(filters, req.user.userId, req.user.role);

      return successResponse(res, 200, 'Diagnostic tests retrieved successfully', {
        tests,
        count: tests.length,
      });
    } catch (error) {
      console.error('Get tests error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get diagnostic test by ID
   * GET /api/diagnostics/:id
   */
  async getTestById(req, res) {
    try {
      const { id } = req.params;

      const test = await diagnosticService.getTestById(id, req.user.userId, req.user.role);

      return successResponse(res, 200, 'Diagnostic test retrieved successfully', { test });
    } catch (error) {
      console.error('Get test by ID error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Update test status (Lab only)
   * PUT /api/diagnostics/:id/status
   */
  async updateTestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'status', message: MESSAGES.DIAGNOSTIC.INVALID_STATUS },
        ]);
      }

      const test = await diagnosticService.updateTestStatus(id, status, req.user.userId, notes);

      return successResponse(res, 200, MESSAGES.DIAGNOSTIC.UPDATED, { test });
    } catch (error) {
      console.error('Update test status error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Upload test report (Lab only)
   * PUT /api/diagnostics/:id/report
   */
  async uploadReport(req, res) {
    try {
      const { id } = req.params;
      const { filename, url, fileSize, mimeType, findings, recommendations, notes } = req.body;

      let resolvedUrl = url;
      let resolvedFilename = filename;
      let resolvedFileSize = fileSize;
      let resolvedMimeType = mimeType;

      if (req.file) {
        resolvedUrl = `/uploads/diagnostic-reports/${req.file.filename}`;
        resolvedFilename = req.file.originalname;
        resolvedFileSize = req.file.size;
        resolvedMimeType = req.file.mimetype;
      }

      if (!resolvedUrl) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'report', message: MESSAGES.DIAGNOSTIC.REPORT_URL_REQUIRED },
        ]);
      }

      const test = await diagnosticService.uploadReport(
        id,
        {
          filename: resolvedFilename,
          url: resolvedUrl,
          fileSize: resolvedFileSize,
          mimeType: resolvedMimeType,
          findings,
          recommendations,
          notes,
        },
        req.user.userId
      );

      return successResponse(res, 200, MESSAGES.DIAGNOSTIC.REPORT_UPLOADED, { test });
    } catch (error) {
      console.error('Upload report error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get completed tests with reports
   * GET /api/diagnostics/completed
   */
  async getCompletedTests(req, res) {
    try {
      const tests = await diagnosticService.getCompletedTests(req.user.userId, req.user.role);

      return successResponse(res, 200, 'Completed tests retrieved successfully', {
        tests,
        count: tests.length,
      });
    } catch (error) {
      console.error('Get completed tests error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get lab pending tests statistics (Lab dashboard)
   * GET /api/diagnostics/lab/pending
   */
  async getLabPendingTests(req, res) {
    try {
      const stats = await diagnosticService.getLabPendingTests(req.user.userId);

      return successResponse(res, 200, 'Lab pending tests retrieved successfully', { stats });
    } catch (error) {
      console.error('Get lab pending tests error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Cancel diagnostic test (Doctor only)
   * PUT /api/diagnostics/:id/cancel
   */
  async cancelTest(req, res) {
    try {
      const { id } = req.params;
      const { cancellationReason } = req.body;

      if (!cancellationReason) {
        return validationErrorResponse(res, 'Validation failed', [
          { field: 'cancellationReason', message: MESSAGES.DIAGNOSTIC.CANCELLATION_REASON_REQUIRED },
        ]);
      }

      const test = await diagnosticService.cancelTest(id, req.user.userId, cancellationReason);

      return successResponse(res, 200, MESSAGES.DIAGNOSTIC.CANCELLED, { test });
    } catch (error) {
      console.error('Cancel test error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }

  /**
   * Get test statistics (Admin dashboard)
   * GET /api/diagnostics/statistics/overview
   */
  async getStatistics(req, res) {
    try {
      const stats = await diagnosticService.getStatistics();

      return successResponse(res, 200, 'Statistics retrieved successfully', { stats });
    } catch (error) {
      console.error('Get statistics error:', error);
      return errorResponse(res, error.statusCode || 500, error.message || MESSAGES.SERVER.ERROR);
    }
  }
}

export default new DiagnosticController();
