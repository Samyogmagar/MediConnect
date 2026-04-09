import { Calendar, ClipboardList, Stethoscope } from 'lucide-react';
import TestStatusBadge from './TestStatusBadge';
import styles from './TestOrderSummaryCard.module.css';

const TestOrderSummaryCard = ({ test }) => {
  const orderedDate = test?.assignedAt || test?.createdAt;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.label}>Test Order</span>
          <h2 className={styles.title}>{test?.testName || 'Diagnostic Test'}</h2>
        </div>
        <TestStatusBadge status={test?.status} />
      </div>

      <div className={styles.grid}>
        <div className={styles.item}>
          <Calendar size={14} />
          <div>
            <span className={styles.itemLabel}>Ordered Date</span>
            <span className={styles.itemValue}>
              {orderedDate ? new Date(orderedDate).toLocaleDateString('en-US') : '—'}
            </span>
          </div>
        </div>
        <div className={styles.item}>
          <ClipboardList size={14} />
          <div>
            <span className={styles.itemLabel}>Appointment Ref</span>
            <span className={styles.itemValue}>
              {test?.appointmentId?._id ? test.appointmentId._id.slice(-8).toUpperCase() : '—'}
            </span>
          </div>
        </div>
        <div className={styles.item}>
          <Stethoscope size={14} />
          <div>
            <span className={styles.itemLabel}>Ordering Doctor</span>
            <span className={styles.itemValue}>
              {test?.doctorId?.name ? `Dr. ${test.doctorId.name}` : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestOrderSummaryCard;
