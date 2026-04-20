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

const { default: notificationService } = await import('../services/notificationService');

describe('notificationService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('UT-31: getNotifications passes query params', async () => {
    apiMock.get.mockResolvedValue({ data: { success: true } });

    const params = { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' };
    const res = await notificationService.getNotifications(params);

    expect(apiMock.get).toHaveBeenCalledWith('/notifications', { params });
    expect(res.success).toBe(true);
  });

  test('UT-32: markAsRead hits read endpoint', async () => {
    apiMock.put.mockResolvedValue({ data: { success: true } });

    const res = await notificationService.markAsRead('notif-1');

    expect(apiMock.put).toHaveBeenCalledWith('/notifications/notif-1/read');
    expect(res.success).toBe(true);
  });

  test('UT-33: markAllAsRead hits mark-all-read endpoint', async () => {
    apiMock.put.mockResolvedValue({ data: { success: true } });

    const res = await notificationService.markAllAsRead();

    expect(apiMock.put).toHaveBeenCalledWith('/notifications/mark-all-read');
    expect(res.success).toBe(true);
  });
});
