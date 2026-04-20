import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const navigateMock = jest.fn();
const onUnreadCountChangeMock = jest.fn();

const notificationServiceMock = {
  getNotifications: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
};

jest.unstable_mockModule('lucide-react', () => ({
  Bell: () => <span data-testid="icon-bell" />,
  CheckCircle: () => <span />,
  CalendarCheck: () => <span />,
  CalendarX: () => <span />,
  FileText: () => <span />,
  AlertCircle: () => <span />,
  Pill: () => <span />,
  UserCheck: () => <span />,
  Clock: () => <span />,
  CheckCheck: () => <span />,
  ArrowRight: () => <span />,
  X: () => <span />,
}));

jest.unstable_mockModule('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

jest.unstable_mockModule('../services/notificationService', () => ({
  default: notificationServiceMock,
}));

jest.unstable_mockModule('../utils/notificationTarget.util', () => ({
  resolveNotificationTarget: () => '/patient/notifications',
}));

jest.unstable_mockModule('../components/common/NotificationDropdown.module.css', () => ({
  default: {},
}));

const { default: NotificationDropdown } = await import('../components/common/NotificationDropdown.jsx');

describe('NotificationDropdown', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('UT-37: fetches and marks notification as read', async () => {
    notificationServiceMock.getNotifications.mockResolvedValue({
      data: {
        notifications: [
          {
            _id: 'n1',
            type: 'appointment_approved',
            title: 'Appointment approved',
            message: 'Your appointment was approved.',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });

    notificationServiceMock.markAsRead.mockResolvedValue({ data: { success: true } });

    render(
      <NotificationDropdown
        role="patient"
        unreadCount={1}
        onUnreadCountChange={onUnreadCountChangeMock}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(notificationServiceMock.getNotifications).toHaveBeenCalled();
      expect(screen.getByText('Appointment approved')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Appointment approved'));

    await waitFor(() => {
      expect(notificationServiceMock.markAsRead).toHaveBeenCalledWith('n1');
      expect(onUnreadCountChangeMock).toHaveBeenCalledWith(0);
      expect(navigateMock).toHaveBeenCalledWith('/patient/notifications');
    });
  });
});
