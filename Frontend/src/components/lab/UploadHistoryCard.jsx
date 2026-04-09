import { Clock } from 'lucide-react';
import TestStatusBadge from './TestStatusBadge';
import styles from './UploadHistoryCard.module.css';

const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const UploadHistoryCard = ({ history = [] }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Clock size={16} />
        <h3 className={styles.title}>Activity Timeline</h3>
      </div>
      {history.length === 0 ? (
        <p className={styles.empty}>No activity recorded yet.</p>
      ) : (
        <div className={styles.list}>
          {history.map((entry, index) => (
            <div key={`${entry.status}-${index}`} className={styles.item}>
              <div className={styles.row}>
                <TestStatusBadge status={entry.status} />
                <span className={styles.time}>{formatDateTime(entry.updatedAt)}</span>
              </div>
              <div className={styles.meta}>
                <span>{entry.updatedBy?.name || 'Lab Staff'}</span>
                {entry.notes && <span className={styles.notes}>{entry.notes}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadHistoryCard;
