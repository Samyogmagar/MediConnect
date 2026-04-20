import { AlertCircle, X } from 'lucide-react';
import Button from '../Button';
import styles from './Modal.module.css';

const ErrorModal = ({
  open,
  title = 'Something went wrong',
  message,
  details,
  actionText = 'Close',
  onAction,
  onClose,
}) => {
  if (!open) return null;

  const extraDetails = Array.isArray(details) ? details.filter(Boolean) : [];

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.iconError}>
            <AlertCircle size={18} />
          </div>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <p className={styles.message}>{message}</p>
        {extraDetails.length > 0 ? (
          <div className={styles.details}>
            {extraDetails.map((detail) => (
              <div className={styles.detailRow} key={detail.label}>
                <span className={styles.detailLabel}>{detail.label}</span>
                <span className={styles.detailValue}>{detail.value}</span>
              </div>
            ))}
          </div>
        ) : null}
        <div className={styles.actions}>
          <Button variant="primary" onClick={onAction || onClose}>{actionText}</Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
