import { MapPin, Star, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import styles from './DoctorCard.module.css';

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  const name = doctor.name || 'Unknown Doctor';
  const details = doctor.professionalDetails || {};
  const specialization = details.specialization || 'General';
  const hospital = details.hospital || '';
  const experience = details.experience || 0;
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.left}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <p className={styles.name}>{name}</p>
            <p className={styles.specialization}>{specialization}</p>
          </div>
        </div>
        {doctor.isVerified && (
          <span className={styles.verifiedBadge}>
            <ShieldCheck size={14} /> Verified
          </span>
        )}
      </div>

      {hospital && (
        <p className={styles.meta}>
          <MapPin size={14} /> {hospital}
        </p>
      )}

      <div className={styles.details}>
        <span className={styles.rating}>
          <Star size={14} className={styles.starIcon} /> 4.8 rating
        </span>
        <span className={styles.dot}>•</span>
        <span>{experience} years experience</span>
      </div>

      <p className={styles.availability}>Available Today</p>
      <p className={styles.fee}>NPR {doctor.consultationFee || '1,000'}</p>

      <Button
        variant="primary"
        fullWidth
        onClick={() => navigate(`/patient/book-appointment/${doctor._id}`)}
      >
        Book Appointment
      </Button>
    </div>
  );
};

export default DoctorCard;
