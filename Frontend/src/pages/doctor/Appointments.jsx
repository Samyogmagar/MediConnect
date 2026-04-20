import { useState, useEffect } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import AppointmentTable from '../../components/doctor/AppointmentTable';
import StatCard from '../../components/doctor/StatCard';
import { useToast } from '../../components/common/feedback/ToastProvider';
import { useModal } from '../../components/common/feedback/ModalProvider';
import doctorService from '../../services/doctorService';
import { normalizeAppointmentStatus } from '../../utils/doctorWorkflowStatus.util';
import RescheduleAppointmentModal from '../../components/doctor/RescheduleAppointmentModal';
import styles from './Appointments.module.css';

const Appointments = () => {
  const { showToast } = useToast();
  const { showConfirm } = useModal();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);

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
    const { confirmed } = await showConfirm({
      title: 'Approve appointment?',
      message: `Approve appointment with ${appointment.patientId?.name || 'this patient'}?`,
      confirmText: 'Approve',
      cancelText: 'Cancel',
      confirmVariant: 'success',
    });
    if (!confirmed) return;

    try {
      await doctorService.approveAppointment(appointment._id);
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointment._id ? { ...a, status: 'confirmed' } : a))
      );
      showToast({
        type: 'success',
        title: 'Appointment approved',
        message: 'The patient has been notified.',
      });
    } catch (err) {
      console.error('Error approving appointment:', err);
      showToast({
        type: 'error',
        title: 'Approval failed',
        message: 'Failed to approve appointment.',
      });
    }
  };

  const handleReject = async (appointment) => {
    const { confirmed, inputValue } = await showConfirm({
      title: 'Reject appointment?',
      message: `Provide a reason for rejecting appointment with ${appointment.patientId?.name || 'this patient'}.`,
      confirmText: 'Reject',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      inputConfig: {
        type: 'textarea',
        label: 'Rejection reason',
        placeholder: 'Briefly explain why this appointment is being rejected',
        required: true,
        requiredMessage: 'Rejection reason is required.',
      },
    });
    if (!confirmed) return;

    try {
      await doctorService.rejectAppointment(appointment._id, inputValue);
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointment._id ? { ...a, status: 'cancelled' } : a))
      );
      showToast({
        type: 'success',
        title: 'Appointment rejected',
        message: 'The rejection reason has been sent to the patient.',
      });
    } catch (err) {
      console.error('Error rejecting appointment:', err);
      showToast({
        type: 'error',
        title: 'Rejection failed',
        message: 'Failed to reject appointment.',
      });
    }
  };

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleComplete = async (appointment) => {
    const { confirmed, inputValue } = await showConfirm({
      title: 'Complete appointment?',
      message: 'You can add optional consultation notes before marking this appointment as completed.',
      confirmText: 'Mark completed',
      cancelText: 'Cancel',
      confirmVariant: 'success',
      inputConfig: {
        type: 'textarea',
        label: 'Consultation notes (optional)',
        placeholder: 'Add summary, follow-up advice, or key observations',
        required: false,
      },
    });
    if (!confirmed) return;

    try {
      await doctorService.completeAppointment(appointment._id, inputValue || '');
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointment._id ? { ...a, status: 'completed' } : a))
      );
      showToast({
        type: 'success',
        title: 'Appointment completed',
        message: 'Appointment status updated successfully.',
      });
    } catch (err) {
      console.error('Error completing appointment:', err);
      showToast({
        type: 'error',
        title: 'Completion failed',
        message: err.response?.data?.message || 'Failed to complete appointment.',
      });
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

  const handleReschedule = async (appointment) => {
    setRescheduleAppointment(appointment);
  };

  const handleRescheduleSubmit = async (payload) => {
    if (!rescheduleAppointment?._id) return;

    setRescheduling(true);
    try {
      const res = await doctorService.rescheduleAppointmentByDoctor(rescheduleAppointment._id, payload);
      const updated = res?.data?.appointment;

      setAppointments((prev) =>
        prev.map((a) =>
          a._id === rescheduleAppointment._id
            ? {
                ...a,
                dateTime: updated?.dateTime || payload.dateTime,
                status: updated?.status || 'confirmed',
                notes: updated?.notes || a.notes,
              }
            : a
        )
      );
      setRescheduleAppointment(null);
      showToast({
        type: 'success',
        title: 'Appointment rescheduled',
        message: 'The patient has been notified about the new schedule.',
      });
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      showToast({
        type: 'error',
        title: 'Reschedule failed',
        message: err.response?.data?.message || 'Failed to reschedule appointment.',
      });
    } finally {
      setRescheduling(false);
    }
  };

  const counts = appointments.reduce(
    (acc, a) => {
      acc.total++;
      const s = normalizeAppointmentStatus(a.status);
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  );

  const filteredAppointments =
    filter === 'all'
      ? appointments
      : appointments.filter((a) => normalizeAppointmentStatus(a.status) === filter);

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
          onReschedule={handleReschedule}
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
                  <span className={`${styles.detailValue} ${styles.statusTag} ${styles[normalizeAppointmentStatus(selectedAppointment.status)]}`}>
                    {normalizeAppointmentStatus(selectedAppointment.status)}
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

        <RescheduleAppointmentModal
          open={Boolean(rescheduleAppointment)}
          appointment={rescheduleAppointment}
          onClose={() => setRescheduleAppointment(null)}
          onSubmit={handleRescheduleSubmit}
          submitting={rescheduling}
        />
      </div>
    </DoctorLayout>
  );
};

export default Appointments;
