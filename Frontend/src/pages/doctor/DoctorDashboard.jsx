import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, FlaskConical, Pill, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import StatCard from '../../components/doctor/StatCard';
import { useToast } from '../../components/common/feedback/ToastProvider';
import { useModal } from '../../components/common/feedback/ModalProvider';
import doctorService from '../../services/doctorService';
import { normalizeAppointmentStatus } from '../../utils/doctorWorkflowStatus.util';
import styles from './DoctorDashboard.module.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { showConfirm } = useModal();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await doctorService.getDashboardData();
      setData(res.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleApprove = async (appointmentId) => {
    try {
      await doctorService.approveAppointment(appointmentId);
      showToast({ type: 'success', title: 'Appointment approved', message: 'The appointment was approved.' });
      fetchDashboardData(); // Refresh dashboard
    } catch (err) {
      console.error('Error approving appointment:', err);
      setError('Failed to approve appointment.');
    }
  };

  const handleReject = async (appointmentId) => {
    const { confirmed, inputValue } = await showConfirm({
      title: 'Reject appointment?',
      message: 'Please provide a reason for rejection (optional).',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      inputConfig: {
        type: 'textarea',
        label: 'Rejection reason',
        placeholder: 'Optional reason for rejection',
        required: false,
      },
    });
    if (!confirmed) return;

    try {
      await doctorService.rejectAppointment(appointmentId, inputValue || '');
      showToast({ type: 'success', title: 'Appointment rejected', message: 'The appointment was rejected.' });
      fetchDashboardData(); // Refresh dashboard
    } catch (err) {
      console.error('Error rejecting appointment:', err);
      setError('Failed to reject appointment.');
    }
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className={styles.page}>
          <div className={styles.loading}>Loading dashboard...</div>
        </div>
      </DoctorLayout>
    );
  }

  const todaysPending = (data?.todaysAppointments || []).filter(
    (apt) => normalizeAppointmentStatus(apt.status) === 'pending'
  ).length;
  const reportsReady = data?.diagnostics?.report_uploaded || data?.diagnostics?.completed || 0;
  const activeLabWork = (data?.diagnostics?.sample_collected || 0) + (data?.diagnostics?.processing || 0);

  return (
    <DoctorLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, Dr. {data?.name || ''}. Here is what needs your attention first.
          </p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.quickActions}>
          <button className={styles.quickActionBtn} onClick={() => navigate('/doctor/appointments')}>
            Open Appointments <ArrowRight size={14} />
          </button>
          <button className={styles.quickActionBtn} onClick={() => navigate('/doctor/patients')}>
            Open Patients <ArrowRight size={14} />
          </button>
          <button className={styles.quickActionBtn} onClick={() => navigate('/doctor/records')}>
            Review Lab Reports <ArrowRight size={14} />
          </button>
          <button className={styles.quickActionBtn} onClick={() => navigate('/doctor/availability')}>
            Update Availability <ArrowRight size={14} />
          </button>
        </div>

        <div className={styles.attentionGrid}>
          <div className={styles.attentionCard}>
            <span className={styles.attentionLabel}>Pending consultations today</span>
            <strong className={styles.attentionValue}>{todaysPending}</strong>
            <button className={styles.attentionLink} onClick={() => navigate('/doctor/appointments')}>
              Review pending appointments
            </button>
          </div>
          <div className={styles.attentionCard}>
            <span className={styles.attentionLabel}>Assigned lab tests in progress</span>
            <strong className={styles.attentionValue}>{activeLabWork}</strong>
            <button className={styles.attentionLink} onClick={() => navigate('/doctor/records')}>
              Check active diagnostics
            </button>
          </div>
          <div className={styles.attentionCard}>
            <span className={styles.attentionLabel}>Reports ready for review</span>
            <strong className={styles.attentionValue}>{reportsReady}</strong>
            <button className={styles.attentionLink} onClick={() => navigate('/doctor/records')}>
              Open uploaded reports
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <StatCard
            icon={<Clock size={20} />}
            label="Today's Appointments"
            value={data?.todaysAppointments?.length || 0}
            color="blue"
          />
          <StatCard
            icon={<Calendar size={20} />}
           label="Pending Appointments"
            value={data?.appointments?.pending || 0}
            color="yellow"
          />
          <StatCard
            icon={<Users size={20} />}
            label="Patients This Month"
            value={data?.patientsThisMonth || 0}
            color="purple"
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Completed Consultations"
            value={data?.appointments?.completed || 0}
            color="green"
          />
        </div>

        {/* Today's Appointments */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Today's Appointments</h2>
          {data?.todaysAppointments && data.todaysAppointments.length > 0 ? (
            <div className={styles.appointmentsList}>
              {data.todaysAppointments.map((apt) => (
                <div key={apt._id} className={styles.appointmentCard}>
                  <div className={styles.aptTime}>
                    <Clock size={16} />
                    {formatTime(apt.dateTime)}
                  </div>
                  <div className={styles.aptDetails}>
                    <span className={styles.patientName}>{apt.patientId?.name || 'Unknown'}</span>
                    <span className={styles.aptReason}>{apt.reason || 'Consultation'}</span>
                  </div>
                  <span className={`${styles.aptStatus} ${styles[apt.status?.toLowerCase()]}`}>
                    {apt.status}
                  </span>
                  {apt.status === 'pending' && (
                    <div className={styles.aptActions}>
                      <button
                        className={styles.approveBtn}
                        onClick={() => handleApprove(apt._id)}
                        title="Approve"
                      >
                        <CheckCircle2 size={16} />
                        Approve
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleReject(apt._id)}
                        title="Reject"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>No appointments scheduled for today</div>
          )}
        </div>

        {/* Quick Stats Cards */}
        <div className={styles.quickStatsGrid}>
          <div className={styles.quickStatCard}>
            <div className={`${styles.quickStatIcon} ${styles.quickStatIconInfo}`}>
              <FlaskConical size={24} />
            </div>
            <div className={styles.quickStatContent}>
              <span className={styles.quickStatLabel}>Diagnostic Tests</span>
              <span className={styles.quickStatValue}>{data?.diagnostics?.total || 0}</span>
              <span className={styles.quickStatSubtext}>
                {((data?.diagnostics?.processing || 0) + (data?.diagnostics?.sample_collected || 0))} in progress
              </span>
            </div>
          </div>

          <div className={styles.quickStatCard}>
            <div className={`${styles.quickStatIcon} ${styles.quickStatIconWarn}`}>
              <Pill size={24} />
            </div>
            <div className={styles.quickStatContent}>
              <span className={styles.quickStatLabel}>Medications Prescribed</span>
              <span className={styles.quickStatValue}>{data?.medications?.total || 0}</span>
              <span className={styles.quickStatSubtext}>
                {data?.medications?.active || 0} active
              </span>
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
