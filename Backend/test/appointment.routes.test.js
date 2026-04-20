import { jest } from '@jest/globals';
import request from 'supertest';
import MESSAGES from '../src/constants/messages.js';

const appointmentServiceMock = {
  initiateKhaltiAppointmentPayment: jest.fn(),
  createAppointment: jest.fn(),
  rescheduleAppointment: jest.fn(),
  cancelAppointment: jest.fn(),
  getAppointments: jest.fn(),
  getAppointmentById: jest.fn(),
};

const authMiddlewareMock = (req, res, next) => {
  req.user = { userId: 'patient-1', role: 'patient', isVerified: true };
  next();
};

const roleMiddlewareMock = () => (req, res, next) => next();
const verificationMiddlewareMock = (req, res, next) => next();

jest.unstable_mockModule('../src/services/appointment.service.js', () => ({
  default: appointmentServiceMock,
}));
jest.unstable_mockModule('../src/middlewares/auth.middleware.js', () => ({
  default: authMiddlewareMock,
}));
jest.unstable_mockModule('../src/middlewares/role.middleware.js', () => ({
  default: roleMiddlewareMock,
  adminOnly: roleMiddlewareMock(),
  doctorOnly: roleMiddlewareMock(),
  labOnly: roleMiddlewareMock(),
  patientOnly: roleMiddlewareMock(),
  clinicalStaff: roleMiddlewareMock(),
  healthcareProviders: roleMiddlewareMock(),
}));
jest.unstable_mockModule('../src/middlewares/verification.middleware.js', () => ({
  default: verificationMiddlewareMock,
}));

const { default: app } = await import('../src/app.js');

describe('Appointment routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('UT-21: initiate payment validation fails', async () => {
    const res = await request(app)
      .post('/api/appointments/payments/khalti/initiate')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('UT-22: initiate payment success', async () => {
    appointmentServiceMock.initiateKhaltiAppointmentPayment.mockResolvedValue({
      pidx: 'pidx-123',
      paymentUrl: 'https://khalti.com/pay/123',
    });

    const res = await request(app)
      .post('/api/appointments/payments/khalti/initiate')
      .send({
        doctorId: 'doctor-1',
        dateTime: '2099-01-01T10:00:00.000Z',
        reason: 'Consultation',
        paymentAmount: 500,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.payment?.pidx).toBe('pidx-123');
  });

  test('UT-23: create appointment rejects missing payment method', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({
        doctorId: 'doctor-1',
        dateTime: '2099-01-01T10:00:00.000Z',
        reason: 'Consultation',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.some((err) => err.field === 'paymentMethod')).toBe(true);
  });

  test('UT-24: create appointment rejects missing khalti pidx', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({
        doctorId: 'doctor-1',
        dateTime: '2099-01-01T10:00:00.000Z',
        reason: 'Consultation',
        paymentMethod: 'khalti',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('UT-25: create appointment success', async () => {
    appointmentServiceMock.createAppointment.mockResolvedValue({
      id: 'appt-1',
      status: 'pending',
    });

    const res = await request(app)
      .post('/api/appointments')
      .send({
        doctorId: 'doctor-1',
        dateTime: '2099-01-01T10:00:00.000Z',
        reason: 'Consultation',
        paymentMethod: 'cod',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(MESSAGES.APPOINTMENT.CREATED);
  });

  test('UT-26: reschedule requires dateTime', async () => {
    const res = await request(app)
      .put('/api/appointments/appt-1/reschedule')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('UT-27: cancel appointment success', async () => {
    appointmentServiceMock.cancelAppointment.mockResolvedValue({
      id: 'appt-1',
      status: 'cancelled',
    });

    const res = await request(app)
      .put('/api/appointments/appt-1/cancel')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(MESSAGES.APPOINTMENT.CANCELLED);
  });

  test('UT-28: reschedule appointment success', async () => {
    appointmentServiceMock.rescheduleAppointment.mockResolvedValue({
      id: 'appt-1',
      status: 'pending',
    });

    const res = await request(app)
      .put('/api/appointments/appt-1/reschedule')
      .send({ dateTime: '2099-01-02T10:00:00.000Z', reason: 'Follow-up' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(MESSAGES.APPOINTMENT.UPDATED);
  });

  test('UT-29: create appointment rejects missing doctorId', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({
        dateTime: '2099-01-01T10:00:00.000Z',
        reason: 'Consultation',
        paymentMethod: 'cod',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('UT-30: create appointment rejects missing dateTime', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({
        doctorId: 'doctor-1',
        reason: 'Consultation',
        paymentMethod: 'cod',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('UT-31: get appointments returns list', async () => {
    appointmentServiceMock.getAppointments.mockResolvedValue([
      { id: 'appt-1' },
    ]);

    const res = await request(app).get('/api/appointments');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.appointments?.length).toBe(1);
  });

  test('UT-32: get appointment by id returns data', async () => {
    appointmentServiceMock.getAppointmentById.mockResolvedValue({ id: 'appt-1' });

    const res = await request(app).get('/api/appointments/appt-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.appointment?.id).toBe('appt-1');
  });
});
