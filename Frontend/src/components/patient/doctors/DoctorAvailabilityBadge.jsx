import { Clock3, CalendarCheck, CalendarRange, Ban } from 'lucide-react';
import styles from './DoctorAvailabilityBadge.module.css';

const STATUS_CONFIG = {
  loading: { label: 'Checking Availability', icon: Clock3, tone: 'neutral' },
  available_today: { label: 'Available Today', icon: CalendarCheck, tone: 'success' },
  next_tomorrow: { label: 'Next Available Tomorrow', icon: CalendarRange, tone: 'today' },
  upcoming: { label: 'Next Availability Scheduled', icon: CalendarRange, tone: 'today' },
  unavailable: { label: 'On Leave / Unavailable', icon: Ban, tone: 'danger' },
};

const DoctorAvailabilityBadge = ({ snapshot }) => {
  const config = STATUS_CONFIG[snapshot?.status] || STATUS_CONFIG.loading;
  const Icon = config.icon;

  return (
    <span className={`${styles.badge} ${styles[config.tone]}`}>
      <Icon size={13} />
      {snapshot?.label || config.label}
    </span>
  );
};

export default DoctorAvailabilityBadge;
