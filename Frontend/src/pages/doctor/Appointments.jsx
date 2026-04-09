import { useState, useEffect } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import AppointmentTable from '../../components/doctor/AppointmentTable';
import StatCard from '../../components/doctor/StatCard';
import doctorService from '../../services/doctorService';
import styles from './Appointments.module.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await doctorService.getAppointments();
      setAppointments(res.data?.appointments || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointment) => {
    if (!window.confirm(`Approve appointment with ${appointment.patientId?.name}?`)) return;
    try {
      await doctorService.approveAppointment(appointment._id);
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointment._id ? { ...a, status: 'confirmed' } : a))
      );
    } catch (err) {
      console.error('Error approving appointment:', err);
      alert('Failed to approve appointment.');
    }
  };

  const handleReject = async (appointment) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await doctorService.rejectAppointment(appointment._id, reason);
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointment._id ? { ...a, status: 'cancelled' } : a))
      );
    } catch (err) {
      console.error('Error rejecting appointment:', err);
      alert('Failed to reject appointment.');
    }
  };

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleComplete = async (appointment) => {
    const notes = prompt('Add consultation notes (optional):') || '';
    try {
      await doctorService.completeAppointment(appointment._id, notes);
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointment._id ? { ...a, status: 'completed' } : a))
      );
    } catch (err) {
      console.error('Error completing appointment:', err);
      alert(err.response?.data?.message || 'Failed to complete appointment.');
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const normalizeStatus = (status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'approved') return 'confirmed';
    if (normalized === 'rejected') return 'cancelled';
    return normalized;
  };

  const counts = appointments.reduce(
    (acc, a) => {
      acc.total++;
      const s = normalizeStatus(a.status);
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  );

  const filteredAppointments =
    filter === 'all'
      ? appointments
      : appointments.filter((a) => normalizeStatus(a.status) === filter);

  return (
    <DoctorLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Appointments</h1>
          <p className={styles.subtitle}>Manage your patient appointments</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard
            icon={<Calendar size={20} />}
            label="Total Appointments"
            value={counts.total}
            color="blue"
          />
          <StatCard
            icon={<Calendar size={20} />}
            label="Pending"
            value={counts.pending}
            color="yellow"
          />
          <StatCard
            icon={<Calendar size={20} />}
            label="Confirmed"
            value={counts.confirmed}
            color="purple"
          />
          <StatCard
            icon={<Calendar size={20} />}
            label="Completed"
            value={counts.completed}
            color="green"
          />
        </div>

        {/* Filters */}
        <div className={styles.filterBar}>
          <div className={styles.filterLabel}>
            <Filter size={16} /> Filter:
          </div>
          {['all', 'pending', 'confirmed', 'completed'].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <AppointmentTable
          appointments={filteredAppointments}
          onApprove={handleApprove}
          onReject={handleReject}
          onComplete={handleComplete}
          onView={handleView}
          loading={loading}
        />

        {/* Detail Modal */}
        {selectedAppointment && (
          <div className={styles.modalOverlay} onClick={() => setSelectedAppointment(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Appointment Details</h2>
                <button className={styles.closeBtn} onClick={() => setSelectedAppointment(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Patient</span>
                  <span className={styles.detailValue}>{selectedAppointment.patientId?.name || 'Unknown'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Email</span>
                  <span className={styles.detailValue}>{selectedAppointment.patientId?.email || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Date</span>
                  <span className={styles.detailValue}>{formatDate(selectedAppointment.dateTime)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Time</span>
                  <span className={styles.detailValue}>{formatTime(selectedAppointment.dateTime)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Type</span>
                  <span className={styles.detailValue}>{selectedAppointment.type || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Reason</span>
                  <span className={styles.detailValue}>{selectedAppointment.reason || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={`${styles.detailValue} ${styles.statusTag} ${styles[normalizeStatus(selectedAppointment.status)]}`}>
                    {normalizeStatus(selectedAppointment.status)}
                  </span>
                </div>
                {selectedAppointment.notes && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Notes</span>
                    <span className={styles.detailValue}>{selectedAppointment.notes}</span>
                  </div>
                )}
                {selectedAppointment.rejectionReason && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Rejection Reason</span>
                    <span className={styles.detailValue}>{selectedAppointment.rejectionReason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default Appointments;
