import { useState, useEffect } from 'react';
import { Calendar, Users, FlaskConical, Pill, Clock, CheckCircle2 } from 'lucide-react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import StatCard from '../../components/doctor/StatCard';
import doctorService from '../../services/doctorService';
import styles from './DoctorDashboard.module.css';

const DoctorDashboard = () => {
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
      fetchDashboardData(); // Refresh dashboard
    } catch (err) {
      console.error('Error approving appointment:', err);
      setError('Failed to approve appointment.');
    }
  };

  const handleReject = async (appointmentId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      await doctorService.rejectAppointment(appointmentId, reason || '');
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

  return (
    <DoctorLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome back, Dr. {data?.name || ''}</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

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
            <div className={styles.quickStatIcon} style={{ background: '#f0fdfa', color: '#0d9488' }}>
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
            <div className={styles.quickStatIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
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
