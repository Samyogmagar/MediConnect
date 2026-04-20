import { Settings } from 'lucide-react';
import styles from './AdminSettingsCards.module.css';

const SystemConfigurationCard = ({
  form,
  message,
  saving,
  operationalDefaults,
  onChange,
  onToggleOperationalDefault,
  onSubmit,
}) => {
  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleWrap}>
          <Settings className={styles.cardIcon} />
          <div>
            <h2 className={styles.cardTitle}>System Configuration</h2>
            <p className={styles.cardDesc}>Operational defaults for appointments and diagnostics.</p>
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
          <label className={styles.label}>Departments (comma-separated)</label>
          <textarea
            className={styles.textarea}
            value={form.departments}
            onChange={(e) => onChange('departments', e.target.value)}
            placeholder="Cardiology, Neurology, Pediatrics"
          />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Specializations (comma-separated)</label>
          <textarea
            className={styles.textarea}
            value={form.specializations}
            onChange={(e) => onChange('specializations', e.target.value)}
            placeholder="General Medicine, Radiology, Orthopedics"
          />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Lab Test Categories (comma-separated)</label>
          <textarea
            className={styles.textarea}
            value={form.testCategories}
            onChange={(e) => onChange('testCategories', e.target.value)}
            placeholder="Blood Test, X-Ray, CT Scan"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Default Consultation Fee (NPR)</label>
          <input
            type="number"
            min="0"
            className={styles.input}
            value={form.defaultConsultationFee}
            onChange={(e) => onChange('defaultConsultationFee', Number(e.target.value || 0))}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Default Consultation Duration (minutes)</label>
          <input
            type="number"
            min="10"
            max="180"
            className={styles.input}
            value={form.defaultConsultationDurationMinutes}
            onChange={(e) =>
              onChange('defaultConsultationDurationMinutes', Number(e.target.value || 30))
            }
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Default Appointment Slot Duration (minutes)</label>
          <input
            type="number"
            min="10"
            max="180"
            className={styles.input}
            value={form.defaultAppointmentSlotMinutes}
            onChange={(e) => onChange('defaultAppointmentSlotMinutes', Number(e.target.value || 30))}
          />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Booking Cancellation Policy</label>
          <textarea
            className={styles.textarea}
            value={form.bookingCancellationPolicyText}
            onChange={(e) => onChange('bookingCancellationPolicyText', e.target.value)}
            placeholder="Policy text shown to users for cancellation rules"
          />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Booking Reschedule Policy</label>
          <textarea
            className={styles.textarea}
            value={form.bookingReschedulePolicyText}
            onChange={(e) => onChange('bookingReschedulePolicyText', e.target.value)}
            placeholder="Policy text shown to users for reschedule rules"
          />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Operational Notification Defaults</label>
          <div className={styles.switchList}>
            <div className={styles.switchRow}>
              <div className={styles.switchInfo}>
                <h4>Account creation alerts</h4>
                <p>Default alert behavior for new staff account creation events.</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={Boolean(operationalDefaults.accountCreationAlerts)}
                  onChange={() => onToggleOperationalDefault('accountCreationAlerts')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.switchRow}>
              <div className={styles.switchInfo}>
                <h4>Appointment activity alerts</h4>
                <p>Default alerts for appointment booking, update, and cancellation activity.</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={Boolean(operationalDefaults.appointmentActivityAlerts)}
                  onChange={() => onToggleOperationalDefault('appointmentActivityAlerts')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.switchRow}>
              <div className={styles.switchInfo}>
                <h4>Lab report upload alerts</h4>
                <p>Default alerts when lab staff upload reports into the system.</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={Boolean(operationalDefaults.labReportUploadAlerts)}
                  onChange={() => onToggleOperationalDefault('labReportUploadAlerts')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.switchRow}>
              <div className={styles.switchInfo}>
                <h4>Critical system alerts</h4>
                <p>Default alerts for incidents that can affect hospital operations.</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={Boolean(operationalDefaults.systemCriticalAlerts)}
                  onChange={() => onToggleOperationalDefault('systemCriticalAlerts')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.switchRow}>
              <div className={styles.switchInfo}>
                <h4>User management alerts</h4>
                <p>Default alerts for role assignments and account status changes.</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={Boolean(operationalDefaults.userManagementAlerts)}
                  onChange={() => onToggleOperationalDefault('userManagementAlerts')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button className={styles.primaryButton} type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save System Configuration'}
        </button>
      </div>
    </form>
  );
};

export default SystemConfigurationCard;
