import { Calendar, Clock, MapPin } from 'lucide-react';
import styles from './AppointmentCard.module.css';

const statusConfig = {
  pending: { label: 'Pending', className: 'statusPending' },
  confirmed: { label: 'Confirmed', className: 'statusConfirmed' },
  approved: { label: 'Confirmed', className: 'statusConfirmed' },
  rejected: { label: 'Cancelled', className: 'statusCancelled' },
  completed: { label: 'Completed', className: 'statusCompleted' },
  cancelled: { label: 'Cancelled', className: 'statusCancelled' },
};

const AppointmentCard = ({ appointment, onCancel, variant = 'row' }) => {
  const doctor = appointment.doctorId || {};
  const normalizedStatus = appointment.status === 'approved'
    ? 'confirmed'
    : appointment.status === 'rejected'
      ? 'cancelled'
      : appointment.status;
  const status = statusConfig[normalizedStatus] || statusConfig.pending;
  const dateTime = new Date(appointment.dateTime);

  const formattedDate = dateTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = dateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const doctorName = doctor.name || 'Unknown Doctor';
  const specialization = doctor.professionalDetails?.specialization || '';
  const hospital = doctor.professionalDetails?.hospital || '';
  const initials = doctorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (variant === 'compact') {
    return (
      <div className={styles.compactCard}>
        <div className={styles.compactLeft}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <p className={styles.doctorName}>{doctorName}</p>
            <p className={styles.specialization}>{specialization}</p>
            <div className={styles.meta}>
              <span className={styles.metaItem}>
                <Clock size={13} /> {formattedDate} at {formattedTime}
              </span>
              {hospital && (
                <span className={styles.metaItem}>
                  <MapPin size={13} /> {hospital}
                </span>
              )}
            </div>
          </div>
        </div>
        <span
          className={`${styles.statusBadge} ${styles[status.className]}`}
        >
          {status.label}
        </span>
      </div>
    );
  }

  // Row variant (for table-like list)
  return (
    <div className={styles.rowCard}>
      <div className={styles.rowDoctor}>
        <div className={styles.avatar}>{initials}</div>
        <div>
          <p className={styles.doctorName}>{doctorName}</p>
          <p className={styles.specialization}>{specialization}</p>
        </div>
      </div>
      <div className={styles.rowDateTime}>
        <span className={styles.metaItem}>
          <Calendar size={14} /> {formattedDate}
        </span>
        <span className={styles.metaItem}>
          <Clock size={14} /> {formattedTime}
        </span>
      </div>
      <div className={styles.rowLocation}>
        {hospital && (
          <span className={styles.metaItem}>
            <MapPin size={14} /> {hospital}
          </span>
        )}
      </div>
      <div className={styles.rowStatus}>
        <span
          className={`${styles.statusBadge} ${styles[status.className]}`}
        >
          {status.label}
        </span>
      </div>
      <div className={styles.rowAction}>
        {normalizedStatus === 'pending' && onCancel && (
          <button className={styles.cancelBtn} onClick={() => onCancel(appointment._id)}>
            Cancel
          </button>
        )}
        {normalizedStatus !== 'pending' && <span className={styles.dash}>-</span>}
      </div>
    </div>
  );
};

export default AppointmentCard;
