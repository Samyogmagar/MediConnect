import { Calendar, Download, Eye, User } from 'lucide-react';
import TestStatusBadge from './TestStatusBadge';
import styles from './ReportListTable.module.css';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const ReportListTable = ({ tests = [], onView, onDownload }) => {
  if (tests.length === 0) {
    return <div className={styles.empty}>No reports found.</div>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Test</th>
            <th>Doctor</th>
            <th>Uploaded</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test) => (
            <tr key={test._id}>
              <td>
                <div className={styles.nameCell}>
                  <div className={styles.avatarSmall}>
                    <User size={14} />
                  </div>
                  <span className={styles.name}>{test.patientId?.name || 'Unknown'}</span>
                </div>
              </td>
              <td>
                <span className={styles.testName}>{test.testName || '—'}</span>
              </td>
              <td>
                <span className={styles.doctorName}>
                  {test.doctorId?.name ? `Dr. ${test.doctorId.name}` : '—'}
                </span>
              </td>
              <td>
                <div className={styles.dateCell}>
                  <Calendar size={13} />
                  {formatDate(test.report?.uploadedAt || test.actualCompletionDate)}
                </div>
              </td>
              <td>
                <TestStatusBadge status={test.status} />
              </td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.actionBtn} onClick={() => onView(test)}>
                    <Eye size={14} /> View
                  </button>
                  <button className={styles.actionBtn} onClick={() => onDownload(test)}>
                    <Download size={14} /> Download
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

export default ReportListTable;
