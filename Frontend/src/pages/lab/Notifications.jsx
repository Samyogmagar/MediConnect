import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LabLayout from '../../components/lab/LabLayout';
import NotificationItem from '../../components/lab/NotificationItem';
import notificationService from '../../services/notificationService';
import { resolveNotificationTarget } from '../../utils/notificationTarget.util';
import styles from './Notifications.module.css';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data?.notifications || res.notifications || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const urgentCount = notifications.filter(
    (n) => n.urgency === 'urgent' || n.urgency === 'emergency'
  ).length;

  const handleNotificationClick = (notification) => {
    navigate(resolveNotificationTarget(notification, 'lab'));
  };

  if (loading) {
    return (
      <LabLayout>
        <div className={styles.page}>
          <div className={styles.loading}>Loading notifications...</div>
        </div>
      </LabLayout>
    );
  }

  return (
    <LabLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Notifications</h1>
            <p className={styles.subtitle}>Stay updated with test assignments and report activities</p>
          </div>
          <div className={styles.headerActions}>
            {urgentCount > 0 && (
              <span className={styles.urgentTag}>{urgentCount} urgent</span>
            )}
            {unreadCount > 0 && (
              <span className={styles.unreadTag}>{unreadCount} unread</span>
            )}
          </div>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Content */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>All Notifications</h2>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length > 0 ? (
            <div className={styles.notifList}>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>No notifications yet</div>
          )}
        </div>
      </div>
    </LabLayout>
  );
};

export default Notifications;
