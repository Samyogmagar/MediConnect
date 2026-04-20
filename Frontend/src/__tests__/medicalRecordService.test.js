import { jest } from '@jest/globals';

const apiMock = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.unstable_mockModule('../config/api', () => ({
  default: apiMock,
}));

const { default: medicalRecordService } = await import('../services/medicalRecordService');

describe('medicalRecordService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('UT-46: getDiagnosticTests passes filters', async () => {
    apiMock.get.mockResolvedValue({ data: { success: true } });

    const res = await medicalRecordService.getDiagnosticTests({
      status: 'assigned',
      urgency: 'routine',
    });

    expect(apiMock.get).toHaveBeenCalledWith('/diagnostics', {
      params: { status: 'assigned', urgency: 'routine' },
    });
    expect(res.success).toBe(true);
  });

  test('UT-47: getCompletedTests hits completed endpoint', async () => {
    apiMock.get.mockResolvedValue({ data: { success: true } });

    const res = await medicalRecordService.getCompletedTests();

    expect(apiMock.get).toHaveBeenCalledWith('/diagnostics/completed');
    expect(res.success).toBe(true);
  });

  test('UT-48: getActiveMedications hits active endpoint', async () => {
    apiMock.get.mockResolvedValue({ data: { success: true } });

    const res = await medicalRecordService.getActiveMedications();

    expect(apiMock.get).toHaveBeenCalledWith('/medications/active');
    expect(res.success).toBe(true);
  });
});
