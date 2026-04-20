import { CheckCircle2 } from 'lucide-react';
import Button from '../Button';
import styles from './Modal.module.css';

const SuccessModal = ({
  open,
  title = 'Success',
  message,
  primaryText = 'Continue',
  secondaryText,
  onPrimary,
  onSecondary,
}) => {
  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeaderSimple}>
          <div className={styles.iconSuccess}>
            <CheckCircle2 size={18} />
          </div>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          {secondaryText ? (
            <Button variant="secondary" onClick={onSecondary}>
              {secondaryText}
            </Button>
          ) : null}
          <Button variant="primary" onClick={onPrimary}>
            {primaryText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
