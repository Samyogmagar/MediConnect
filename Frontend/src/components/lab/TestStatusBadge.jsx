import styles from './TestStatusBadge.module.css';

const STATUS_LABELS = {
  assigned: 'Assigned',
  sample_collected: 'Sample Collected',
  processing: 'Processing',
  report_uploaded: 'Report Uploaded',
  cancelled: 'Cancelled',
};

const STATUS_CLASSES = {
  assigned: 'statusAssigned',
  sample_collected: 'statusCollected',
  processing: 'statusProcessing',
  report_uploaded: 'statusUploaded',
  cancelled: 'statusCancelled',
};

const TestStatusBadge = ({ status }) => {
  const label = STATUS_LABELS[status] || status || 'Unknown';
  const className = STATUS_CLASSES[status] || 'statusAssigned';

  return (
    <span className={styles[className]}>{label}</span>
  );
};

export default TestStatusBadge;
