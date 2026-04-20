import { AlertTriangle } from 'lucide-react';
import styles from './ErrorAlert.module.css';

const ErrorAlert = ({ title = 'Something went wrong', message, children }) => {
  if (!message && !children) return null;

  return (
    <div className={styles.alert} role="alert">
      <AlertTriangle size={16} className={styles.icon} />
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {message ? <p className={styles.message}>{message}</p> : null}
        {children}
      </div>
    </div>
  );
};

export default ErrorAlert;
