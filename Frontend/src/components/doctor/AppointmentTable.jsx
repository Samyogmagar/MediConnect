import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import styles from './AppointmentTable.module.css';

const AppointmentTable = ({ appointments = [], onApprove, onReject, onComplete, onView, loading }) => {
  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getStatusClass = (status) => {
    const map = {
      pending: 'statusPending',
      approved: 'statusApproved',
      confirmed: 'statusApproved',
      completed: 'statusCompleted',
      cancelled: 'statusCancelled',
      rejected: 'statusRejected',
    };
    return styles[map[status?.toLowerCase()] || 'statusPending'];
  };

  const normalizeStatus = (status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'approved') return 'confirmed';
    if (normalized === 'rejected') return 'cancelled';
    return normalized;
  };

  if (loading) {
    return <div className={styles.loading}>Loading appointments...</div>;
  }

  if (appointments.length === 0) {
    return <div className={styles.empty}>No appointments found</div>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Date & Time</th>
            <th>Type</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr key={apt._id}>
              <td>
                <div className={styles.patientCell}>
                  <span className={styles.name}>{apt.patientId?.name || 'Unknown'}</span>
                  <span className={styles.email}>{apt.patientId?.email || ''}</span>
                </div>
              </td>
              <td>
                <div className={styles.dateCell}>
                  <span className={styles.dateRow}>
                    <Calendar size={13} /> {formatDate(apt.dateTime)}
                  </span>
                  <span className={styles.timeRow}>
                    <Clock size={13} /> {formatTime(apt.dateTime)}
                  </span>
                </div>
              </td>
              <td>
                <span className={styles.typeText}>{apt.type || '—'}</span>
              </td>
              <td>
                <span className={styles.reasonText}>{apt.reason || '—'}</span>
              </td>
              <td>
                <span className={getStatusClass(apt.status)}>{normalizeStatus(apt.status)}</span>
              </td>
              <td>
                <div className={styles.actions}>
                  {apt.status === 'pending' && (
                    <>
                      <button
                        className={`${styles.btn} ${styles.btnApprove}`}
                        onClick={() => onApprove && onApprove(apt)}
                        title="Confirm"
                      >
                        <CheckCircle2 size={14} /> Confirm
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnReject}`}
                        onClick={() => onReject && onReject(apt)}
                        title="Cancel"
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    </>
                  )}
                  {normalizeStatus(apt.status) === 'confirmed' && (
                    <button
                      className={`${styles.btn} ${styles.btnComplete}`}
                      onClick={() => onComplete && onComplete(apt)}
                      title="Complete"
                    >
                      <CheckCircle2 size={14} /> Complete
                    </button>
                  )}
                  <button
                    className={`${styles.btn} ${styles.btnView}`}
                    onClick={() => onView && onView(apt)}
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;
