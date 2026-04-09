import { createElement } from 'react';
import styles from './DashboardCard.module.css';

const DashboardCard = ({ icon: IconComponent, iconColor = '#2563eb', iconBg = '#eff6ff', title, value, subtitle }) => {
  const iconNode = IconComponent
    ? createElement(IconComponent, { size: 22, style: { color: iconColor } })
    : null;

  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper} style={{ background: iconBg }}>
        {iconNode}
      </div>
      <p className={styles.title}>{title}</p>
      <p className={styles.value}>{value}</p>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
};

export default DashboardCard;
