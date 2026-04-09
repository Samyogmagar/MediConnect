import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  ArrowRight,
  User,
  Calendar,
  Eye,
  Upload,
} from 'lucide-react';
import LabLayout from '../../components/lab/LabLayout';
import StatCard from '../../components/lab/StatCard';
import labService from '../../services/labService';
import styles from './LabDashboard.module.css';

const LabDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds to show new assignments
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardRes, testsRes] = await Promise.all([
        labService.getDashboardData(),
        labService.getTests(), // This will get all tests assigned to this lab
      ]);
      setData(dashboardRes.data);
      // Get the 5 most recent tests for the table
      const allTests = testsRes.data?.tests || [];
      // Sort by creation date (newest first)
      const sortedTests = allTests.sort((a, b) => new Date(b.createdAt || b.assignedAt) - new Date(a.createdAt || a.assignedAt));
      setRecentTests(sortedTests.slice(0, 5));
    } catch (err) {
      console.error('Error loading lab dashboard:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getStatusClass = (status) => {
    const map = {
      assigned: 'statusPending',
      sample_collected: 'statusCollected',
      processing: 'statusInProgress',
      report_uploaded: 'statusCompleted',
      cancelled: 'statusCancelled',
    };
    return styles[map[status] || 'statusPending'];
  };

  const getStatusLabel = (status) => {
    const map = {
      assigned: 'Assigned',
      sample_collected: 'Sample Collected',
      processing: 'Processing',
      report_uploaded: 'Report Uploaded',
      cancelled: 'Cancelled',
    };
    return map[status] || status;
  };

  const getPriorityClass = (urgency) => {
    const map = {
      routine: 'priorityNormal',
      urgent: 'priorityUrgent',
      emergency: 'priorityEmergency',
    };
    return styles[map[urgency] || 'priorityNormal'];
  };

  const getPriorityLabel = (urgency) => {
    const map = { routine: 'Normal', urgent: 'Urgent', emergency: 'Emergency' };
    return map[urgency] || 'Normal';
  };

  if (loading) {
    return (
      <LabLayout>
        <div className={styles.page}>
          <div className={styles.loading}>Loading dashboard...</div>
        </div>
      </LabLayout>
    );
  }

  const tests = data?.tests || {};

  return (
    <LabLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Laboratory overview and recent test requests</p>
          </div>
          <div className={styles.dateInfo}>
            <span className={styles.dateLabel}>Today</span>
            <span className={styles.dateValue}>{today}</span>
          </div>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <StatCard
            icon={<FileText size={22} />}
            label="Total Test Requests"
            value={tests.total || 0}
            subtitle={`${data?.testsReceivedToday || 0} new today`}
            color="blue"
          />
          <StatCard
            icon={<Clock size={22} />}
            label="Assigned Tests"
            value={tests.assigned || 0}
            subtitle="Awaiting sample collection"
            color="orange"
          />
          <StatCard
            icon={<Activity size={22} />}
            label="Processing"
            value={tests.processing || 0}
            subtitle="Active lab workload"
            color="teal"
          />
          <StatCard
            icon={<CheckCircle2 size={22} />}
            label="Reports Uploaded"
            value={tests.report_uploaded || 0}
            subtitle="Ready for review"
            color="green"
          />
        </div>

        {/* Recent Test Requests Table */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Test Requests</h2>
            <button
              className={styles.viewAllBtn}
              onClick={() => navigate('/lab/test-requests')}
            >
              View All <ArrowRight size={16} />
            </button>
          </div>

          {recentTests.length > 0 ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Test Type</th>
                    <th>Requested By</th>
                    <th>Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTests.map((test) => (
                    <tr key={test._id}>
                      <td>
                        <div className={styles.nameCell}>
                          <div className={styles.avatarSmall}>
                            <User size={14} />
                          </div>
                          <span className={styles.name}>
                            {test.patientId?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.testType}>{test.testName || '—'}</span>
                      </td>
                      <td>
                        <span className={styles.doctorName}>
                          {test.doctorId?.name ? `Dr. ${test.doctorId.name}` : '—'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.dateCell}>
                          <Calendar size={13} />
                          {formatDate(test.assignedAt || test.createdAt)}
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
                      <td>
                        <button
                          className={styles.viewBtn}
                          onClick={() => navigate('/lab/test-requests')}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>No test requests yet</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <div
            className={styles.quickCard}
            onClick={() => navigate('/lab/test-requests')}
          >
            <div className={`${styles.quickIcon} ${styles.quickIconBlue}`}>
              <FileText size={24} />
            </div>
            <div className={styles.quickContent}>
              <span className={styles.quickTitle}>View Assigned Tests</span>
              <span className={styles.quickSubtext}>New doctor orders</span>
            </div>
            <ArrowRight size={20} className={styles.quickArrow} />
          </div>

          <div
            className={styles.quickCard}
            onClick={() => navigate('/lab/assigned-tests')}
          >
            <div className={`${styles.quickIcon} ${styles.quickIconOrange}`}>
              <Activity size={24} />
            </div>
            <div className={styles.quickContent}>
              <span className={styles.quickTitle}>Update Test Status</span>
              <span className={styles.quickSubtext}>Sample to processing</span>
            </div>
            <ArrowRight size={20} className={styles.quickArrow} />
          </div>

          <div
            className={styles.quickCard}
            onClick={() => navigate('/lab/upload-reports')}
          >
            <div className={`${styles.quickIcon} ${styles.quickIconTeal}`}>
              <Upload size={24} />
            </div>
            <div className={styles.quickContent}>
              <span className={styles.quickTitle}>Upload Reports</span>
              <span className={styles.quickSubtext}>Finalize processing</span>
            </div>
            <ArrowRight size={20} className={styles.quickArrow} />
          </div>

          <div
            className={styles.quickCard}
            onClick={() => navigate('/lab/completed-tests')}
          >
            <div className={`${styles.quickIcon} ${styles.quickIconGreen}`}>
              <Eye size={24} />
            </div>
            <div className={styles.quickContent}>
              <span className={styles.quickTitle}>Review Recent Uploads</span>
              <span className={styles.quickSubtext}>Report history</span>
            </div>
            <ArrowRight size={20} className={styles.quickArrow} />
          </div>
        </div>
      </div>
    </LabLayout>
  );
};

export default LabDashboard;
