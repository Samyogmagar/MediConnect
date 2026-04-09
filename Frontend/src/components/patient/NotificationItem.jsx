import {
  CheckCircle,
  CalendarCheck,
  FileText,
  AlertCircle,
  Clock,
  XCircle,
  Pill,
  Bell as BellIcon,
} from 'lucide-react';
import styles from './NotificationItem.module.css';

const typeConfig = {
  appointment_approved: { icon: CheckCircle, color: '#059669', bg: '#ecfdf5' },
  appointment_created: { icon: CalendarCheck, color: '#2563eb', bg: '#eff6ff' },
  appointment_rejected: { icon: XCircle, color: '#dc2626', bg: '#fef2f2' },
  appointment_cancelled: { icon: XCircle, color: '#dc2626', bg: '#fef2f2' },
  appointment_completed: { icon: CheckCircle, color: '#059669', bg: '#ecfdf5' },
  diagnostic_completed: { icon: FileText, color: '#2563eb', bg: '#eff6ff' },
  diagnostic_report_uploaded: { icon: FileText, color: '#2563eb', bg: '#eff6ff' },
  diagnostic_assigned: { icon: FileText, color: '#7c3aed', bg: '#f5f3ff' },
  diagnostic_in_progress: { icon: Clock, color: '#d97706', bg: '#fffbeb' },
  medication_prescribed: { icon: Pill, color: '#059669', bg: '#ecfdf5' },
  medication_reminder: { icon: AlertCircle, color: '#ea580c', bg: '#fff7ed' },
  medication_discontinued: { icon: Pill, color: '#dc2626', bg: '#fef2f2' },
  system_message: { icon: BellIcon, color: '#64748b', bg: '#f8fafc' },
};

const NotificationItem = ({ notification, onMarkRead }) => {
  const config = typeConfig[notification.type] || typeConfig.system_message;
  const Icon = config.icon;

  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <div
      className={`${styles.item} ${!notification.isRead ? styles.unread : ''}`}
      onClick={() => {
        if (!notification.isRead && onMarkRead) {
          onMarkRead(notification._id);
        }
      }}
    >
      <div className={styles.iconWrapper} style={{ background: config.bg }}>
        <Icon size={18} style={{ color: config.color }} />
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{notification.title}</p>
        <p className={styles.message}>{notification.message}</p>
        <p className={styles.time}>{timeAgo}</p>
      </div>
      {!notification.isRead && <span className={styles.unreadDot} />}
    </div>
  );
};

function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDay < 7) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default NotificationItem;
