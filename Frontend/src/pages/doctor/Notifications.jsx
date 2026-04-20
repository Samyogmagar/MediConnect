import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import notificationService from '../../services/notificationService';
import { resolveNotificationTarget } from '../../utils/notificationTarget.util';
import styles from './Notifications.module.css';

const Notifications = () => {
  const navigate = useNavigate();
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
      const deleted = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const formatTime = (d) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification) => {
    navigate(resolveNotificationTarget(notification, 'doctor'));
  };

  const getTypeIcon = (type) => {
    if (type?.includes('appointment')) return '📅';
    if (type?.includes('diagnostic')) return '🔬';
    if (type?.includes('medication')) return '💊';
    if (type?.includes('role_application') || type?.includes('account')) return '✅';
    return '🔔';
  };

  return (
    <DoctorLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Notifications</h1>
            <p className={styles.subtitle}>
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className={styles.headerActions}>
            <select
              className={styles.filterSelect}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="unread">Unread only</option>
            </select>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
                <CheckCheck size={16} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.notifSection}>
          {loading ? (
            <div className={styles.loading}>Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className={styles.emptyState}>
              <Bell size={40} />
              <p>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
            </div>
          ) : (
            <div className={styles.notifList}>
              {filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`${styles.notifCard} ${!notif.isRead ? styles.unread : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className={styles.notifIcon}>{getTypeIcon(notif.type)}</div>
                  <div className={styles.notifContent}>
                    <h4 className={styles.notifTitle}>{notif.title}</h4>
                    <p className={styles.notifMessage}>{notif.message}</p>
                    <span className={styles.notifTime}>{formatTime(notif.createdAt)}</span>
                  </div>
                  <div className={styles.notifActions}>
                    {!notif.isRead && (
                      <button
                        className={styles.readBtn}
                        onClick={() => handleMarkAsRead(notif._id)}
                        title="Mark as read"
                      >
                        <CheckCheck size={16} />
                      </button>
                    )}
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(notif._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default Notifications;
