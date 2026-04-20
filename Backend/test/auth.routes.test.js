import { jest } from '@jest/globals';
import request from 'supertest';
import MESSAGES from '../src/constants/messages.js';
0
const authServiceMock = {
  login: jest.fn(),
  register: jest.fn(),
  requestPasswordResetOtp: jest.fn(),
  verifyPasswordResetOtp: jest.fn(),
  resetPasswordWithOtp: jest.fn(),
  listSocialProviders: jest.fn(),
  getSocialProviderStart: jest.fn(),
  completeSocialProviderAuth: jest.fn(),
};

jest.unstable_mockModule('../src/services/auth.service.js', () => ({
  default: authServiceMock,
}));

const { default: app } = await import('../src/app.js');

describe('Auth routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('UT-01: login validation fails without identifier', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'secret' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.[0]?.field).toBe('identifier');
  });

  test('UT-02: login success returns token', async () => {
    authServiceMock.login.mockResolvedValue({
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      user: { id: 'u1', role: 'patient' },
      token: 'token-123',
      isVerified: true,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'patient@example.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.token).toBe('token-123');
    expect(authServiceMock.login).toHaveBeenCalledWith({
      identifier: 'patient@example.com',
      password: 'Password123!',
    });
  });

  test('UT-06: register validation fails with empty fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.length).toBeGreaterThan(0);
  });

  test('UT-07: register success returns token', async () => {
    authServiceMock.register.mockResolvedValue({
      message: MESSAGES.AUTH.REGISTER_SUCCESS,
      user: { id: 'u2', role: 'patient' },
      token: 'token-456',
    });

    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Patient One',
      email: 'patient1@example.com',
      phone: '9811111111',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      dob: '1999-01-01',
      gender: 'female',
      address: 'Kathmandu',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.token).toBe('token-456');
  });

  test('UT-08: register rejects invalid email', async () => {
    authServiceMock.register.mockRejectedValue({
      statusCode: 400,
      message: 'Invalid email format',
    });

    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Patient One',
      email: 'invalid-email',
      phone: '9811111111',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      dob: '1999-01-01',
      gender: 'female',
      address: 'Kathmandu',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('UT-09: register rejects mismatched passwords', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Patient One',
      email: 'patient1@example.com',
      phone: '9811111111',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
      dob: '1999-01-01',
      gender: 'female',
      address: 'Kathmandu',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.[0]?.field).toBe('confirmPassword');
  });

  test('UT-11: forgot password requires email', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('UT-12: verify reset OTP rejects missing otp', async () => {
    const res = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({ email: 'patient@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.[0]?.field).toBe('otp');
  });

  test('UT-10: reset password success', async () => {
    authServiceMock.resetPasswordWithOtp.mockResolvedValue({
      message: 'Password reset successful',
    });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'patient@example.com',
        otp: '123456',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('UT-03: login fails with invalid credentials', async () => {
    authServiceMock.login.mockRejectedValue({
      statusCode: 401,
      message: 'Invalid credentials',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'patient@example.com', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('UT-04: login fails for banned/inactive user', async () => {
    authServiceMock.login.mockRejectedValue({
      statusCode: 403,
      message: 'User is inactive or banned',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'inactive@example.com', password: 'Password123!' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('UT-05: login fails for unverified doctor/lab', async () => {
    authServiceMock.login.mockRejectedValue({
      statusCode: 403,
      message: 'Account not verified',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'doctor@example.com', password: 'Password123!' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('UT-13: login validation fails without password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'patient@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.[0]?.field).toBe('password');
  });

  test('UT-14: register rejects missing full name', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'patient1@example.com',
      phone: '9811111111',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.[0]?.field).toBe('fullName');
  });

  test('UT-15: register rejects missing email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Patient One',
      phone: '9811111111',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.[0]?.field).toBe('email');
  });

  test('UT-16: register rejects missing phone', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Patient One',
      email: 'patient1@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.[0]?.field).toBe('phone');
  });

  test('UT-17: register rejects missing password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Patient One',
      email: 'patient1@example.com',
      phone: '9811111111',
      confirmPassword: 'Password123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.[0]?.field).toBe('password');
  });

  test('UT-18: register rejects missing confirm password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Patient One',
      email: 'patient1@example.com',
      phone: '9811111111',
      password: 'Password123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors?.[0]?.field).toBe('confirmPassword');
  });

  test('UT-19: forgot password success', async () => {
    authServiceMock.requestPasswordResetOtp.mockResolvedValue({ message: 'OTP sent' });

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'patient@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('UT-20: verify reset OTP success', async () => {
    authServiceMock.verifyPasswordResetOtp.mockResolvedValue({ message: 'OTP verified' });

    const res = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({ email: 'patient@example.com', otp: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
