import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  FlaskConical,
  Pill,
  ShieldCheck,
  Stethoscope,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminActivityFeed from '../../components/admin/AdminActivityFeed';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import adminService from '../../services/adminService';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const dashRes = await adminService.getDashboardData();
      const data = dashRes.data?.data || dashRes.data || {};
      setDashboard(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = useCallback((d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  const timeAgo = useCallback((d) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs} hours ago`;
    return `${Math.floor(hrs / 24)} days ago`;
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const users = dashboard?.users || {};
  const appointments = dashboard?.appointments || {};
  const diagnostics = dashboard?.diagnostics || {};
  const medications = dashboard?.medications || {};
  const pending = dashboard?.pendingActions || {};

  const activityItems = useMemo(() => {
    const activities = [];
    const activity = dashboard?.recentActivity || {};

    (activity.registrations || []).forEach((user) => {
      activities.push({
        id: `reg-${user._id}`,
        type: 'registration',
        title: `${user.name} registered as ${user.role}`,
        meta: `Registered ${formatDate(user.createdAt)}`,
        time: timeAgo(user.createdAt),
        timeStamp: user.createdAt,
      });
    });

    (activity.appointments || []).forEach((apt) => {
      activities.push({
        id: `apt-${apt._id}`,
        type: 'appointment',
        title: `${apt.patientId?.name || 'Patient'} with Dr. ${apt.doctorId?.name || 'Doctor'}`,
        meta: `${formatDate(apt.dateTime)} · ${apt.doctorId?.professionalDetails?.specialization || 'General'}`,
        time: timeAgo(apt.updatedAt || apt.createdAt),
        timeStamp: apt.updatedAt || apt.createdAt,
        status: apt.status,
      });
    });

    (activity.diagnostics || []).forEach((test) => {
      activities.push({
        id: `diag-${test._id}`,
        type: 'diagnostic',
        title: `${test.testName || 'Diagnostic Test'} · ${test.patientId?.name || 'Patient'}`,
        meta: `Lab: ${test.labId?.name || 'Unassigned'}`,
        time: timeAgo(test.updatedAt || test.createdAt),
        timeStamp: test.updatedAt || test.createdAt,
        status: test.status,
      });
    });

    (activity.prescriptions || []).forEach((med) => {
      activities.push({
        id: `rx-${med._id}`,
        type: 'prescription',
        title: `${med.medicationName || 'Prescription'} · ${med.patientId?.name || 'Patient'}`,
        meta: `Prescribed by Dr. ${med.doctorId?.name || 'Doctor'}`,
        time: timeAgo(med.prescribedAt || med.createdAt),
        timeStamp: med.prescribedAt || med.createdAt,
        status: med.status,
      });
    });

    return activities
      .sort((a, b) => new Date(b.timeStamp || 0) - new Date(a.timeStamp || 0))
      .slice(0, 8);
  }, [dashboard, formatDate, timeAgo]);

  if (loading) {
    return (
      <AdminLayout>
        <p className={styles.loadingText}>Loading dashboard...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>Operational command center for MediConnect Hospital</p>
          </div>
          <div className={styles.dateBlock}>
            <span className={styles.dateLabel}>Today</span>
            <span className={styles.dateValue}>{today}</span>
          </div>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Stat cards */}
        <div className={styles.statsGrid}>
          <StatCard
            icon={<Users size={20} />}
            label="Total Patients"
            value={users.patient ?? 0}
            subtitle={`${users.total ?? 0} total users`}
            color="blue"
          />
          <StatCard
            icon={<Stethoscope size={20} />}
            label="Doctors"
            value={users.doctor ?? 0}
            subtitle={`${pending.pendingVerifications ?? 0} pending verification`}
            color="purple"
          />
          <StatCard
            icon={<FlaskConical size={20} />}
            label="Lab Staff"
            value={users.lab ?? 0}
            subtitle={`${diagnostics.assigned ?? 0} tests assigned`}
            color="yellow"
          />
          <StatCard
            icon={<UserCog size={20} />}
            label="Admins"
            value={users.admin ?? 0}
            subtitle="Operational control"
            color="red"
          />
          <StatCard
            icon={<CalendarCheck size={20} />}
            label="Appointments"
            value={appointments.total ?? 0}
            subtitle={`${appointments.completed ?? 0} completed`}
            color="green"
          />
          <StatCard
            icon={<Pill size={20} />}
            label="Prescriptions"
            value={medications.total ?? 0}
            subtitle={`${medications.active ?? 0} active`}
            color="blue"
          />
          <StatCard
            icon={<Activity size={20} />}
            label="Lab Reports"
            value={diagnostics.report_uploaded ?? 0}
            subtitle={`${diagnostics.processing ?? 0} processing`}
            color="purple"
          />
        </div>

        {/* Operational cards */}
        <div className={styles.splitGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Pending Actions & Alerts</h2>
              <button
                className={styles.viewAllBtn}
                onClick={() => navigate('/admin/users')}
              >
                Manage <ArrowRight size={14} />
              </button>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.alertRow}>
                <ShieldCheck size={18} />
                <div>
                  <span className={styles.alertTitle}>Pending verifications</span>
                  <span className={styles.alertMeta}>{pending.pendingVerifications ?? 0} accounts</span>
                </div>
                <StatusBadge status="pending" />
              </div>
              <div className={styles.alertRow}>
                <ClipboardList size={18} />
                <div>
                  <span className={styles.alertTitle}>Tests awaiting reports</span>
                  <span className={styles.alertMeta}>{pending.testsAwaitingReports ?? 0} in processing</span>
                </div>
                <StatusBadge status="processing" />
              </div>
              <div className={styles.alertRow}>
                <UserPlus size={18} />
                <div>
                  <span className={styles.alertTitle}>Role applications</span>
                  <span className={styles.alertMeta}>{pending.pendingRoleApplications ?? 0} pending review</span>
                </div>
                <StatusBadge status="pending" />
              </div>
              <div className={styles.alertRow}>
                <CalendarCheck size={18} />
                <div>
                  <span className={styles.alertTitle}>Appointments needing follow-up</span>
                  <span className={styles.alertMeta}>{pending.appointmentsPending ?? 0} pending/confirmed</span>
                </div>
                <StatusBadge status="pending" />
              </div>
              <div className={styles.alertRow}>
                <UserCog size={18} />
                <div>
                  <span className={styles.alertTitle}>Doctors without schedules</span>
                  <span className={styles.alertMeta}>{pending.doctorsNeedingAvailability ?? 0} require setup</span>
                </div>
                <StatusBadge status="inactive" />
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Recent Activity</h2>
              <button
                className={styles.viewAllBtn}
                onClick={() => navigate('/admin/notifications')}
              >
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className={styles.panelBody}>
              <AdminActivityFeed items={activityItems} />
            </div>
          </div>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h3>Appointments Overview</h3>
              <span className={styles.summarySub}>Today's volume: {dashboard?.todaysAppointments ?? 0}</span>
            </div>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Pending</span>
                <strong>{appointments.pending ?? 0}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Confirmed</span>
                <strong>{appointments.confirmed ?? 0}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Completed</span>
                <strong>{appointments.completed ?? 0}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Cancelled</span>
                <strong>{appointments.cancelled ?? 0}</strong>
              </div>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h3>Lab Workflow Status</h3>
              <span className={styles.summarySub}>Total tests: {diagnostics.total ?? 0}</span>
            </div>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Assigned</span>
                <strong>{diagnostics.assigned ?? 0}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Sample Collected</span>
                <strong>{diagnostics.sample_collected ?? 0}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Processing</span>
                <strong>{diagnostics.processing ?? 0}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Reports Uploaded</span>
                <strong>{diagnostics.report_uploaded ?? 0}</strong>
              </div>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h3>Prescriptions</h3>
              <span className={styles.summarySub}>Active: {medications.active ?? 0}</span>
            </div>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Total</span>
                <strong>{medications.total ?? 0}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Completed</span>
                <strong>{medications.completed ?? 0}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Discontinued</span>
                <strong>{medications.discontinued ?? 0}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className={styles.quickActions}>
          <button className={styles.actionCard} onClick={() => navigate('/admin/users')}>
            <div className={styles.actionLeft}>
              <UserPlus size={22} className={styles.actionIconBlue} />
              <div>
                <h3 className={styles.actionTitle}>Create Staff Account</h3>
                <p className={styles.actionDesc}>Add doctor, lab staff, or admin</p>
              </div>
            </div>
            <ArrowRight size={18} className={styles.actionArrow} />
          </button>
          <button className={styles.actionCard} onClick={() => navigate('/admin/appointments')}>
            <div className={styles.actionLeft}>
              <CalendarCheck size={22} className={styles.actionIconGreen} />
              <div>
                <h3 className={styles.actionTitle}>Appointment Monitoring</h3>
                <p className={styles.actionDesc}>Track scheduling and bottlenecks</p>
              </div>
            </div>
            <ArrowRight size={18} className={styles.actionArrow} />
          </button>
          <button className={styles.actionCard} onClick={() => navigate('/admin/diagnostics')}>
            <div className={styles.actionLeft}>
              <Activity size={22} className={styles.actionIconPurple} />
              <div>
                <h3 className={styles.actionTitle}>Lab Report Monitoring</h3>
                <p className={styles.actionDesc}>Review lab workflow statuses</p>
              </div>
            </div>
            <ArrowRight size={18} className={styles.actionArrow} />
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
