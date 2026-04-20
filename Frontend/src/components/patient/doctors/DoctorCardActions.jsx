import Button from '../../common/Button';
import styles from './DoctorCardActions.module.css';

const DoctorCardActions = ({ onViewProfile, onBookAppointment }) => {
  return (
    <div className={styles.actions}>
      <Button variant="secondary" size="sm" onClick={onViewProfile} className={styles.secondaryBtn}>
        View Profile
      </Button>
      <Button variant="primary" size="sm" onClick={onBookAppointment} className={styles.primaryBtn}>
        Book Appointment
      </Button>
    </div>
  );
};

export default DoctorCardActions;
