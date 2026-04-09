import { User, Calendar, Phone, Mail } from 'lucide-react';
import styles from './PatientTestSummaryCard.module.css';

const getAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let years = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    years -= 1;
  }
  return years > 0 ? years : null;
};

const PatientTestSummaryCard = ({ patient, instructions }) => {
  const age = getAge(patient?.dateOfBirth);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <User size={16} />
        <div>
          <span className={styles.label}>Patient</span>
          <h3 className={styles.name}>{patient?.name || 'Unknown'}</h3>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.infoItem}>
          <Calendar size={14} />
          <div>
            <span className={styles.infoLabel}>Age / Gender</span>
            <span className={styles.infoValue}>
              {age ? `${age} yrs` : '—'}{patient?.gender ? ` · ${patient.gender}` : ''}
            </span>
          </div>
        </div>
        <div className={styles.infoItem}>
          <Phone size={14} />
          <div>
            <span className={styles.infoLabel}>Phone</span>
            <span className={styles.infoValue}>{patient?.contactNumber || patient?.phone || '—'}</span>
          </div>
        </div>
        <div className={styles.infoItem}>
          <Mail size={14} />
          <div>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{patient?.email || '—'}</span>
          </div>
        </div>
      </div>

      {instructions && (
        <div className={styles.instructions}>
          <span className={styles.infoLabel}>Test Instructions</span>
          <p className={styles.instructionsText}>{instructions}</p>
        </div>
      )}
    </div>
  );
};

export default PatientTestSummaryCard;
