import { Eye, EyeOff, Lock } from 'lucide-react';
import styles from './AdminSettingsCards.module.css';

const ChangePasswordCard = ({
  form,
  saving,
  message,
  strength,
  errors,
  canSubmit,
  visibility,
  onToggleVisibility,
  onChange,
  onSubmit,
}) => {
  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleWrap}>
          <Lock className={styles.cardIcon} />
          <div>
            <h2 className={styles.cardTitle}>Security</h2>
            <p className={styles.cardDesc}>Change your password and maintain account security.</p>
          </div>
        </div>
      </div>

      {message?.text && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Current Password <span className={styles.required}>*</span></label>
          <div className={styles.passwordWrap}>
            <input
              type={visibility.current ? 'text' : 'password'}
              className={`${styles.input} ${errors?.currentPassword ? styles.inputError : ''}`}
              value={form.currentPassword}
              onChange={(e) => onChange('currentPassword', e.target.value)}
              required
            />
            <button className={styles.iconButton} type="button" onClick={() => onToggleVisibility('current')}>
              {visibility.current ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors?.currentPassword && <span className={styles.helperText}>{errors.currentPassword}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>New Password <span className={styles.required}>*</span></label>
          <div className={styles.passwordWrap}>
            <input
              type={visibility.new ? 'text' : 'password'}
              className={`${styles.input} ${errors?.newPassword ? styles.inputError : ''}`}
              value={form.newPassword}
              onChange={(e) => onChange('newPassword', e.target.value)}
              required
            />
            <button className={styles.iconButton} type="button" onClick={() => onToggleVisibility('new')}>
              {visibility.new ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {form.newPassword && (
            <div className={styles.passwordStrength}>
              <span className={styles.helperText}>Strength</span>
              <span className={`${styles.strengthPill} ${styles[strength]}`}>{strength}</span>
            </div>
          )}
          {errors?.newPassword && <span className={styles.helperText}>{errors.newPassword}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm New Password <span className={styles.required}>*</span></label>
          <div className={styles.passwordWrap}>
            <input
              type={visibility.confirm ? 'text' : 'password'}
              className={`${styles.input} ${errors?.confirmPassword ? styles.inputError : ''}`}
              value={form.confirmPassword}
              onChange={(e) => onChange('confirmPassword', e.target.value)}
              required
            />
            <button className={styles.iconButton} type="button" onClick={() => onToggleVisibility('confirm')}>
              {visibility.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors?.confirmPassword && <span className={styles.helperText}>{errors.confirmPassword}</span>}
        </div>
      </div>

      <div className={styles.actionRow}>
        <button className={styles.primaryButton} type="submit" disabled={saving || !canSubmit}>
          {saving ? 'Updating...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordCard;
