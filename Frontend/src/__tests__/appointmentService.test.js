import { jest } from '@jest/globals';

const apiMock = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
};

jest.unstable_mockModule('../config/api', () => ({
  default: apiMock,
}));

const { default: appointmentService } = await import('../services/appointmentService');

describe('appointmentService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('UT-28: initiateKhaltiPayment posts to backend', async () => {
    apiMock.post.mockResolvedValue({ data: { success: true } });

    const payload = {
      doctorId: 'doctor-1',
      dateTime: '2099-01-01T10:00:00.000Z',
      reason: 'Consultation',
      paymentAmount: 500,
    };

    const res = await appointmentService.initiateKhaltiPayment(payload);

    expect(apiMock.post).toHaveBeenCalledWith('/appointments/payments/khalti/initiate', payload);
    expect(res.success).toBe(true);
  });

  test('UT-29: createAppointment posts appointment data', async () => {
    apiMock.post.mockResolvedValue({ data: { success: true } });

    const payload = {
      doctorId: 'doctor-1',
      dateTime: '2099-01-01T10:00:00.000Z',
      reason: 'Consultation',
      paymentMethod: 'cod',
    };

    const res = await appointmentService.createAppointment(payload);

    expect(apiMock.post).toHaveBeenCalledWith('/appointments', payload);
    expect(res.success).toBe(true);
  });

  test('UT-30: rescheduleAppointment sends dateTime', async () => {
    apiMock.put.mockResolvedValue({ data: { success: true } });

    const res = await appointmentService.rescheduleAppointment('appt-1', {
      dateTime: '2099-01-02T12:00:00.000Z',
      reason: 'Schedule change',
    });

    expect(apiMock.put).toHaveBeenCalledWith('/appointments/appt-1/reschedule', {
      dateTime: '2099-01-02T12:00:00.000Z',
      reason: 'Schedule change',
    });
    expect(res.success).toBe(true);
  });
});
