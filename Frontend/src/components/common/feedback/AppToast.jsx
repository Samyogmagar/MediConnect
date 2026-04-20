import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import styles from './ToastProvider.module.css';

const iconByType = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const AppToast = ({ toast, onClose }) => {
  const Icon = iconByType[toast.type] || Info;

  return (
    <div className={`${styles.toast} ${styles[toast.type] || ''}`}>
      <div className={styles.iconWrap}>
        <Icon size={16} />
      </div>
      <div className={styles.content}>
        {toast.title ? <p className={styles.title}>{toast.title}</p> : null}
        {toast.message ? <p className={styles.message}>{toast.message}</p> : null}
      </div>
      <button
        className={styles.closeBtn}
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default AppToast;
