import { Info, X } from 'lucide-react';
import Button from '../Button';
import styles from './Modal.module.css';

const InfoModal = ({
  open,
  title = 'Information',
  message,
  details,
  primaryText = 'OK',
  secondaryText,
  onPrimary,
  onSecondary,
  onClose,
}) => {
  if (!open) return null;

  const extraDetails = Array.isArray(details) ? details.filter(Boolean) : [];

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.iconInfo}>
            <Info size={18} />
          </div>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} type="button" onClick={onClose || onPrimary} aria-label="Close">
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
          {secondaryText ? (
            <Button variant="secondary" onClick={onSecondary || onClose || onPrimary}>{secondaryText}</Button>
          ) : null}
          <Button variant="primary" onClick={onPrimary || onClose}>{primaryText}</Button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
