import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import NotificationItem from '../../components/patient/NotificationItem';
import Button from '../../components/common/Button';
import notificationService from '../../services/notificationService';
import styles from './Notifications.module.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | unread

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationService.getNotifications({ sortBy: 'createdAt', sortOrder: 'desc' }),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifRes.data?.notifications || []);
      setUnreadCount(countRes.data?.count ?? countRes.data?.unreadCount ?? 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      window.dispatchEvent(new Event('notifications:refresh'));
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date() } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      window.dispatchEvent(new Event('notifications:refresh'));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      window.dispatchEvent(new Event('notifications:refresh'));
      setNotifications((prev) => {
        const removed = prev.find((n) => n._id === id);
        if (removed && !removed.isRead) {
          setUnreadCount((c) => Math.max(c - 1, 0));
        }
        return prev.filter((n) => n._id !== id);
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const displayed =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>
              Notifications
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </h1>
            <p className={styles.pageSubtitle}>Stay updated on appointments and records</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck size={14} /> Mark all read
            </Button>
          )}
        </div>

        {/* Filter */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'unread' ? styles.filterActive : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {loading ? (
          <p className={styles.loadingText}>Loading notifications...</p>
        ) : displayed.length === 0 ? (
          <div className={styles.empty}>
            <Bell size={40} className={styles.emptyIcon} />
            <h3>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</h3>
            <p>
              {filter === 'unread'
                ? 'You\'re all caught up!'
                : 'Notifications about appointments and records will appear here.'}
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {displayed.map((notification) => (
              <div key={notification._id} className={styles.notifRow}>
                <NotificationItem
                  notification={notification}
                  onMarkRead={handleMarkAsRead}
                />
                <button
                  className={styles.deleteBtn}
                  title="Delete"
                  onClick={() => handleDelete(notification._id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
