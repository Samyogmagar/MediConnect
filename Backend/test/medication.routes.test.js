import { jest } from '@jest/globals';
import request from 'supertest';
import MESSAGES from '../src/constants/messages.js';

const medicationServiceMock = {
  prescribeMedication: jest.fn(),
  discontinueMedication: jest.fn(),
  getActiveMedications: jest.fn(),
  getMedications: jest.fn(),
};

const authMiddlewareMock = (req, _res, next) => {
  req.user = {
    userId: req.headers['x-test-user'] || 'doctor-1',
    role: req.headers['x-test-role'] || 'doctor',
    isVerified: true,
  };
  next();
};

const roleMiddlewareMock = {
  doctorOnly: (_req, _res, next) => next(),
};

jest.unstable_mockModule('../src/services/medication.service.js', () => ({
  default: medicationServiceMock,
}));
jest.unstable_mockModule('../src/middlewares/auth.middleware.js', () => ({
  default: authMiddlewareMock,
}));
jest.unstable_mockModule('../src/middlewares/role.middleware.js', () => ({
  default: () => (_req, _res, next) => next(),
  doctorOnly: roleMiddlewareMock.doctorOnly,
  adminOnly: (_req, _res, next) => next(),
  labOnly: (_req, _res, next) => next(),
  patientOnly: (_req, _res, next) => next(),
  clinicalStaff: (_req, _res, next) => next(),
  healthcareProviders: (_req, _res, next) => next(),
}));

const { default: app } = await import('../src/app.js');

describe('Medication routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('UT-53: prescribe validation fails', async () => {
    const res = await request(app).post('/api/medications/prescribe').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.length).toBeGreaterThan(0);
  });

  test('UT-54: prescribe success', async () => {
    medicationServiceMock.prescribeMedication.mockResolvedValue({
      medication: { _id: 'm1' },
      remindersGenerated: 1,
    });

    const res = await request(app)
      .post('/api/medications/prescribe')
      .send({
        patientId: 'patient-1',
        medicationName: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'twice_daily',
        duration: { value: 5, unit: 'days' },
        appointmentId: 'appt-1',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(MESSAGES.MEDICATION.PRESCRIBED);
  });

  test('UT-55: discontinue requires reason', async () => {
    const res = await request(app)
      .put('/api/medications/med-1/discontinue')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('UT-56: get active medications requires patientId for doctor', async () => {
    const res = await request(app)
      .get('/api/medications/active')
      .set('x-test-role', 'doctor');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('UT-57: get active medications for patient succeeds', async () => {
    medicationServiceMock.getActiveMedications.mockResolvedValue([
      { _id: 'm1', medicationName: 'Amoxicillin' },
    ]);

    const res = await request(app)
      .get('/api/medications/active')
      .set('x-test-role', 'patient')
      .set('x-test-user', 'patient-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.medications?.length).toBe(1);
  });

  test('UT-58: discontinue medication success', async () => {
    medicationServiceMock.discontinueMedication.mockResolvedValue({ _id: 'med-1' });

    const res = await request(app)
      .put('/api/medications/med-1/discontinue')
      .send({ reason: 'Side effects' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(MESSAGES.MEDICATION.DISCONTINUED);
  });

  test('UT-59: get active medications for doctor with patientId succeeds', async () => {
    medicationServiceMock.getActiveMedications.mockResolvedValue([
      { _id: 'm1', medicationName: 'Amoxicillin' },
    ]);

    const res = await request(app)
      .get('/api/medications/active?patientId=patient-1')
      .set('x-test-role', 'doctor');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.medications?.length).toBe(1);
  });

  test('UT-60: get medications returns list', async () => {
    medicationServiceMock.getMedications.mockResolvedValue([
      { _id: 'm1', medicationName: 'Amoxicillin' },
    ]);

    const res = await request(app).get('/api/medications');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.medications?.length).toBe(1);
  });
});
