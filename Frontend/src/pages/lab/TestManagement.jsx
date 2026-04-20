import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import LabLayout from '../../components/lab/LabLayout';
import TestOrderSummaryCard from '../../components/lab/TestOrderSummaryCard';
import PatientTestSummaryCard from '../../components/lab/PatientTestSummaryCard';
import DoctorInstructionsCard from '../../components/lab/DoctorInstructionsCard';
import ReportUploadPanel from '../../components/lab/ReportUploadPanel';
import UploadHistoryCard from '../../components/lab/UploadHistoryCard';
import TestStatusBadge from '../../components/lab/TestStatusBadge';
import { useToast } from '../../components/common/feedback/ToastProvider';
import { useModal } from '../../components/common/feedback/ModalProvider';
import labService from '../../services/labService';
import styles from './TestManagement.module.css';

const TestManagement = () => {
  const { showToast } = useToast();
  const { showConfirm } = useModal();
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTest = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await labService.getTestById(id);
      setTest(res.data?.test || null);
    } catch (err) {
      console.error('Error loading test:', err);
      setError('Unable to load test details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  const handleStatusUpdate = async (nextStatus, notes) => {
    if (!test) return;
    const { confirmed } = await showConfirm({
      title: 'Confirm status update?',
      message: `Update test status to "${nextStatus.replace('_', ' ')}"?`,
      confirmText: 'Update status',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
    });
    if (!confirmed) return;

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await labService.updateTestStatus(test._id, nextStatus, notes);
      setTest(response.data?.test || test);
      setSuccess('Status updated successfully.');
      showToast({
        type: 'success',
        title: 'Status updated',
        message: `Test marked as ${nextStatus.replace('_', ' ')}.`,
      });
    } catch (err) {
      console.error('Status update error:', err);
      setError(err.response?.data?.message || 'Failed to update status.');
      showToast({
        type: 'error',
        title: 'Update failed',
        message: err.response?.data?.message || 'Failed to update status.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportUpload = async ({ testId, file, notes, findings, recommendations }) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await labService.submitReport(testId, file, { notes, findings, recommendations });
      setSuccess('Report uploaded and shared with doctor and patient.');
      fetchTest();
    } catch (err) {
      console.error('Report upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload report.');
    } finally {
      setActionLoading(false);
    }
  };

  const status = test?.status;
  const canCollect = status === 'assigned';
  const canProcess = status === 'sample_collected';
  const canUpload = status === 'processing' || status === 'report_uploaded';

  if (loading) {
    return (
      <LabLayout>
        <div className={styles.page}>
          <div className={styles.loading}>Loading test details...</div>
        </div>
      </LabLayout>
    );
  }

  if (!test) {
    return (
      <LabLayout>
        <div className={styles.page}>
          <div className={styles.errorBanner}>Test not found.</div>
        </div>
      </LabLayout>
    );
  }

  return (
    <LabLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <button className={styles.backBtn} onClick={() => navigate('/lab/assigned-tests')}>
              <ArrowLeft size={16} /> Back to Assigned Tests
            </button>
            <h1 className={styles.title}>Test Management</h1>
            <p className={styles.subtitle}>Track test progress and upload final report.</p>
          </div>
          <div className={styles.statusPill}>
            <TestStatusBadge status={status} />
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}
        {success && <div className={styles.successBanner}>{success}</div>}

        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <TestOrderSummaryCard test={test} />
            <PatientTestSummaryCard patient={test.patientId} instructions={test.instructions} />
            <DoctorInstructionsCard
              doctor={test.doctorId}
              instructions={test.instructions}
              notes={test.description}
            />
          </div>
          <div className={styles.rightColumn}>
            <div className={styles.workflowCard}>
              <h3 className={styles.workflowTitle}>Status Workflow</h3>
              <p className={styles.workflowHint}>
                Move the test through the required lab workflow stages.
              </p>
              <div className={styles.workflowActions}>
                <button
                  className={styles.primaryBtn}
                  disabled={!canCollect || actionLoading}
                  onClick={() => handleStatusUpdate('sample_collected', 'Sample collected')}
                >
                  Mark Sample Collected
                </button>
                <button
                  className={styles.primaryBtn}
                  disabled={!canProcess || actionLoading}
                  onClick={() => handleStatusUpdate('processing', 'Test processing started')}
                >
                  Start Processing
                </button>
                <button
                  className={styles.cancelBtn}
                  disabled={status === 'cancelled' || status === 'report_uploaded' || actionLoading}
                  onClick={() => handleStatusUpdate('cancelled', 'Cancelled by lab')}
                >
                  Cancel Test
                </button>
              </div>
            </div>

            {canUpload && (
              <ReportUploadPanel test={test} onSubmit={handleReportUpload} loading={actionLoading} />
            )}

            <UploadHistoryCard history={test.statusHistory || []} />
          </div>
        </div>
      </div>
    </LabLayout>
  );
};

export default TestManagement;
