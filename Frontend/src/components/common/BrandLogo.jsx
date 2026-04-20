import { Heart } from 'lucide-react';
import styles from './BrandLogo.module.css';

const BrandLogo = ({ className = '', textClassName = '', iconClassName = '' }) => {
  const rootClassName = className ? `${styles.logo} ${className}` : styles.logo;
  const resolvedTextClass = textClassName ? `${styles.text} ${textClassName}` : styles.text;
  const resolvedIconClass = iconClassName ? `${styles.icon} ${iconClassName}` : styles.icon;

  return (
    <span className={rootClassName} aria-label="MediConnect">
      <Heart className={resolvedIconClass} />
      <span className={resolvedTextClass}>MediConnect</span>
    </span>
  );
};

export default BrandLogo;
