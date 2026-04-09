import { FileText, Eye, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import styles from './NotificationItem.module.css';

const NotificationItem = ({ notification, onMarkRead, onClick }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'test_assigned':
      case 'diagnostic_assigned':
        return <FileText size={20} />;
      case 'diagnostic_report_uploaded':
      case 'diagnostic_in_progress':
      case 'diagnostic_completed':
      case 'diagnostic_cancelled':
        return <FileText size={20} />;
      case 'report_viewed':
        return <Eye size={20} />;
      case 'test_approved':
        return <CheckCircle2 size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'test_assigned':
      case 'diagnostic_assigned':
        return 'iconBlue';
      case 'diagnostic_report_uploaded':
        return 'iconGreen';
      case 'diagnostic_in_progress':
        return 'iconTeal';
      case 'diagnostic_completed':
        return 'iconGreen';
      case 'diagnostic_cancelled':
        return 'iconGray';
      case 'report_viewed':
        return 'iconGreen';
      case 'test_approved':
        return 'iconTeal';
      case 'system':
        return 'iconGray';
      default:
        return 'iconBlue';
    }
  };

  const getTitle = (notification) => {
    if (notification.title) return notification.title;
    switch (notification.type) {
      case 'test_assigned':
      case 'diagnostic_assigned':
        return 'New Test Assignment';
      case 'diagnostic_report_uploaded':
        return 'Report Uploaded';
      case 'diagnostic_in_progress':
        return 'Test Processing';
      case 'diagnostic_completed':
        return 'Test Completed';
      case 'diagnostic_cancelled':
        return 'Test Cancelled';
      case 'report_viewed':
        return 'Report Viewed';
      case 'test_approved':
        return 'Test Request Approved';
      default:
        return 'System Update';
    }
  };

  const formatTime = (d) => {
    if (!d) return '';
    const now = new Date();
    const date = new Date(d);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isUrgent = notification.urgency === 'urgent' || notification.urgency === 'emergency';

  return (
    <div
      className={`${styles.item} ${!notification.isRead ? styles.unread : ''}`}
      onClick={() => {
        if (!notification.isRead && onMarkRead) onMarkRead(notification._id);
        if (onClick) onClick(notification);
      }}
    >
      <div className={`${styles.iconWrap} ${styles[getIconColor(notification.type)]}`}>
        {getIcon(notification.type)}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.title}>
            {getTitle(notification)}
            {!notification.isRead && <span className={styles.dot}>●</span>}
          </span>
          {isUrgent && (
            <span className={styles.urgentBadge}>
              <AlertCircle size={12} /> High Priority
            </span>
          )}
        </div>
        <p className={styles.message}>{notification.message}</p>
        <span className={styles.time}>{formatTime(notification.createdAt)}</span>
      </div>
    </div>
  );
};

export default NotificationItem;
