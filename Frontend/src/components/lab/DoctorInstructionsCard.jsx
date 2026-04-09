import { Stethoscope, FileText } from 'lucide-react';
import styles from './DoctorInstructionsCard.module.css';

const DoctorInstructionsCard = ({ doctor, instructions, notes }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Stethoscope size={16} />
        <div>
          <span className={styles.label}>Ordering Doctor</span>
          <h3 className={styles.title}>{doctor?.name ? `Dr. ${doctor.name}` : '—'}</h3>
          <p className={styles.subtitle}>{doctor?.professionalDetails?.specialization || 'General Medicine'}</p>
        </div>
      </div>

      <div className={styles.section}>
        <FileText size={14} />
        <div>
          <span className={styles.sectionLabel}>Doctor Instructions</span>
          <p className={styles.sectionText}>{instructions || 'No special instructions provided.'}</p>
        </div>
      </div>

      {notes && (
        <div className={styles.notes}>
          <span className={styles.sectionLabel}>Additional Notes</span>
          <p className={styles.sectionText}>{notes}</p>
        </div>
      )}
    </div>
  );
};

export default DoctorInstructionsCard;
