import { User, Phone, Mail, Calendar, FileText, MapPin, Eye, FlaskConical } from 'lucide-react';
import styles from './PatientCard.module.css';

const PatientCard = ({ patient, onViewRecords, onAssignLabTest }) => {
  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGenderLabel = (g) => {
    if (!g) return '';
    return g.charAt(0).toUpperCase() + g.slice(1);
  };

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

  const age = getAge(patient.dateOfBirth);
  const bloodType = patient.bloodType || patient.bloodGroup || null;

  return (
    <div className={styles.card}>
      {/* Patient Header */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          {(patient.profilePicture || patient.profileImageUrl) ? (
            <img src={patient.profilePicture || patient.profileImageUrl} alt={patient.name} />
          ) : (
            <span className={styles.initials}>{getInitials(patient.name)}</span>
          )}
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{patient.name || 'Unknown'}</h3>
          <div className={styles.meta}>
            {age && <span>{age} yrs</span>}
            {patient.gender && age && <span>, </span>}
            {patient.gender && <span>{getGenderLabel(patient.gender)}</span>}
          </div>
          {bloodType && (
            <span className={styles.bloodBadge}>{bloodType}</span>
          )}
        </div>
      </div>

      {/* Contact Details */}
      <div className={styles.details}>
        {patient.phone && (
          <div className={styles.detailRow}>
            <Phone size={14} />
            <span>{patient.phone}</span>
          </div>
        )}
        {patient.email && (
          <div className={styles.detailRow}>
            <Mail size={14} />
            <span>{patient.email}</span>
          </div>
        )}
        {patient.address && (
          <div className={styles.detailRow}>
            <MapPin size={14} />
            <span>{patient.address}</span>
          </div>
        )}
      </div>

      {/* Visit Info */}
      <div className={styles.visitInfo}>
        <div className={styles.visitRow}>
          <span className={styles.visitLabel}>Last Visit:</span>
          <span className={styles.visitValue}>{formatDate(patient.lastVisit)}</span>
        </div>
        <div className={styles.visitRow}>
          <span className={styles.visitLabel}>Total Visits:</span>
          <span className={styles.visitValue}>{patient.appointmentCount || 0}</span>
        </div>
      </div>

      {/* Conditions */}
      {patient.conditions && patient.conditions.length > 0 && (
        <div className={styles.conditionsSection}>
          <span className={styles.conditionsLabel}>Conditions:</span>
          <div className={styles.conditionTags}>
            {patient.conditions.map((c, i) => (
              <span key={i} className={styles.conditionTag}>{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button className={styles.viewBtn} onClick={() => onViewRecords && onViewRecords(patient)}>
          <Eye size={15} /> View Records
        </button>
        <button className={styles.labBtn} onClick={() => onAssignLabTest && onAssignLabTest(patient)}>
          <FlaskConical size={15} /> Assign Lab Test
        </button>
      </div>
    </div>
  );
};

export default PatientCard;
