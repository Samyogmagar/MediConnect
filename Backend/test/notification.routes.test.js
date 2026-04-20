import { jest } from '@jest/globals';
import request from 'supertest';
import MESSAGES from '../src/constants/messages.js';

const notificationServiceMock = {
  getNotifications: jest.fn(),
  getUnreadCount: jest.fn(),
  getNotificationById: jest.fn(),
  markAsRead: jest.fn(),
  markManyAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  deleteAllRead: jest.fn(),
};

const authMiddlewareMock = (req, res, next) => {
  req.user = { userId: 'user-1', role: 'patient', isVerified: true };
  next();
};

jest.unstable_mockModule('../src/services/notification.service.js', () => ({
  default: notificationServiceMock,
}));
jest.unstable_mockModule('../src/middlewares/auth.middleware.js', () => ({
  default: authMiddlewareMock,
}));

const { default: app } = await import('../src/app.js');

describe('Notification routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('UT-33: get notifications returns list', async () => {
    notificationServiceMock.getNotifications.mockResolvedValue({
      notifications: [{ _id: 'n1', title: 'Appointment approved' }],
      total: 1,
    });

    const res = await request(app).get('/api/notifications');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(MESSAGES.NOTIFICATION.FETCH_SUCCESS);
    expect(res.body.data?.notifications?.length).toBe(1);
  });

  test('UT-34: get unread count returns number', async () => {
    notificationServiceMock.getUnreadCount.mockResolvedValue(3);

    const res = await request(app).get('/api/notifications/unread/count');

    expect(res.status).toBe(200);
    expect(res.body.data?.unreadCount).toBe(3);
  });

  test('UT-35: mark as read returns notification', async () => {
    notificationServiceMock.markAsRead.mockResolvedValue({ _id: 'n1', isRead: true });

    const res = await request(app).put('/api/notifications/n1/read');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(MESSAGES.NOTIFICATION.MARKED_AS_READ);
  });

  test('UT-36: mark many read rejects invalid payload', async () => {
    const res = await request(app).put('/api/notifications/mark-many-read').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('UT-37: mark all read success', async () => {
    notificationServiceMock.markAllAsRead.mockResolvedValue({
      modifiedCount: 2,
      matchedCount: 2,
    });

    const res = await request(app).put('/api/notifications/mark-all-read');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(MESSAGES.NOTIFICATION.MARKED_ALL_AS_READ);
  });

  test('UT-38: mark many read success', async () => {
    notificationServiceMock.markManyAsRead.mockResolvedValue({
      modifiedCount: 1,
      matchedCount: 1,
    });

    const res = await request(app)
      .put('/api/notifications/mark-many-read')
      .send({ notificationIds: ['n1'] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('UT-39: get notification by id returns data', async () => {
    notificationServiceMock.getNotificationById.mockResolvedValue({ _id: 'n1' });

    const res = await request(app).get('/api/notifications/n1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.notification?._id).toBe('n1');
  });

  test('UT-40: delete notification returns success', async () => {
    notificationServiceMock.deleteNotification.mockResolvedValue();

    const res = await request(app).delete('/api/notifications/n1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('UT-41: delete all read notifications returns count', async () => {
    notificationServiceMock.deleteAllRead.mockResolvedValue({ deletedCount: 2 });

    const res = await request(app).delete('/api/notifications/read');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.deletedCount).toBe(2);
  });

  test('UT-42: get notifications applies filters', async () => {
    notificationServiceMock.getNotifications.mockResolvedValue({
      notifications: [],
      total: 0,
    });

    const res = await request(app)
      .get('/api/notifications')
      .query({ page: 2, limit: 10, isRead: 'true', sortBy: 'createdAt', sortOrder: 'asc' });

    expect(res.status).toBe(200);
    expect(notificationServiceMock.getNotifications).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ page: 2, limit: 10, isRead: true, sortOrder: 'asc' })
    );
  });
});
