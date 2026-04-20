import { jest } from '@jest/globals';
import request from 'supertest';

const settingsServiceMock = {
  getSettings: jest.fn(),
  updateSettings: jest.fn(),
};

const authMiddlewareMock = (req, _res, next) => {
  req.user = { userId: 'admin-1', role: 'admin', isVerified: true };
  next();
};

jest.unstable_mockModule('../src/services/settings.service.js', () => ({
  default: settingsServiceMock,
}));
jest.unstable_mockModule('../src/middlewares/auth.middleware.js', () => ({
  default: authMiddlewareMock,
}));
jest.unstable_mockModule('../src/middlewares/role.middleware.js', () => ({
  default: () => (_req, _res, next) => next(),
  adminOnly: (_req, _res, next) => next(),
  doctorOnly: (_req, _res, next) => next(),
  labOnly: (_req, _res, next) => next(),
  patientOnly: (_req, _res, next) => next(),
  clinicalStaff: (_req, _res, next) => next(),
  healthcareProviders: (_req, _res, next) => next(),
}));

const { default: app } = await import('../src/app.js');

describe('Settings routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('UT-61: get settings returns data', async () => {
    settingsServiceMock.getSettings.mockResolvedValue({
      hospitalName: 'MediConnect',
      contactEmail: 'admin@mediconnect.com',
    });

    const res = await request(app).get('/api/settings');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.settings?.hospitalName).toBe('MediConnect');
  });

  test('UT-62: update settings returns updated data', async () => {
    settingsServiceMock.updateSettings.mockResolvedValue({
      hospitalName: 'Updated Hospital',
      contactEmail: 'updated@mediconnect.com',
    });

    const res = await request(app)
      .put('/api/settings')
      .send({ hospitalName: 'Updated Hospital' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.settings?.hospitalName).toBe('Updated Hospital');
  });
});
