import { useState, useEffect } from 'react';
import { Upload, AlertCircle, FileText } from 'lucide-react';
import LabLayout from '../../components/lab/LabLayout';
import UploadReportForm from '../../components/lab/UploadReportForm';
import labService from '../../services/labService';
import styles from './UploadReports.module.css';

const UploadReports = () => {
  const [readyTests, setReadyTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReadyTests();
  }, []);

  const fetchReadyTests = async () => {
    setLoading(true);
    try {
      const res = await labService.getTests();
      const allTests = res.data?.tests || [];
      // Tests that are in processing and ready for report upload
      const ready = allTests.filter(
        (t) => t.status === 'processing' && !t.report?.url
      );
      setReadyTests(ready);
    } catch (err) {
      console.error('Error loading tests:', err);
      setError('Failed to load test data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async ({ testId, file, notes, findings, recommendations }) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await labService.submitReport(testId, file, { notes, findings, recommendations });
      setSuccess('Report submitted successfully!');
      // Refresh the list
      fetchReadyTests();
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LabLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Upload Diagnostic Reports</h1>
          <p className={styles.subtitle}>Upload completed test reports for doctors to review</p>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className={styles.successBanner}>
            <Upload size={16} /> {success}
          </div>
        )}

        <div className={styles.content}>
          {/* Main Form */}
          <div className={styles.formSection}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Report Upload Form</h2>
              {loading ? (
                <div className={styles.loading}>Loading tests...</div>
              ) : (
                <UploadReportForm
                  completedTests={readyTests}
                  onSubmit={handleSubmit}
                  loading={submitting}
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            {/* Ready for Upload */}
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>Tests Ready for Upload</h3>
              {readyTests.length > 0 ? (
                <div className={styles.readyList}>
                  {readyTests.map((test) => (
                    <div key={test._id} className={styles.readyItem}>
                      <div className={styles.readyInfo}>
                        <span className={styles.readyName}>
                          {test.patientId?.name || 'Unknown'}
                        </span>
                        <span className={styles.readyTest}>{test.testName}</span>
                        <span className={styles.readyId}>ID: {test._id?.slice(-6) || '—'}</span>
                      </div>
                      <span className={styles.readyBadge}>Ready</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noReady}>No tests ready for upload</p>
              )}
            </div>

            {/* Guidelines */}
            <div className={styles.guidelinesCard}>
              <h3 className={styles.guidelinesTitle}>
                <FileText size={16} /> Upload Guidelines:
              </h3>
              <ul className={styles.guidelinesList}>
                <li>Upload reports for tests in processing</li>
                <li>Supported formats: PDF, JPG, PNG</li>
                <li>Maximum file size: 10MB</li>
                <li>Ensure report is clear and readable</li>
                <li>Double-check patient information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </LabLayout>
  );
};

export default UploadReports;
