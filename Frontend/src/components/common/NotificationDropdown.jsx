import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  CalendarCheck,
  CalendarX,
  FileText,
  AlertCircle,
  Pill,
  UserCheck,
  Clock,
  CheckCheck,
  ArrowRight,
  X,
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import { resolveNotificationTarget } from '../../utils/notificationTarget.util';
import styles from './NotificationDropdown.module.css';

// Map notification types to icons and colors
const typeConfig = {
  appointment_created: { icon: CalendarCheck, color: '#2563eb', bg: '#eff6ff' },
  appointment_approved: { icon: CheckCircle, color: '#059669', bg: '#ecfdf5' },
  appointment_rejected: { icon: CalendarX, color: '#dc2626', bg: '#fef2f2' },
  appointment_cancelled: { icon: CalendarX, color: '#dc2626', bg: '#fef2f2' },
  appointment_completed: { icon: CheckCircle, color: '#059669', bg: '#ecfdf5' },
  diagnostic_assigned: { icon: FileText, color: '#7c3aed', bg: '#f5f3ff' },
  diagnostic_in_progress: { icon: Clock, color: '#d97706', bg: '#fffbeb' },
  diagnostic_completed: { icon: FileText, color: '#059669', bg: '#ecfdf5' },
  diagnostic_report_uploaded: { icon: FileText, color: '#2563eb', bg: '#eff6ff' },
  diagnostic_cancelled: { icon: FileText, color: '#dc2626', bg: '#fef2f2' },
  medication_prescribed: { icon: Pill, color: '#059669', bg: '#ecfdf5' },
  medication_reminder: { icon: AlertCircle, color: '#ea580c', bg: '#fff7ed' },
  medication_discontinued: { icon: Pill, color: '#dc2626', bg: '#fef2f2' },
  role_application_approved: { icon: UserCheck, color: '#059669', bg: '#ecfdf5' },
  role_application_rejected: { icon: UserCheck, color: '#dc2626', bg: '#fef2f2' },
  account_verified: { icon: UserCheck, color: '#059669', bg: '#ecfdf5' },
  system_message: { icon: Bell, color: '#64748b', bg: '#f8fafc' },
};

// Get relative time
function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const NotificationDropdown = ({ 
  role = 'patient',
  unreadCount = 0,
  onUnreadCountChange,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  // Fetch recent notifications when dropdown opens
  const fetchNotifications = useCallback(async () => {
    if (!isOpen) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await notificationService.getNotifications({
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
        if (onUnreadCountChange) {
          onUnreadCountChange(Math.max(0, unreadCount - 1));
        }
        window.dispatchEvent(new Event('notifications:refresh'));
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    // Navigate to target
    const targetUrl = resolveNotificationTarget(notification, role);
    setIsOpen(false);
    navigate(targetUrl);
  };

  // Mark all as read
  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
      window.dispatchEvent(new Event('notifications:refresh'));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // View all notifications
  const handleViewAll = () => {
    setIsOpen(false);
    navigate(`/${role}/notifications`);
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        className={styles.bellBtn}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className={styles.panel}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <span className={styles.headerBadge}>{unreadCount} new</span>
              )}
            </div>
            <div className={styles.headerActions}>
              {unreadCount > 0 && (
                <button
                  className={styles.markAllBtn}
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.loadingSpinner} />
                <span>Loading...</span>
              </div>
            ) : error ? (
              <div className={styles.error}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>
                <Bell size={32} />
                <p>No notifications yet</p>
                <span>We'll notify you when something arrives</span>
              </div>
            ) : (
              <ul className={styles.list}>
                {notifications.map((notification) => {
                  const config = typeConfig[notification.type] || typeConfig.system_message;
                  const Icon = config.icon;
                  
                  return (
                    <li key={notification._id}>
                      <button
                        className={`${styles.item} ${!notification.isRead ? styles.unread : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div 
                          className={styles.iconWrapper}
                          style={{ background: config.bg }}
                        >
                          <Icon size={16} style={{ color: config.color }} />
                        </div>
                        <div className={styles.itemContent}>
                          <p className={styles.itemTitle}>{notification.title}</p>
                          <p className={styles.itemMessage}>
                            {notification.message.length > 80
                              ? `${notification.message.substring(0, 80)}...`
                              : notification.message}
                          </p>
                          <span className={styles.itemTime}>
                            {getTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        {!notification.isRead && (
                          <span className={styles.unreadDot} />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={styles.footer}>
              <button className={styles.viewAllBtn} onClick={handleViewAll}>
                View all notifications
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
