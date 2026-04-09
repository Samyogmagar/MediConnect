import DiagnosticTest from '../models/DiagnosticTest.model.js';
import User from '../models/User.model.js';
import Appointment from '../models/Appointment.model.js';
import MESSAGES from '../constants/messages.js';
import notificationService from './notification.service.js';

/**
 * Diagnostic Test Service
 * Business logic for diagnostic test workflow management
 */
class DiagnosticTestService {
  /**
   * Assign a diagnostic test to a patient (Doctor only)
   * @param {Object} testData - Test details
   * @param {string} doctorId - ID of the doctor assigning the test
   * @returns {Promise<Object>} Created diagnostic test
   */
  async assignTest(testData, doctorId) {
    const { patientId, labId, testName, testType, description, urgency, instructions, estimatedCompletionDate, appointmentId } =
      testData;

    // Validate required fields
    if (!patientId) {
      throw { statusCode: 400, message: MESSAGES.DIAGNOSTIC.PATIENT_REQUIRED };
    }
    if (!labId) {
      throw { statusCode: 400, message: MESSAGES.DIAGNOSTIC.LAB_REQUIRED };
    }
    if (!testName) {
      throw { statusCode: 400, message: MESSAGES.DIAGNOSTIC.TEST_NAME_REQUIRED };
    }
    if (!testType) {
      throw { statusCode: 400, message: MESSAGES.DIAGNOSTIC.TEST_TYPE_REQUIRED };
    }
    if (!appointmentId) {
      throw { statusCode: 400, message: 'Appointment ID is required' };
    }

    // Verify patient exists and has patient role
    const patient = await User.findById(patientId);
    if (!patient) {
      throw { statusCode: 404, message: MESSAGES.USER.NOT_FOUND };
    }
    if (patient.role !== 'patient') {
      throw { statusCode: 400, message: MESSAGES.DIAGNOSTIC.INVALID_PATIENT };
    }

    // Verify lab exists and has lab role
    const lab = await User.findById(labId);
    if (!lab) {
      throw { statusCode: 404, message: MESSAGES.USER.NOT_FOUND };
    }
    if (lab.role !== 'lab') {
      throw { statusCode: 400, message: MESSAGES.DIAGNOSTIC.INVALID_LAB };
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw { statusCode: 404, message: MESSAGES.APPOINTMENT.NOT_FOUND };
    }
    if (appointment.doctorId.toString() !== doctorId) {
      throw { statusCode: 403, message: MESSAGES.DIAGNOSTIC.DOCTOR_ONLY };
    }
    if (appointment.patientId.toString() !== patientId) {
      throw { statusCode: 400, message: 'Appointment does not belong to this patient' };
    }
    if (appointment.status !== 'completed') {
      throw { statusCode: 400, message: 'Lab tests can be ordered only after consultation is completed' };
    }

    // Create diagnostic test
    const diagnosticTest = await DiagnosticTest.create({
      patientId,
      doctorId,
      labId,
      appointmentId,
      testName,
      testType,
      description,
      urgency: urgency || 'routine',
      instructions,
      estimatedCompletionDate,
      status: 'assigned',
    });

    // Populate references
    await diagnosticTest.populate([
      { path: 'patientId', select: 'name email contactNumber' },
      { path: 'doctorId', select: 'name email professionalDetails' },
      { path: 'labId', select: 'name email professionalDetails' },
      { path: 'appointmentId', select: 'dateTime status' },
    ]);

    // Send notification to patient and lab
    await notificationService.notifyDiagnosticAssigned(diagnosticTest);

    return diagnosticTest;
  }

  /**
   * Get diagnostic tests with role-based filtering
   * @param {Object} filters - Query filters (status, urgency, testType)
   * @param {string} userId - User ID
   * @param {string} userRole - User role (patient, doctor, lab, admin)
   * @returns {Promise<Array>} List of diagnostic tests
   */
  async getTests(filters, userId, userRole) {
    const query = {};

    // Role-based filtering
    if (userRole === 'patient') {
      query.patientId = userId;
    } else if (userRole === 'doctor') {
      query.doctorId = userId;
    } else if (userRole === 'lab') {
      query.labId = userId;
    }
    // Admin can see all tests (no additional filter)

    // Apply additional filters
    if (filters.status) {
      query.status = filters.status;
    } else {
      // By default, exclude cancelled tests
      query.status = { $ne: 'cancelled' };
    }

    if (filters.urgency) {
      query.urgency = filters.urgency;
    }

    if (filters.testType) {
      query.testType = filters.testType;
    }

    if (filters.patientId) {
      query.patientId = filters.patientId;
    }

    const tests = await DiagnosticTest.find(query)
      .populate('patientId', 'name email contactNumber')
      .populate('doctorId', 'name email professionalDetails')
      .populate('labId', 'name email professionalDetails')
      .populate('appointmentId', 'dateTime status')
      .sort({ assignedAt: -1 });

    return tests;
  }

  /**
   * Get diagnostic test by ID with access control
   * @param {string} testId - Test ID
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {Promise<Object>} Diagnostic test
   */
  async getTestById(testId, userId, userRole) {
    const test = await DiagnosticTest.findById(testId)
      .populate('patientId', 'name email contactNumber dateOfBirth gender')
      .populate('doctorId', 'name email professionalDetails')
      .populate('labId', 'name email professionalDetails contactNumber')
      .populate('appointmentId', 'dateTime status')
      .populate('report.uploadedBy', 'name email');

    if (!test) {
      throw { statusCode: 404, message: MESSAGES.DIAGNOSTIC.NOT_FOUND };
    }

    // Access control
    if (userRole === 'patient' && test.patientId._id.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.DIAGNOSTIC.PATIENT_ACCESS_DENIED };
    }

    if (userRole === 'doctor' && test.doctorId._id.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.DIAGNOSTIC.DOCTOR_ACCESS_DENIED };
    }

    if (userRole === 'lab' && test.labId._id.toString() !== userId) {
      throw { statusCode: 403, message: MESSAGES.DIAGNOSTIC.LAB_ACCESS_DENIED };
    }

    return test;
  }

  /**
  * Update test status (Lab only: assigned -> sample_collected -> processing)
   * @param {string} testId - Test ID
  * @param {string} newStatus - New status
   * @param {string} labId - Lab ID
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} Updated test
   */
  async updateTestStatus(testId, newStatus, labId, notes = '') {
    const test = await DiagnosticTest.findById(testId);

    if (!test) {
      throw { statusCode: 404, message: MESSAGES.DIAGNOSTIC.NOT_FOUND };
    }

    // Verify lab access
    if (test.labId.toString() !== labId) {
      throw { statusCode: 403, message: MESSAGES.DIAGNOSTIC.LAB_ONLY };
    }

    // Validate status transition
    const validTransitions = {
      assigned: ['sample_collected', 'cancelled'],
      sample_collected: ['processing', 'cancelled'],
      processing: ['cancelled'],
      report_uploaded: [],
      cancelled: [],
    };

    if (newStatus === 'report_uploaded') {
      throw { statusCode: 400, message: 'Report upload must include a file' };
    }

    if (!validTransitions[test.status].includes(newStatus)) {
      throw {
        statusCode: 400,
        message: `Cannot transition from ${test.status} to ${newStatus}`,
      };
    }

    // Update status
    test.status = newStatus;
    test.addStatusHistory(newStatus, labId, notes);

    await test.save();

    // Populate references
    await test.populate([
      { path: 'patientId', select: 'name email contactNumber' },
      { path: 'doctorId', select: 'name email professionalDetails' },
      { path: 'labId', select: 'name email professionalDetails' },
    ]);

    return test;
  }

  /**
   * Upload test report metadata (Lab only)
   * @param {string} testId - Test ID
   * @param {Object} reportData - Report metadata
   * @param {string} labId - Lab ID
   * @returns {Promise<Object>} Updated test with report
   */
  async uploadReport(testId, reportData, labId) {
    const { filename, url, fileSize, mimeType, findings, recommendations, notes } = reportData;

    if (!url) {
      throw { statusCode: 400, message: MESSAGES.DIAGNOSTIC.REPORT_URL_REQUIRED };
    }

    const test = await DiagnosticTest.findById(testId);

    if (!test) {
      throw { statusCode: 404, message: MESSAGES.DIAGNOSTIC.NOT_FOUND };
    }

    // Verify lab access
    if (test.labId.toString() !== labId) {
      throw { statusCode: 403, message: MESSAGES.DIAGNOSTIC.LAB_ONLY };
    }

    // Test must be in processing to upload report
    if (test.status !== 'processing' && test.status !== 'report_uploaded') {
      throw { statusCode: 400, message: 'Test must be in processing before report upload' };
    }

    if (test.status === 'processing') {
      test.status = 'report_uploaded';
      test.addStatusHistory('report_uploaded', labId, 'Report uploaded');
    }

    // Update report metadata
    test.report = {
      filename: filename || 'diagnostic-report.pdf',
      url,
      uploadedBy: labId,
      uploadedAt: new Date(),
      fileSize: fileSize || null,
      mimeType: mimeType || 'application/pdf',
      notes: notes || undefined,
    };

    // Update findings and recommendations if provided
    if (findings) test.findings = findings;
    if (recommendations) test.recommendations = recommendations;

    await test.save();

    // Populate references
    await test.populate([
      { path: 'patientId', select: 'name email contactNumber' },
      { path: 'doctorId', select: 'name email professionalDetails' },
      { path: 'labId', select: 'name email professionalDetails' },
      { path: 'report.uploadedBy', select: 'name email' },
    ]);

    // Send notification to patient and doctor
    await notificationService.notifyReportUploaded(test);

    return test;
  }

  /**
   * Get completed tests with reports (Patient and Doctor access)
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @returns {Promise<Array>} Completed tests with reports
   */
  async getCompletedTests(userId, userRole) {
    const query = {
      status: 'report_uploaded',
      'report.url': { $exists: true, $ne: null },
    };

    // Role-based filtering
    if (userRole === 'patient') {
      query.patientId = userId;
    } else if (userRole === 'doctor') {
      query.doctorId = userId;
    } else if (userRole === 'lab') {
      query.labId = userId;
    }
    // Admin can see all

    const tests = await DiagnosticTest.find(query)
      .populate('patientId', 'name email contactNumber')
      .populate('doctorId', 'name email professionalDetails')
      .populate('labId', 'name email professionalDetails')
      .populate('report.uploadedBy', 'name email')
      .sort({ actualCompletionDate: -1 });

    return tests;
  }

  /**
   * Get pending tests for lab (Lab dashboard)
   * @param {string} labId - Lab ID
   * @returns {Promise<Object>} Pending test counts
   */
  async getLabPendingTests(labId) {
    const assigned = await DiagnosticTest.countDocuments({ labId, status: 'assigned' });
    const sampleCollected = await DiagnosticTest.countDocuments({ labId, status: 'sample_collected' });
    const processing = await DiagnosticTest.countDocuments({ labId, status: 'processing' });

    const urgent = await DiagnosticTest.countDocuments({
      labId,
      status: { $in: ['assigned', 'sample_collected', 'processing'] },
      urgency: 'emergency',
    });

    return {
      assigned,
      sampleCollected,
      processing,
      urgent,
      total: assigned + sampleCollected + processing,
    };
  }

  /**
   * Cancel diagnostic test (Doctor only)
   * @param {string} testId - Test ID
   * @param {string} doctorId - Doctor ID
   * @param {string} cancellationReason - Reason for cancellation
   * @returns {Promise<Object>} Cancelled test
   */
  async cancelTest(testId, doctorId, cancellationReason) {
    if (!cancellationReason) {
      throw { statusCode: 400, message: MESSAGES.DIAGNOSTIC.CANCELLATION_REASON_REQUIRED };
    }

    const test = await DiagnosticTest.findById(testId);

    if (!test) {
      throw { statusCode: 404, message: MESSAGES.DIAGNOSTIC.NOT_FOUND };
    }

    // Verify doctor access
    if (test.doctorId.toString() !== doctorId) {
      throw { statusCode: 403, message: MESSAGES.DIAGNOSTIC.DOCTOR_ONLY };
    }

    // Cannot cancel completed tests
    if (test.status === 'completed') {
      throw { statusCode: 400, message: MESSAGES.DIAGNOSTIC.CANNOT_MODIFY };
    }

    if (test.status === 'cancelled') {
      throw { statusCode: 400, message: 'Test is already cancelled' };
    }

    // Update status to cancelled
    test.status = 'cancelled';
    test.cancellationReason = cancellationReason;
    test.addStatusHistory('cancelled', doctorId, cancellationReason);

    await test.save();

    // Populate references
    await test.populate([
      { path: 'patientId', select: 'name email contactNumber' },
      { path: 'doctorId', select: 'name email professionalDetails' },
      { path: 'labId', select: 'name email professionalDetails' },
    ]);

    // Send notification to patient and lab
    await notificationService.notifyDiagnosticCancelled(test, cancellationReason);

    return test;
  }

  /**
   * Get test statistics (Admin dashboard)
   * @returns {Promise<Object>} Test statistics
   */
  async getStatistics() {
    const totalTests = await DiagnosticTest.countDocuments();
    const assigned = await DiagnosticTest.countDocuments({ status: 'assigned' });
    const sampleCollected = await DiagnosticTest.countDocuments({ status: 'sample_collected' });
    const processing = await DiagnosticTest.countDocuments({ status: 'processing' });
    const reportUploaded = await DiagnosticTest.countDocuments({ status: 'report_uploaded' });
    const cancelled = await DiagnosticTest.countDocuments({ status: 'cancelled' });
    const urgent = await DiagnosticTest.countDocuments({
      status: { $in: ['assigned', 'sample_collected', 'processing'] },
      urgency: { $in: ['urgent', 'emergency'] },
    });

    return {
      totalTests,
      assigned,
      sampleCollected,
      processing,
      reportUploaded,
      cancelled,
      urgent,
      completionRate: totalTests > 0 ? ((reportUploaded / totalTests) * 100).toFixed(2) : 0,
    };
  }
}

export default new DiagnosticTestService();
