import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import LabLayout from '../../components/lab/LabLayout';
import StatCard from '../../components/lab/StatCard';
import TestRequestTable from '../../components/lab/TestRequestTable';
import labService from '../../services/labService';
import styles from './TestRequests.module.css';

const TestRequests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('assigned');
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await labService.getTests();
      setTests(res.data?.tests || []);
    } catch (err) {
      console.error('Error loading test requests:', err);
      setError('Failed to load test requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (test) => {
    if (!window.confirm(`Mark sample collected for "${test.testName}"?`)) return;
    try {
      await labService.acceptTest(test._id);
      setTests((prev) =>
        prev.map((t) => (t._id === test._id ? { ...t, status: 'sample_collected' } : t))
      );
    } catch (err) {
      console.error('Error accepting test:', err);
      alert('Failed to update test status.');
    }
  };

  const handleReject = async (test) => {
    const reason = prompt('Reason for rejection:');
    if (reason === null) return; // User cancelled the prompt
    try {
      await labService.rejectTest(test._id, reason || 'Rejected by lab');
      setTests((prev) =>
        prev.map((t) => (t._id === test._id ? { ...t, status: 'cancelled' } : t))
      );
    } catch (err) {
      console.error('Error rejecting test:', err);
      alert('Failed to reject test request.');
    }
  };

  const handleView = (test) => {
    setSelectedTest(test);
  };

  const counts = useMemo(() => {
    const c = { total: 0, assigned: 0, collected: 0, processing: 0, urgent: 0 };
    tests.forEach((t) => {
      c.total++;
      if (t.status === 'assigned') c.assigned++;
      if (t.status === 'sample_collected') c.collected++;
      if (t.status === 'processing') c.processing++;
      if (t.urgency === 'urgent' || t.urgency === 'emergency') c.urgent++;
    });
    return c;
  }, [tests]);

  const filteredTests = useMemo(() => {
    if (filter === 'all') return tests;
    if (filter === 'assigned') return tests.filter((t) => t.status === 'assigned');
    if (filter === 'collected') return tests.filter((t) => t.status === 'sample_collected');
    if (filter === 'processing') return tests.filter((t) => t.status === 'processing');
    if (filter === 'urgent') return tests.filter((t) => t.urgency === 'urgent' || t.urgency === 'emergency');
    return tests;
  }, [tests, filter]);

  return (
    <LabLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Test Requests</h1>
            <p className={styles.subtitle}>Review and manage incoming test requests</p>
          </div>
          <select
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="assigned">Assigned</option>
            <option value="collected">Sample Collected</option>
            <option value="processing">Processing</option>
            <option value="urgent">Urgent Only</option>
            <option value="all">All Requests</option>
          </select>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard label="Total Requests" value={counts.total} color="blue" />
          <StatCard
            label="Assigned"
            value={counts.assigned}
            color="orange"
          />
          <StatCard
            label="Sample Collected"
            value={counts.collected}
            color="green"
          />
          <StatCard
            label="Urgent"
            value={counts.urgent}
            color="red"
          />
        </div>

        {/* Table */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>All Test Requests</h2>
          <TestRequestTable
            tests={filteredTests}
            onAccept={handleAccept}
            onReject={handleReject}
            onView={handleView}
            loading={loading}
          />
        </div>

        {/* Test Detail Modal */}
        {selectedTest && (
          <div className={styles.modalOverlay} onClick={() => setSelectedTest(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Test Request Details</h2>
                <button className={styles.closeBtn} onClick={() => setSelectedTest(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Test Name</span>
                  <span className={styles.detailValue}>{selectedTest.testName || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Patient</span>
                  <span className={styles.detailValue}>{selectedTest.patientId?.name || 'Unknown'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Prescribed By</span>
                  <span className={styles.detailValue}>Dr. {selectedTest.doctorId?.name || 'Unknown'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={styles.detailValue}>{selectedTest.status || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Urgency</span>
                  <span className={`${styles.detailValue} ${selectedTest.urgency === 'urgent' || selectedTest.urgency === 'emergency' ? styles.urgentText : ''}`}>
                    {selectedTest.urgency || 'Normal'}
                  </span>
                </div>
                {selectedTest.instructions && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Instructions</span>
                    <span className={styles.detailValue}>{selectedTest.instructions}</span>
                  </div>
                )}
                {selectedTest.notes && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Notes</span>
                    <span className={styles.detailValue}>{selectedTest.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </LabLayout>
  );
};

export default TestRequests;
