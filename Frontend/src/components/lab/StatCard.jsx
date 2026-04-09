import styles from './StatCard.module.css';

const StatCard = ({ icon, label, value, subtitle, color = 'blue' }) => {
  return (
    <div className={`${styles.card} ${styles[`border${color.charAt(0).toUpperCase() + color.slice(1)}`] || ''}`}>
      {icon && (
        <div className={`${styles.iconWrap} ${styles[`icon${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}>
          {icon}
        </div>
      )}
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={`${styles.value} ${styles[`value${color.charAt(0).toUpperCase() + color.slice(1)}`] || ''}`}>
          {value ?? 0}
        </span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </div>
  );
};

export default StatCard;
