import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, TrendingUp, Users } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import adminService from '../../services/adminService';
import styles from './Analytics.module.css';

const monthLabel = (month, year) => {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSuperAdminDashboard();
      const payload = res.data?.data || res.data || {};
      setData(payload);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const appointmentTrend = useMemo(() => {
    return (data?.appointmentTrend || []).map((item) => ({
      label: monthLabel(item._id.month, item._id.year),
      value: item.count,
    }));
  }, [data]);

  const registrationTrend = useMemo(() => {
    return (data?.monthlyGrowth || []).map((item) => ({
      label: monthLabel(item._id.month, item._id.year),
      value: item.count,
    }));
  }, [data]);

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.loading}>Loading analytics...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Hospital Analytics</h1>
          <p className={styles.subtitle}>Operational trends across appointments, staff, and growth.</p>
        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Users size={18} />
              <span>Monthly Registrations</span>
            </div>
            <div className={styles.chart}>
              {registrationTrend.length === 0 ? (
                <p className={styles.empty}>No registration trend data</p>
              ) : (
                registrationTrend.map((item) => (
                  <div key={item.label} className={styles.barItem}>
                    <div className={styles.bar} style={{ height: `${Math.min(100, item.value * 8)}%` }} />
                    <span>{item.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Activity size={18} />
              <span>Appointments Volume</span>
            </div>
            <div className={styles.chart}>
              {appointmentTrend.length === 0 ? (
                <p className={styles.empty}>No appointment trend data</p>
              ) : (
                appointmentTrend.map((item) => (
                  <div key={item.label} className={styles.barItem}>
                    <div className={styles.barAlt} style={{ height: `${Math.min(100, item.value * 6)}%` }} />
                    <span>{item.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <TrendingUp size={18} />
              <span>Top Doctors by Completions</span>
            </div>
            <div className={styles.list}>
              {(data?.topDoctors || []).length === 0 ? (
                <p className={styles.empty}>No doctor workload data</p>
              ) : (
                data.topDoctors.map((doc) => (
                  <div key={doc._id} className={styles.listRow}>
                    <span>
                      Dr. {doc.doctor?.name || 'Unknown'}
                      <small>{doc.doctor?.professionalDetails?.specialization || 'General'}</small>
                    </span>
                    <strong>{doc.completedCount}</strong>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <BarChart3 size={18} />
              <span>Operational Alerts</span>
            </div>
            <div className={styles.metrics}>
              <div>
                <span>High Priority Notifications</span>
                <strong>{data?.highPriorityNotifications ?? 0}</strong>
              </div>
              <div>
                <span>Pending Verifications</span>
                <strong>{data?.pendingVerifications ?? 0}</strong>
              </div>
              <div>
                <span>New Users This Month</span>
                <strong>{data?.newUsersThisMonth ?? 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
