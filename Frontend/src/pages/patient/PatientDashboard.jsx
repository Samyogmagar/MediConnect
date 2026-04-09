import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle,
  FileText,
  Bell,
  ArrowRight,
  Activity,
  Heart,
  Search,
  Stethoscope,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/patient/DashboardCard';
import AppointmentCard from '../../components/patient/AppointmentCard';
import useAuth from '../../hooks/useAuth';
import patientService from '../../services/patientService';
import notificationService from '../../services/notificationService';
import styles from './PatientDashboard.module.css';

const healthTips = [
  {
    icon: Activity,
    title: 'Stay Hydrated',
    description: 'Drink at least 8 glasses of water daily for optimal health.',
    color: '#0ea5e9',
  },
  {
    icon: Heart,
    title: 'Regular Exercise',
    description: '30 minutes of moderate exercise can improve your heart health.',
    color: '#f59e0b',
  },
];

const quickActions = [
  {
    icon: CalendarCheck,
    title: 'Book Appointment',
    description: 'Schedule a visit with a doctor',
    to: '/patient/doctors',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    icon: FileText,
    title: 'Medical Records',
    description: 'View your health documents',
    to: '/patient/records',
    color: '#0f766e',
    bg: '#ecfdf3',
  },
  {
    icon: Stethoscope,
    title: 'Find Doctors',
    description: 'Browse specialists near you',
    to: '/patient/doctors',
    color: '#059669',
    bg: '#ecfdf5',
  },
];

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingCount: 0,
    completedCount: 0,
    pendingLabCount: 0,
    unreadNotifCount: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, notifCountRes] = await Promise.all([
        patientService.getDashboardData(),
        notificationService.getUnreadCount(),
      ]);

      const dash = dashRes.data || {};
      const unread = notifCountRes.data?.count ?? notifCountRes.data?.unreadCount ?? 0;

      setStats({
        upcomingCount: dash.appointments?.pending + dash.appointments?.confirmed || 0,
        completedCount: dash.appointments?.completed || 0,
        pendingLabCount: (dash.diagnostics?.assigned || 0) + (dash.diagnostics?.sample_collected || 0) + (dash.diagnostics?.processing || 0),
        unreadNotifCount: unread,
      });

      // Use upcoming appointments from dashboard response
      const upcoming = dash.upcomingAppointments || [];
      setUpcomingAppointments(upcoming.slice(0, 3));
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <DashboardLayout unreadCount={unreadCount}>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              Welcome back, {user?.name?.split(' ')[0]}! Here's your health overview.
            </p>
          </div>
          <div className={styles.dateSection}>
            <span className={styles.dateLabel}>Today</span>
            <span className={styles.dateValue}>{today}</span>
          </div>
        </div>

        {/* Stat cards */}
        <div className={styles.statsGrid}>
          <DashboardCard
            icon={CalendarCheck}
            iconColor="#2563eb"
            iconBg="#eff6ff"
            title="Upcoming Appointments"
            value={loading ? '–' : stats.upcomingCount}
            subtitle={`+${stats.upcomingCount > 0 ? 1 : 0} this week`}
          />
          <DashboardCard
            icon={CheckCircle}
            iconColor="#059669"
            iconBg="#ecfdf5"
            title="Completed Appointments"
            value={loading ? '–' : stats.completedCount}
            subtitle={`${stats.completedCount} this month`}
          />
          <DashboardCard
            icon={FileText}
            iconColor="#d97706"
            iconBg="#fffbeb"
            title="Pending Lab Tests"
            value={loading ? '–' : stats.pendingLabCount}
            subtitle="View results"
          />
          <DashboardCard
            icon={Bell}
            iconColor="#dc2626"
            iconBg="#fef2f2"
            title="Unread Notifications"
            value={loading ? '–' : stats.unreadNotifCount}
            subtitle={`${stats.unreadNotifCount} new today`}
          />
        </div>

        {/* Middle section */}
        <div className={styles.middleGrid}>
          {/* Upcoming appointments */}
          <div className={styles.upcomingCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Upcoming Appointments</h2>
              <Link to="/patient/appointments" className={styles.viewAll}>
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.cardBody}>
              {loading ? (
                <p className={styles.emptyText}>Loading...</p>
              ) : upcomingAppointments.length === 0 ? (
                <p className={styles.emptyText}>No upcoming appointments</p>
              ) : (
                upcomingAppointments.map((appt) => (
                  <AppointmentCard
                    key={appt._id}
                    appointment={appt}
                    variant="compact"
                  />
                ))
              )}
            </div>
          </div>

          {/* Health tips */}
          <div className={styles.tipsCard}>
            <h2 className={styles.cardTitle}>Health Tips</h2>
            <div className={styles.tipsList}>
              {healthTips.map((tip) => (
                <div key={tip.title} className={styles.tipItem}>
                  <div
                    className={styles.tipIcon}
                    style={{ color: tip.color, background: `${tip.color}12` }}
                  >
                    <tip.icon size={18} />
                  </div>
                  <div>
                    <p className={styles.tipTitle}>{tip.title}</p>
                    <p className={styles.tipDesc}>{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className={styles.quickActions}>
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className={styles.actionCard}
              style={{ borderColor: `${action.color}30` }}
            >
              <div className={styles.actionLeft}>
                <div className={styles.actionIcon} style={{ background: action.bg }}>
                  <action.icon size={20} style={{ color: action.color }} />
                </div>
                <div>
                  <p className={styles.actionTitle}>{action.title}</p>
                  <p className={styles.actionDesc}>{action.description}</p>
                </div>
              </div>
              <ArrowRight size={18} style={{ color: action.color }} />
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
