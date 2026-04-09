import { useMemo, useState, useEffect } from 'react';
import { Eye, Calendar, Clock, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import FilterToolbar from '../../components/admin/FilterToolbar';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import appointmentService from '../../services/appointmentService';
import styles from './Appointments.module.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentService.getAppointments();
      setAppointments(res.data?.appointments || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
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
      const key = normalizeStatus(a.status);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  );

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const normalizedStatus = normalizeStatus(apt.status);
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;

      const keyword = search.trim().toLowerCase();
      const matchesSearch = !keyword || [
        apt.patientId?.name,
        apt.patientId?.email,
        apt.doctorId?.name,
        apt.doctorId?.professionalDetails?.specialization,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));

      const now = new Date();
      const dateTime = apt.dateTime ? new Date(apt.dateTime) : null;
      let matchesDate = true;
      if (dateFilter === 'today' && dateTime) {
        matchesDate = dateTime.toDateString() === now.toDateString();
      }
      if (dateFilter === 'upcoming' && dateTime) {
        matchesDate = dateTime >= now;
      }
      if (dateFilter === 'past' && dateTime) {
        matchesDate = dateTime < now;
      }

      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [appointments, search, statusFilter, dateFilter]);

  const columns = [
    {
      key: 'patient',
      label: 'Patient',
      render: (row) => (
        <div>
          <span className={styles.primaryText}>{row.patientId?.name || 'Unknown'}</span>
          <span className={styles.subText}>{row.patientId?.email || ''}</span>
        </div>
      ),
    },
    {
      key: 'doctor',
      label: 'Doctor',
      render: (row) => (
        <div>
          <span className={styles.primaryText}>Dr. {row.doctorId?.name || 'Unknown'}</span>
          <span className={styles.subText}>
            {row.doctorId?.professionalDetails?.specialization || ''}
          </span>
        </div>
      ),
    },
    {
      key: 'dateTime',
      label: 'Date & Time',
      render: (row) => (
        <div className={styles.dateCell}>
          <span className={styles.dateRow}>
            <Calendar size={13} /> {formatDate(row.dateTime)}
          </span>
          <span className={styles.timeRow}>
            <Clock size={13} /> {formatTime(row.dateTime)}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={normalizeStatus(row.status)} />,
    },
    {
      key: 'payment',
      label: 'Payment',
      render: (row) => (
        <span className={styles.subText}>{row.payment?.method ? row.payment.method.toUpperCase() : '—'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button className={styles.viewBtn} onClick={() => setSelectedAppointment(row)}>
          <Eye size={16} /> View
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Appointments</h1>
          <p className={styles.subtitle}>Monitor all appointment activities (read-only)</p>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard
            icon={<Calendar size={20} />}
            label="Total Appointments"
            value={counts.total}
            color="blue"
          />
          <StatCard
            icon={<Clock size={20} />}
            label="Pending"
            value={counts.pending}
            color="yellow"
          />
          <StatCard
            icon={<Calendar size={20} />}
            label="Confirmed"
            value={counts.confirmed}
            color="green"
          />
          <StatCard
            icon={<Calendar size={20} />}
            label="Completed"
            value={counts.completed}
            color="blue"
          />
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.tableSection}>
          <h2 className={styles.sectionTitle}>All Appointments</h2>
          <FilterToolbar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search patient, doctor, department"
            filters={[
              {
                key: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ],
              },
              {
                key: 'date',
                label: 'Date',
                value: dateFilter,
                onChange: setDateFilter,
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'today', label: 'Today' },
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'past', label: 'Past' },
                ],
              },
            ]}
          />
          <DataTable
            columns={columns}
            rows={filteredAppointments}
            loading={loading}
            emptyMessage="No appointments found"
          />
        </div>

        {/* Appointment Detail Modal */}
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
                  <span className={styles.detailLabel}>Patient Email</span>
                  <span className={styles.detailValue}>{selectedAppointment.patientId?.email || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Doctor</span>
                  <span className={styles.detailValue}>Dr. {selectedAppointment.doctorId?.name || 'Unknown'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Specialization</span>
                  <span className={styles.detailValue}>{selectedAppointment.doctorId?.professionalDetails?.specialization || '—'}</span>
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
                  <span className={styles.detailLabel}>Status</span>
                  <span className={styles.detailValue}>{normalizeStatus(selectedAppointment.status)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Payment</span>
                  <span className={styles.detailValue}>
                    {selectedAppointment.payment?.method
                      ? `${selectedAppointment.payment.method.toUpperCase()} · ${selectedAppointment.payment.status || 'pending'}`
                      : '—'}
                  </span>
                </div>
                {selectedAppointment.reason && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Reason</span>
                    <span className={styles.detailValue}>{selectedAppointment.reason}</span>
                  </div>
                )}
                {selectedAppointment.notes && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Notes</span>
                    <span className={styles.detailValue}>{selectedAppointment.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Appointments;
