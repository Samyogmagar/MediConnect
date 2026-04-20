import { Building2 } from 'lucide-react';
import styles from './AdminSettingsCards.module.css';

const HospitalInfoCard = ({ form, errors, message, saving, provinces, onChange, onSubmit }) => {
  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleWrap}>
          <Building2 className={styles.cardIcon} />
          <div>
            <h2 className={styles.cardTitle}>Hospital Information</h2>
            <p className={styles.cardDesc}>Official hospital profile and contact information.</p>
          </div>
        </div>
      </div>

      {message?.text && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Hospital Name <span className={styles.required}>*</span></label>
          <input
            className={`${styles.input} ${errors?.hospitalName ? styles.inputError : ''}`}
            value={form.hospitalName}
            onChange={(e) => onChange('hospitalName', e.target.value)}
            required
          />
          {errors?.hospitalName && <span className={styles.helperText}>{errors.hospitalName}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tagline</label>
          <input className={styles.input} value={form.tagline} onChange={(e) => onChange('tagline', e.target.value)} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Hospital Email</label>
          <input
            className={`${styles.input} ${errors?.contactEmail ? styles.inputError : ''}`}
            value={form.contactEmail}
            onChange={(e) => onChange('contactEmail', e.target.value)}
            placeholder="hospital@example.com"
          />
          {errors?.contactEmail && <span className={styles.helperText}>{errors.contactEmail}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Hospital Phone</label>
          <input
            className={`${styles.input} ${errors?.contactPhone ? styles.inputError : ''}`}
            value={form.contactPhone}
            onChange={(e) => onChange('contactPhone', e.target.value)}
            placeholder="+977-XXXXXXXXXX"
          />
          {errors?.contactPhone && <span className={styles.helperText}>{errors.contactPhone}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Hospital Website</label>
          <input
            className={`${styles.input} ${errors?.website ? styles.inputError : ''}`}
            value={form.website}
            onChange={(e) => onChange('website', e.target.value)}
            placeholder="https://examplehospital.com"
          />
          {errors?.website && <span className={styles.helperText}>{errors.website}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Hospital Logo URL</label>
          <input
            className={`${styles.input} ${errors?.hospitalLogoUrl ? styles.inputError : ''}`}
            value={form.hospitalLogoUrl}
            onChange={(e) => onChange('hospitalLogoUrl', e.target.value)}
            placeholder="https://.../logo.png"
          />
          {errors?.hospitalLogoUrl && <span className={styles.helperText}>{errors.hospitalLogoUrl}</span>}
          {form.hospitalLogoUrl && (
            <span className={styles.helperText}>Logo preview shown below.</span>
          )}
        </div>

        {form.hospitalLogoUrl && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Logo Preview</label>
            <img className={styles.logoPreview} src={form.hospitalLogoUrl} alt="Hospital logo preview" />
          </div>
        )}

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Hospital Description</label>
          <textarea
            className={styles.textarea}
            value={form.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Short overview of the hospital and care focus"
          />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Street Address</label>
          <input className={styles.input} value={form.street} onChange={(e) => onChange('street', e.target.value)} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>City</label>
          <input className={styles.input} value={form.city} onChange={(e) => onChange('city', e.target.value)} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Province</label>
          <select className={styles.select} value={form.province} onChange={(e) => onChange('province', e.target.value)}>
            <option value="">Select Province</option>
            {provinces.map((province) => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button className={styles.primaryButton} type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Hospital Information'}
        </button>
      </div>
    </form>
  );
};

export default HospitalInfoCard;
