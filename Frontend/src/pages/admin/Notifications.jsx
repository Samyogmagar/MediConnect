import { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  FlaskConical,
  FileText,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import notificationService from '../../services/notificationService';
import styles from './Notifications.module.css';

const typeIconMap = {
  appointment: Calendar,
  diagnostic: FlaskConical,
  application: FileText,
  alert: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

const typeColorMap = {
  appointment: styles.iconBlue,
  diagnostic: styles.iconPurple,
  application: styles.iconGreen,
  alert: styles.iconRed,
  info: styles.iconBlue,
  success: styles.iconGreen,
};

const priorityMap = {
  high: { label: 'High Priority', className: 'priorityHigh' },
  medium: { label: 'Medium', className: 'priorityMedium' },
  normal: { label: 'Normal', className: 'priorityNormal' },
  low: { label: 'Low', className: 'priorityLow' },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifRes.data?.notifications || []);
      setUnreadCount(countRes.data?.count ?? countRes.data?.unreadCount ?? 0);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const highPriorityCount = notifications.filter(
    (n) => (n.priority || '').toLowerCase() === 'high'
  ).length;

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await notificationService.deleteNotification(id);
      const deleted = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deleted && !deleted.isRead) setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const timeAgo = (d) => {
    if (!d) return '';
    const seconds = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Notifications</h1>
            <div className={styles.badges}>
              {highPriorityCount > 0 && (
                <span className={styles.badgeRed}>{highPriorityCount} high priority</span>
              )}
              {unreadCount > 0 && (
                <span className={styles.badgeBlue}>{unreadCount} unread</span>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={handleMarkAllAsRead}>
              <CheckCheck size={16} /> Mark all as read
            </button>
          )}
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {loading ? (
          <div className={styles.loadingState}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <Bell size={40} strokeWidth={1.2} />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className={styles.list}>
            {notifications.map((n) => {
              const Icon = typeIconMap[n.type] || Bell;
              const colorClass = typeColorMap[n.type] || styles.iconBlue;
              const priority = priorityMap[(n.priority || 'normal').toLowerCase()] || priorityMap.normal;

              return (
                <div
                  key={n._id}
                  className={`${styles.card} ${!n.isRead ? styles.unread : ''}`}
                  onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                >
                  <div className={`${styles.iconWrap} ${colorClass}`}>
                    <Icon size={18} />
                  </div>

                  <div className={styles.content}>
                    <div className={styles.titleRow}>
                      <span className={styles.notifTitle}>
                        {!n.isRead && <span className={styles.unreadDot} />}
                        {n.title || 'Notification'}
                      </span>
                      <span className={styles.time}>{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className={styles.message}>{n.message}</p>
                    <span className={`${styles.priorityBadge} ${styles[priority.className]}`}>
                      {priority.label}
                    </span>
                  </div>

                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(n._id);
                    }}
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Notifications;
