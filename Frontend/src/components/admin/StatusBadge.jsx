import styles from './StatusBadge.module.css';

const colorMap = {
  pending: 'yellow',
  approved: 'green',
  confirmed: 'green',
  rejected: 'red',
  completed: 'green',
  cancelled: 'gray',
  active: 'green',
  inactive: 'gray',
  in_progress: 'blue',
  'in-progress': 'blue',
  sample_collected: 'blue',
  processing: 'purple',
  report_uploaded: 'green',
  assigned: 'yellow',
  verified: 'green',
  unverified: 'yellow',
  patient: 'blue',
  doctor: 'purple',
  lab: 'teal',
  admin: 'red',
};

/**
 * Renders a colored status badge
 * @param {string} status
 */
const StatusBadge = ({ status }) => {
  const normalised = (status || '').toLowerCase().replace(/\s+/g, '_');
  const color = colorMap[normalised] || 'gray';
  const label = (status || '')
    .toString()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`${styles.badge} ${styles[color]}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
