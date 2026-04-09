import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import styles from './AuthLayout.module.css';

const AuthLayout = ({
  children,
  title,
  subtitle,
  imageSrc,
  imageAlt,
  imageCaption,
  highlights = [],
}) => {
  return (
    <div className={styles.authLayout}>
      {/* Left panel — illustration */}
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className={styles.brand}>
            <Heart className={styles.brandIcon} />
            <span className={styles.brandText}>MediConnect</span>
          </div>

          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>

          {highlights.length > 0 && (
            <ul className={styles.highlightList}>
              {highlights.map((item) => (
                <li key={item} className={styles.highlightItem}>
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className={styles.imageWrapper}>
            <img
              src={imageSrc}
              alt={imageAlt || 'Healthcare illustration'}
              className={styles.image}
            />
            {imageCaption && (
              <p className={styles.imageCaption}>{imageCaption}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
