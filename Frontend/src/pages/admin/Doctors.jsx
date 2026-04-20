import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Edit3, Eye, Save, UserCheck, UserX, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import FilterToolbar from '../../components/admin/FilterToolbar';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { useModal } from '../../components/common/feedback/ModalProvider';
import adminService from '../../services/adminService';
import styles from './Doctors.module.css';

const defaultWorkingDays = [
  { dayOfWeek: 1, label: 'Mon', isWorking: true, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 2, label: 'Tue', isWorking: true, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 3, label: 'Wed', isWorking: true, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 4, label: 'Thu', isWorking: true, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 5, label: 'Fri', isWorking: true, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 6, label: 'Sat', isWorking: false, startTime: '09:00', endTime: '13:00' },
  { dayOfWeek: 0, label: 'Sun', isWorking: false, startTime: '09:00', endTime: '13:00' },
];

const Doctors = () => {
  const { showConfirm } = useModal();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availabilityDoctor, setAvailabilityDoctor] = useState(null);
  const [availability, setAvailability] = useState({ slotDurationMinutes: 30, workingDays: defaultWorkingDays });
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ role: 'doctor' });
      setDoctors(res.data?.users || []);
    } catch (err) {
      console.error('Failed to load doctors', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesStatus = statusFilter === 'all' || (doc.isActive !== false ? 'active' : 'inactive') === statusFilter;
      const matchesVerified = verifiedFilter === 'all' || (doc.isVerified ? 'verified' : 'unverified') === verifiedFilter;
      const keyword = search.trim().toLowerCase();
      const matchesSearch = !keyword || [doc.name, doc.email, doc.professionalDetails?.specialization]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));
      return matchesStatus && matchesVerified && matchesSearch;
    });
  }, [doctors, search, statusFilter, verifiedFilter]);

  const openEdit = (doctor) => {
    setSelectedDoctor({
      ...doctor,
      professionalDetails: {
        ...doctor.professionalDetails,
        qualifications: doctor.professionalDetails?.qualifications || [],
      },
    });
  };

  const openAvailability = async (doctor) => {
    setAvailabilityDoctor(doctor);
    try {
      const res = await adminService.getDoctorAvailability(doctor._id);
      const serverAvailability = res.data?.availability || res.data?.data?.availability;
      if (serverAvailability?.workingDays?.length) {
        const withLabels = serverAvailability.workingDays.map((day) => {
          const label = defaultWorkingDays.find((d) => d.dayOfWeek === day.dayOfWeek)?.label || '';
          return { ...day, label };
        });
        setAvailability({
          slotDurationMinutes: serverAvailability.slotDurationMinutes || 30,
          workingDays: withLabels,
        });
      } else {
        setAvailability({ slotDurationMinutes: 30, workingDays: defaultWorkingDays });
      }
    } catch (err) {
      console.error('Failed to load availability', err);
      setAvailability({ slotDurationMinutes: 30, workingDays: defaultWorkingDays });
    }
  };

  const updateWorkingDay = (index, field, value) => {
    setAvailability((prev) => {
      const workingDays = prev.workingDays.map((day, idx) =>
        idx === index ? { ...day, [field]: value } : day
      );
      return { ...prev, workingDays };
    });
  };

  const saveAvailability = async () => {
    if (!availabilityDoctor) return;
    setSavingAvailability(true);
    try {
      const payload = {
        slotDurationMinutes: availability.slotDurationMinutes,
        workingDays: availability.workingDays.map(({ label, ...rest }) => rest),
      };
      await adminService.updateDoctorAvailability(availabilityDoctor._id, payload);
      setAvailabilityDoctor(null);
    } catch (err) {
      console.error('Failed to update availability', err);
    } finally {
      setSavingAvailability(false);
    }
  };

  const saveProfile = async () => {
    if (!selectedDoctor) return;
    setSavingProfile(true);
    try {
      const payload = {
        name: selectedDoctor.name,
        phone: selectedDoctor.phone,
        professionalDetails: selectedDoctor.professionalDetails,
      };
      const res = await adminService.updateUserProfile(selectedDoctor._id, payload);
      const updated = res.data?.user || selectedDoctor;
      setDoctors((prev) => prev.map((doc) => (doc._id === updated._id ? updated : doc)));
      setSelectedDoctor(null);
    } catch (err) {
      console.error('Failed to update doctor profile', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleStatusToggle = async (doctor) => {
    const nextStatus = doctor.isActive === false;
    const confirmText = nextStatus
      ? 'Activate this doctor account?'
      : 'Deactivate this doctor account? They will not be able to sign in.';
    const { confirmed } = await showConfirm({
      title: nextStatus ? 'Activate doctor account?' : 'Deactivate doctor account?',
      message: confirmText,
      confirmText: nextStatus ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      confirmVariant: nextStatus ? 'success' : 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await adminService.updateUserStatus(doctor._id, nextStatus);
      const updated = res.data?.user || doctor;
      setDoctors((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));
    } catch (err) {
      console.error('Failed to update doctor status', err);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Doctor',
      render: (row) => (
        <div>
          <span className={styles.primaryText}>Dr. {row.name}</span>
          <span className={styles.subText}>{row.professionalDetails?.specialization || 'General'}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (row) => (
        <div>
          <span className={styles.primaryText}>{row.email}</span>
          <span className={styles.subText}>{row.phone || '—'}</span>
        </div>
      ),
    },
    {
      key: 'fee',
      label: 'Consultation Fee',
      render: (row) => <span>{row.professionalDetails?.consultationFee || 0}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div className={styles.statusGroup}>
          <StatusBadge status={row.isActive !== false ? 'active' : 'inactive'} />
          <StatusBadge status={row.isVerified ? 'verified' : 'unverified'} />
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className={styles.actionCell}>
          <button
            className={row.isActive === false ? styles.activateBtn : styles.deactivateBtn}
            onClick={() => handleStatusToggle(row)}
            title={row.isActive === false ? 'Activate doctor' : 'Deactivate doctor'}
          >
            {row.isActive === false ? <UserCheck size={14} /> : <UserX size={14} />}
          </button>
          <button className={styles.actionBtn} onClick={() => openEdit(row)}>
            <Edit3 size={14} /> Edit
          </button>
          <button className={styles.actionBtn} onClick={() => openAvailability(row)}>
            <CalendarClock size={14} /> Schedule
          </button>
          <button className={styles.ghostBtn} onClick={() => openEdit(row)}>
            <Eye size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Doctor Management</h1>
          <p className={styles.subtitle}>Configure doctor profiles, fees, and appointment schedules.</p>
        </div>

        <FilterToolbar
          searchValue={search}
          onSearchChange={setSearch}
          placeholder="Search doctor or specialization"
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ],
            },
            {
              key: 'verified',
              label: 'Verification',
              value: verifiedFilter,
              onChange: setVerifiedFilter,
              options: [
                { value: 'all', label: 'All' },
                { value: 'verified', label: 'Verified' },
                { value: 'unverified', label: 'Unverified' },
              ],
            },
          ]}
        />

        <div className={styles.tableSection}>
          <DataTable
            columns={columns}
            rows={filteredDoctors}
            loading={loading}
            emptyMessage="No doctors found"
          />
        </div>

        {selectedDoctor && (
          <div className={styles.modalOverlay} onClick={() => setSelectedDoctor(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Edit Doctor Profile</h2>
                <button className={styles.closeBtn} onClick={() => setSelectedDoctor(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <label className={styles.formField}>
                  Full Name
                  <input
                    value={selectedDoctor.name}
                    onChange={(e) => setSelectedDoctor({ ...selectedDoctor, name: e.target.value })}
                  />
                </label>
                <label className={styles.formField}>
                  Phone
                  <input
                    value={selectedDoctor.phone || ''}
                    onChange={(e) => setSelectedDoctor({ ...selectedDoctor, phone: e.target.value })}
                  />
                </label>
                <label className={styles.formField}>
                  Specialization
                  <input
                    value={selectedDoctor.professionalDetails?.specialization || ''}
                    onChange={(e) =>
                      setSelectedDoctor({
                        ...selectedDoctor,
                        professionalDetails: {
                          ...selectedDoctor.professionalDetails,
                          specialization: e.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label className={styles.formField}>
                  License Number
                  <input
                    value={selectedDoctor.professionalDetails?.licenseNumber || ''}
                    onChange={(e) =>
                      setSelectedDoctor({
                        ...selectedDoctor,
                        professionalDetails: {
                          ...selectedDoctor.professionalDetails,
                          licenseNumber: e.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label className={styles.formField}>
                  Consultation Fee
                  <input
                    type="number"
                    value={selectedDoctor.professionalDetails?.consultationFee || 0}
                    onChange={(e) =>
                      setSelectedDoctor({
                        ...selectedDoctor,
                        professionalDetails: {
                          ...selectedDoctor.professionalDetails,
                          consultationFee: Number(e.target.value || 0),
                        },
                      })
                    }
                  />
                </label>
                <label className={styles.formField}>
                  Consultation Duration (minutes)
                  <input
                    type="number"
                    value={selectedDoctor.professionalDetails?.consultationDurationMinutes || 30}
                    onChange={(e) =>
                      setSelectedDoctor({
                        ...selectedDoctor,
                        professionalDetails: {
                          ...selectedDoctor.professionalDetails,
                          consultationDurationMinutes: Number(e.target.value || 30),
                        },
                      })
                    }
                  />
                </label>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.secondaryBtn} onClick={() => setSelectedDoctor(null)}>
                  Cancel
                </button>
                <button className={styles.primaryBtn} onClick={saveProfile} disabled={savingProfile}>
                  <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {availabilityDoctor && (
          <div className={styles.modalOverlay} onClick={() => setAvailabilityDoctor(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Availability Schedule</h2>
                <button className={styles.closeBtn} onClick={() => setAvailabilityDoctor(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <label className={styles.formField}>
                  Slot Duration (minutes)
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={availability.slotDurationMinutes}
                    onChange={(e) => setAvailability((prev) => ({ ...prev, slotDurationMinutes: Number(e.target.value || 30) }))}
                  />
                </label>
                <div className={styles.scheduleGrid}>
                  {availability.workingDays.map((day, index) => (
                    <div key={day.dayOfWeek} className={styles.scheduleRow}>
                      <label className={styles.dayToggle}>
                        <input
                          type="checkbox"
                          checked={day.isWorking}
                          onChange={(e) => updateWorkingDay(index, 'isWorking', e.target.checked)}
                        />
                        <span>{day.label}</span>
                      </label>
                      <input
                        type="time"
                        value={day.startTime}
                        disabled={!day.isWorking}
                        onChange={(e) => updateWorkingDay(index, 'startTime', e.target.value)}
                      />
                      <input
                        type="time"
                        value={day.endTime}
                        disabled={!day.isWorking}
                        onChange={(e) => updateWorkingDay(index, 'endTime', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.secondaryBtn} onClick={() => setAvailabilityDoctor(null)}>
                  Cancel
                </button>
                <button className={styles.primaryBtn} onClick={saveAvailability} disabled={savingAvailability}>
                  <Save size={16} /> {savingAvailability ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Doctors;
