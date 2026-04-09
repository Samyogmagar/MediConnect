import { Calendar, User, Eye, CheckCircle2, XCircle } from 'lucide-react';
import styles from './TestRequestTable.module.css';

const TestRequestTable = ({
  tests = [],
  onAccept,
  onReject,
  onView,
  loading,
  showActions = true,
}) => {
  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusClass = (status) => {
    const map = {
      assigned: 'statusPending',
      sample_collected: 'statusCollected',
      processing: 'statusProcessing',
      report_uploaded: 'statusCompleted',
      cancelled: 'statusCancelled',
    };
    return styles[map[status?.toLowerCase()] || 'statusPending'];
  };

  const getStatusLabel = (status) => {
    const map = {
      assigned: 'Assigned',
      sample_collected: 'Sample Collected',
      processing: 'Processing',
      report_uploaded: 'Report Uploaded',
      cancelled: 'Cancelled',
    };
    return map[status?.toLowerCase()] || status;
  };

  const getPriorityClass = (urgency) => {
    const map = {
      routine: 'priorityNormal',
      urgent: 'priorityUrgent',
      emergency: 'priorityEmergency',
    };
    return styles[map[urgency?.toLowerCase()] || 'priorityNormal'];
  };

  const getPriorityLabel = (urgency) => {
    const map = {
      routine: 'Normal',
      urgent: 'Urgent',
      emergency: 'Emergency',
    };
    return map[urgency?.toLowerCase()] || 'Normal';
  };

  if (loading) {
    return <div className={styles.loading}>Loading test requests...</div>;
  }

  if (tests.length === 0) {
    return <div className={styles.empty}>No test requests found</div>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Test Name</th>
            <th>Doctor Name</th>
            <th>Requested Date</th>
            <th>Priority</th>
            <th>Status</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tests.map((test) => (
            <tr key={test._id}>
              <td>
                <div className={styles.patientCell}>
                  <div className={styles.avatarSmall}>
                    <User size={14} />
                  </div>
                  <div>
                    <span className={styles.name}>{test.patientId?.name || 'Unknown'}</span>
                    {(test.patientId?.age || test.patientId?.gender) && (
                      <span className={styles.subtext}>
                        {test.patientId?.age ? `${test.patientId.age} yrs` : ''}
                        {test.patientId?.age && test.patientId?.gender ? ', ' : ''}
                        {test.patientId?.gender || ''}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <span className={styles.testName}>{test.testName || '—'}</span>
              </td>
              <td>
                <div className={styles.doctorCell}>
                  <span className={styles.name}>
                    {test.doctorId?.name ? `Dr. ${test.doctorId.name}` : '—'}
                  </span>
                  {test.doctorId?.professionalDetails?.specialization && (
                    <span className={styles.subtext}>
                      {test.doctorId.professionalDetails.specialization}
                    </span>
                  )}
                </div>
              </td>
              <td>
                <div className={styles.dateCell}>
                  <Calendar size={13} />
                  <span>{formatDate(test.assignedAt || test.createdAt)}</span>
                </div>
              </td>
              <td>
                <span className={getPriorityClass(test.urgency)}>
                  {test.urgency === 'urgent' || test.urgency === 'emergency' ? '⊘ ' : ''}
                  {getPriorityLabel(test.urgency)}
                </span>
              </td>
              <td>
                <span className={getStatusClass(test.status)}>
                  {getStatusLabel(test.status)}
                </span>
              </td>
              {showActions && (
                <td>
                  <div className={styles.actions}>
                    <button
                      className={`${styles.btn} ${styles.btnView}`}
                      onClick={() => onView && onView(test)}
                      title="View"
                    >
                      <Eye size={14} /> View
                    </button>
                    {test.status === 'assigned' && (
                      <>
                        <button
                          className={`${styles.btn} ${styles.btnAccept}`}
                          onClick={() => onAccept && onAccept(test)}
                          title="Collect Sample"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                        <button
                          className={`${styles.btn} ${styles.btnReject}`}
                          onClick={() => onReject && onReject(test)}
                          title="Reject"
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestRequestTable;
