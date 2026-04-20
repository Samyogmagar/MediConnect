import { jest } from '@jest/globals';
import request from 'supertest';
import MESSAGES from '../src/constants/messages.js';

const diagnosticServiceMock = {
  assignTest: jest.fn(),
  updateTestStatus: jest.fn(),
  uploadReport: jest.fn(),
  cancelTest: jest.fn(),
  getTests: jest.fn(),
  getCompletedTests: jest.fn(),
};

const authMiddlewareMock = (req, _res, next) => {
  req.user = { userId: 'doctor-1', role: 'doctor', isVerified: true };
  next();
};

const roleMiddlewareMock = {
  adminOnly: (_req, _res, next) => next(),
  doctorOnly: (_req, _res, next) => next(),
  labOnly: (_req, _res, next) => next(),
};

jest.unstable_mockModule('../src/services/diagnostic.service.js', () => ({
  default: diagnosticServiceMock,
}));
jest.unstable_mockModule('../src/middlewares/auth.middleware.js', () => ({
  default: authMiddlewareMock,
}));
jest.unstable_mockModule('../src/middlewares/role.middleware.js', () => ({
  default: () => (_req, _res, next) => next(),
  adminOnly: roleMiddlewareMock.adminOnly,
  doctorOnly: roleMiddlewareMock.doctorOnly,
  labOnly: roleMiddlewareMock.labOnly,
  patientOnly: (_req, _res, next) => next(),
  clinicalStaff: (_req, _res, next) => next(),
  healthcareProviders: (_req, _res, next) => next(),
}));

const { default: app } = await import('../src/app.js');

describe('Diagnostic routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('UT-43: assign test validation fails', async () => {
    const res = await request(app).post('/api/diagnostics/assign').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.length).toBeGreaterThan(0);
  });

  test('UT-44: update status requires status field', async () => {
    const res = await request(app)
      .put('/api/diagnostics/diag-1/status')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('UT-45: upload report requires report url', async () => {
    const res = await request(app)
      .put('/api/diagnostics/diag-1/report')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('UT-46: cancel test requires reason', async () => {
    const res = await request(app)
      .put('/api/diagnostics/diag-1/cancel')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.[0]?.field).toBe('cancellationReason');
  });

  test('UT-47: get tests returns list', async () => {
    diagnosticServiceMock.getTests.mockResolvedValue([
      { _id: 't1', testName: 'CBC' },
    ]);

    const res = await request(app).get('/api/diagnostics');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.tests?.length).toBe(1);
  });

  test('UT-48: update test status success', async () => {
    diagnosticServiceMock.updateTestStatus.mockResolvedValue({ _id: 't1', status: 'completed' });

    const res = await request(app)
      .put('/api/diagnostics/diag-1/status')
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(MESSAGES.DIAGNOSTIC.UPDATED);
  });

  test('UT-49: upload report success', async () => {
    diagnosticServiceMock.uploadReport.mockResolvedValue({ _id: 't1' });

    const res = await request(app)
      .put('/api/diagnostics/diag-1/report')
      .send({ url: 'https://example.com/report.pdf' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(MESSAGES.DIAGNOSTIC.REPORT_UPLOADED);
  });

  test('UT-50: assign test success', async () => {
    diagnosticServiceMock.assignTest.mockResolvedValue({ _id: 't1' });

    const res = await request(app)
      .post('/api/diagnostics/assign')
      .send({
        patientId: 'patient-1',
        labId: 'lab-1',
        testName: 'CBC',
        testType: 'blood',
        appointmentId: 'appt-1',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(MESSAGES.DIAGNOSTIC.ASSIGNED);
  });

  test('UT-51: cancel test success', async () => {
    diagnosticServiceMock.cancelTest.mockResolvedValue({ _id: 't1' });

    const res = await request(app)
      .put('/api/diagnostics/diag-1/cancel')
      .send({ cancellationReason: 'No longer needed' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(MESSAGES.DIAGNOSTIC.CANCELLED);
  });

  test('UT-52: get completed tests returns list', async () => {
    diagnosticServiceMock.getCompletedTests.mockResolvedValue([
      { _id: 't1', status: 'completed' },
    ]);

    const res = await request(app).get('/api/diagnostics/completed');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.tests?.length).toBe(1);
  });
});
