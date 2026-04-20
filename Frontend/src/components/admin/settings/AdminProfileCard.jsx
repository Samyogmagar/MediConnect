import { Mail, MapPin, Phone, User } from 'lucide-react';
import styles from './AdminSettingsCards.module.css';

const AdminProfileCard = ({
  profile,
  errors,
  saving,
  message,
  provinces,
  onChange,
  onSubmit,
}) => {
  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleWrap}>
          <User className={styles.cardIcon} />
          <div>
            <h2 className={styles.cardTitle}>Personal Information</h2>
            <p className={styles.cardDesc}>Manage your personal admin account profile.</p>
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
          <label className={styles.label}>Full Name <span className={styles.required}>*</span></label>
          <input
            className={`${styles.input} ${errors?.name ? styles.inputError : ''}`}
            value={profile.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Full name"
            required
          />
          {errors?.name && <span className={styles.helperText}>{errors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <div className={styles.inlineField}>
            <Mail size={14} color="#94a3b8" />
            <input className={styles.input} value={profile.email} disabled />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Phone Number</label>
          <div className={styles.inlineField}>
            <Phone size={14} color="#94a3b8" />
            <input
              className={`${styles.input} ${errors?.phone ? styles.inputError : ''}`}
              value={profile.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="+977-98XXXXXXXX"
            />
          </div>
          {errors?.phone && <span className={styles.helperText}>{errors.phone}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Role Title</label>
          <input className={styles.input} value="Super Admin" disabled />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Street Address</label>
          <div className={styles.inlineField}>
            <MapPin size={14} color="#94a3b8" />
            <input
              className={styles.input}
              value={profile.street}
              onChange={(e) => onChange('street', e.target.value)}
              placeholder="Street / area"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>City</label>
          <input className={styles.input} value={profile.city} onChange={(e) => onChange('city', e.target.value)} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Province</label>
          <select className={styles.select} value={profile.province} onChange={(e) => onChange('province', e.target.value)}>
            <option value="">Select Province</option>
            {provinces.map((province) => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button className={styles.primaryButton} type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};

export default AdminProfileCard;
