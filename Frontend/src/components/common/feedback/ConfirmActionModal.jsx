import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../Button';
import styles from './Modal.module.css';

const ConfirmActionModal = ({
  open,
  title = 'Confirm action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmVariant = 'danger',
  loading = false,
  details = [],
  inputConfig,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) {
        onCancel?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, loading, onCancel]);

  const normalizedDetails = useMemo(
    () => (Array.isArray(details) ? details.filter((item) => item?.value !== undefined && item?.value !== null && item?.value !== '') : []),
    [details]
  );

  if (!open) return null;

  const handleConfirmClick = () => {
    if (inputConfig?.required && !inputValue.trim()) {
      setFieldError(inputConfig.requiredMessage || 'This field is required.');
      return;
    }
    setFieldError('');
    onConfirm?.(inputValue.trim());
  };

  const renderInputField = () => {
    if (!inputConfig) return null;

    const label = inputConfig.label || 'Reason';

    if (inputConfig.type === 'select') {
      return (
        <div className={styles.fieldWrap}>
          <label className={styles.fieldLabel} htmlFor="confirm-action-select">{label}</label>
          <select
            id="confirm-action-select"
            className={styles.fieldSelect}
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              if (fieldError) setFieldError('');
            }}
            disabled={loading}
          >
            <option value="">{inputConfig.placeholder || 'Select an option'}</option>
            {(inputConfig.options || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError ? <p className={styles.fieldError}>{fieldError}</p> : null}
        </div>
      );
    }

    if (inputConfig.type === 'input') {
      return (
        <div className={styles.fieldWrap}>
          <label className={styles.fieldLabel} htmlFor="confirm-action-input">{label}</label>
          <input
            id="confirm-action-input"
            className={styles.fieldInput}
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              if (fieldError) setFieldError('');
            }}
            placeholder={inputConfig.placeholder || ''}
            disabled={loading}
          />
          {fieldError ? <p className={styles.fieldError}>{fieldError}</p> : null}
        </div>
      );
    }

    return (
      <div className={styles.fieldWrap}>
        <label className={styles.fieldLabel} htmlFor="confirm-action-textarea">{label}</label>
        <textarea
          id="confirm-action-textarea"
          className={styles.fieldTextarea}
          rows={inputConfig.rows || 3}
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            if (fieldError) setFieldError('');
          }}
          placeholder={inputConfig.placeholder || ''}
          disabled={loading}
        />
        {fieldError ? <p className={styles.fieldError}>{fieldError}</p> : null}
      </div>
    );
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.iconDanger}>
            <AlertTriangle size={18} />
          </div>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} type="button" onClick={onCancel} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <p className={styles.message}>{message}</p>
        {normalizedDetails.length > 0 ? (
          <div className={styles.details}>
            {normalizedDetails.map((item) => (
              <div className={styles.detailRow} key={`${item.label}-${item.value}`}>
                <span className={styles.detailLabel}>{item.label}</span>
                <span className={styles.detailValue}>{item.value}</span>
              </div>
            ))}
          </div>
        ) : null}
        {renderInputField()}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirmClick} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
