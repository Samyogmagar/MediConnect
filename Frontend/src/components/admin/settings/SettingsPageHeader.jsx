import styles from './AdminSettingsCards.module.css';

const SettingsPageHeader = () => {
  return (
    <div>
      <h1 className={styles.cardTitle} style={{ fontSize: '1.55rem' }}>Admin Settings</h1>
      <p className={styles.cardDesc} style={{ fontSize: '0.9rem' }}>
        Manage your account, hospital configuration, and system preferences.
      </p>
    </div>
  );
};

export default SettingsPageHeader;
