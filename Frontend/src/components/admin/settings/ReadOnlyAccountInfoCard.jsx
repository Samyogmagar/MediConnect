import { Shield } from 'lucide-react';
import styles from './AdminSettingsCards.module.css';

const ReadOnlyAccountInfoCard = ({ user }) => {
  if (!user) return null;

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleWrap}>
          <Shield className={styles.cardIcon} />
          <div>
            <h2 className={styles.cardTitle}>Account Status</h2>
            <p className={styles.cardDesc}>Read-only account and access information</p>
          </div>
        </div>
      </div>

      <div className={styles.statusCard}>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>Role</span>
          <span className={styles.statusValue}>Super Admin</span>
        </div>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>Status</span>
          <span className={`${styles.statusBadge} ${styles.badgeActive}`}>Active</span>
        </div>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>Email</span>
          <span className={styles.statusValue}>{user.email}</span>
        </div>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>Created</span>
          <span className={styles.statusValue}>{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </section>
  );
};

export default ReadOnlyAccountInfoCard;
