import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AppointmentCard from '../../components/patient/AppointmentCard';
import appointmentService from '../../services/appointmentService';
import styles from './MyAppointments.module.css';

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (activeTab) params.status = activeTab;
      const response = await appointmentService.getAppointments(params);
      setAppointments(response.data?.appointments || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: 'cancelled' } : a))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  const filtered = appointments.filter((a) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const doctorName = a.doctorId?.name?.toLowerCase() || '';
    const reason = a.reason?.toLowerCase() || '';
    return doctorName.includes(term) || reason.includes(term);
  });

  const normalizeStatus = (status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'approved') return 'confirmed';
    if (normalized === 'rejected') return 'cancelled';
    return normalized;
  };

  const counts = appointments.reduce(
    (acc, a) => {
      const key = normalizeStatus(a.status);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    { total: appointments.length }
  );

  const upcomingCount = (counts.pending || 0) + (counts.confirmed || 0);

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>My Appointments</h1>
            <p className={styles.pageSubtitle}>
              Manage and view all your appointments
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link to="/patient/doctors" className={styles.bookBtn}>
              Book New Appointment
            </Link>
          </div>
        </div>

        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Upcoming</span>
            <span className={styles.summaryValue}>{upcomingCount}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Completed</span>
            <span className={styles.summaryValue}>{counts.completed || 0}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Cancelled/Rejected</span>
            <span className={styles.summaryValue}>
              {counts.cancelled || 0}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
              <span className={styles.tabCount}>
                {key === '' ? appointments.length : counts[key] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search & filter bar */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by doctor name or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <span className={styles.resultCount}>
            {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Results */}
        {error && <div className={styles.errorBanner}>{error}</div>}

        {loading ? (
          <p className={styles.loadingText}>Loading appointments...</p>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <Calendar size={40} className={styles.emptyIcon} />
            <h3>No appointments found</h3>
            <p>
              {searchTerm
                ? 'Try a different search term.'
                : 'You don\'t have any appointments in this category yet.'}
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {/* Table header */}
            <div className={styles.tableHeader}>
              <span>Doctor</span>
              <span>Date &amp; Time</span>
              <span>Reason</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {filtered.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                variant="row"
                onCancel={() => handleCancel(appointment._id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyAppointments;
