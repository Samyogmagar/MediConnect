import { Bell } from 'lucide-react';
import styles from './AdminSettingsCards.module.css';

const NotificationPreferencesCard = ({ preferences, saving, message, onToggle, onSubmit }) => {
  const rows = [
    {
      key: 'accountCreationAlerts',
      title: 'New doctor/lab/admin account created',
      desc: 'Alerts when new staff accounts are created or require onboarding review.',
    },
    {
      key: 'appointmentActivityAlerts',
      title: 'Appointment activity alerts',
      desc: 'Updates for major appointment activity that may affect operations.',
    },
    {
      key: 'labReportUploadAlerts',
      title: 'Lab report upload alerts',
      desc: 'Notifications when diagnostic reports are uploaded.',
    },
    {
      key: 'systemCriticalAlerts',
      title: 'Important system alerts',
      desc: 'Critical platform-level warnings and service-impacting events.',
    },
    {
      key: 'userManagementAlerts',
      title: 'User management alerts',
      desc: 'Changes in user roles, verification, and account status.',
    },
  ];

  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleWrap}>
          <Bell className={styles.cardIcon} />
          <div>
            <h2 className={styles.cardTitle}>Notification Preferences</h2>
            <p className={styles.cardDesc}>Control operational and system-level admin alerts.</p>
          </div>
        </div>
      </div>

      {message?.text && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}

      <div className={styles.switchList}>
        {rows.map((row) => (
          <div className={styles.switchRow} key={row.key}>
            <div className={styles.switchInfo}>
              <h4>{row.title}</h4>
              <p>{row.desc}</p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={Boolean(preferences[row.key])}
                onChange={() => onToggle(row.key)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        ))}
      </div>

      <div className={styles.actionRow}>
        <button className={styles.primaryButton} type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Notification Preferences'}
        </button>
      </div>
    </form>
  );
};

export default NotificationPreferencesCard;
