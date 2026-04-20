import { Monitor, Moon, Sun } from 'lucide-react';
import styles from './AdminSettingsCards.module.css';

const options = [
  { key: 'light', title: 'Light', desc: 'Bright admin workspace', icon: Sun },
  { key: 'dark', title: 'Dark', desc: 'Reduced eye strain', icon: Moon },
  { key: 'system', title: 'System', desc: 'Use device preference', icon: Monitor },
];

const AppearanceSettingsCard = ({ value, saving, message, onChange, onSubmit }) => {
  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleWrap}>
          <Monitor className={styles.cardIcon} />
          <div>
            <h2 className={styles.cardTitle}>Appearance</h2>
            <p className={styles.cardDesc}>Select how the admin portal should look.</p>
          </div>
        </div>
      </div>

      {message?.text && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}

      <div className={styles.themeGrid}>
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <label
              key={option.key}
              className={`${styles.themeCard} ${value === option.key ? styles.themeCardActive : ''}`}
            >
              <input
                type="radio"
                value={option.key}
                checked={value === option.key}
                onChange={(e) => onChange(e.target.value)}
                name="appearance"
              />
              <Icon size={16} color="#2563eb" />
              <div>
                <h4>{option.title}</h4>
                <p>{option.desc}</p>
              </div>
            </label>
          );
        })}
      </div>

      <div className={styles.actionRow}>
        <button className={styles.primaryButton} type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Appearance Preference'}
        </button>
      </div>
    </form>
  );
};

export default AppearanceSettingsCard;
