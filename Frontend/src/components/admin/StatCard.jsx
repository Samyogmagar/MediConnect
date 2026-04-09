import styles from './StatCard.module.css';

/**
 * Reusable stat card for admin dashboard
 * @param {ReactNode} icon - Lucide icon component
 * @param {string} label - e.g. "Pending Doctor Applications"
 * @param {number|string} value - main number
 * @param {string} subtitle - e.g. "+3 new"
 * @param {string} color - icon background color name: blue | purple | green | red | yellow
 */
const StatCard = ({ icon, label, value, subtitle, color = 'blue' }) => {
  return (
    <div className={styles.card}>
      <div className={`${styles.iconWrap} ${styles[color]}`}>
        {icon}
      </div>
      <p className={styles.label}>{label}</p>
      <h3 className={styles.value}>{value}</h3>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
};

export default StatCard;
