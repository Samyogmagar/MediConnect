import { useState, useEffect } from 'react';
import { Pill, Calendar, User, Plus, List, Clock, XCircle, Trash2 } from 'lucide-react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import { useToast } from '../../components/common/feedback/ToastProvider';
import { useModal } from '../../components/common/feedback/ModalProvider';
import doctorService from '../../services/doctorService';
import styles from './Prescriptions.module.css';

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const FREQUENCY_OPTIONS = [
  { value: 'once_daily', label: 'Once Daily' },
  { value: 'twice_daily', label: 'Twice Daily' },
  { value: 'three_times_daily', label: 'Three Times Daily' },
  { value: 'four_times_daily', label: 'Four Times Daily' },
  { value: 'every_6_hours', label: 'Every 6 Hours' },
  { value: 'every_8_hours', label: 'Every 8 Hours' },
  { value: 'every_12_hours', label: 'Every 12 Hours' },
  { value: 'before_meals', label: 'Before Meals' },
  { value: 'after_meals', label: 'After Meals' },
  { value: 'at_bedtime', label: 'At Bedtime' },
  { value: 'as_needed', label: 'As Needed' },
];

const DURATION_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
];

const Prescriptions = () => {
  const { showToast } = useToast();
  const { showConfirm } = useModal();
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    durationValue: '',
    durationUnit: 'days',
    frequency: 'once_daily',
    instructions: '',
    reason: '',
    remindersEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchMedications();
    fetchAppointments();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await doctorService.getPatients();
      setPatients(res.data?.patients || []);
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  };

  const fetchMedications = async () => {
    setListLoading(true);
    try {
      const res = await doctorService.getMedications();
      setMedications(res.data?.medications || []);
    } catch (err) {
      console.error('Error loading medications:', err);
    } finally {
      setListLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await doctorService.getAppointments();
      setAppointments(res.data?.appointments || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    if (!selectedPatient) {
      setError('Please select a patient.');
      setLoading(false);
      return;
    }

    if (!selectedAppointment) {
      setError('Please select a completed appointment.');
      setLoading(false);
      return;
    }

    if (!formData.durationValue || isNaN(formData.durationValue)) {
      setError('Please enter a valid duration number.');
      setLoading(false);
      return;
    }

    const payload = {
      patientId: selectedPatient,
      appointmentId: selectedAppointment,
      medicationName: formData.medicationName,
      dosage: formData.dosage,
      frequency: formData.frequency,
      duration: {
        value: parseInt(formData.durationValue, 10),
        unit: formData.durationUnit,
      },
      instructions: formData.instructions || undefined,
      reason: formData.reason || undefined,
      remindersEnabled: formData.remindersEnabled,
    };

    try {
      await doctorService.prescribeMedication(payload);
      window.dispatchEvent(new Event('notifications:refresh'));
      setSuccess('Prescription created successfully! The patient has been notified.');
      
      // Reset form
      setFormData({
        medicationName: '',
        dosage: '',
        durationValue: '',
        durationUnit: 'days',
        frequency: 'once_daily',
        instructions: '',
        reason: '',
        remindersEnabled: true,
      });
      setSelectedPatient('');
      setSelectedAppointment('');
      
      // Reload medications list
      fetchMedications();
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating prescription:', err);
      setError(err.response?.data?.message || 'Failed to create prescription.');
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

  const completedAppointments = appointments.filter(
    (appt) => appt.patientId?._id === selectedPatient && normalizeStatus(appt.status) === 'completed'
  );

  const handleDiscontinue = async (medicationId) => {
    const { confirmed, inputValue } = await showConfirm({
      title: 'Discontinue medication?',
      message: 'Provide a reason for discontinuing this medication.',
      confirmText: 'Discontinue',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      inputConfig: {
        type: 'textarea',
        label: 'Reason',
        placeholder: 'Explain why this medication is being discontinued',
        required: true,
        requiredMessage: 'Reason is required.',
      },
    });
    if (!confirmed) return;

    try {
      await doctorService.discontinueMedication(medicationId, inputValue);
      setMedications((prev) =>
        prev.map((m) => (m._id === medicationId ? { ...m, status: 'discontinued' } : m))
      );
      showToast({
        type: 'success',
        title: 'Medication discontinued',
        message: 'Prescription status updated to discontinued.',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Discontinue failed',
        message: err.response?.data?.message || 'Failed to discontinue medication.',
      });
    }
  };

  const handleDeleteDiscontinued = async (medicationId) => {
    const { confirmed } = await showConfirm({
      title: 'Delete discontinued prescription?',
      message: 'Delete this discontinued prescription permanently?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
    });
    if (!confirmed) return;

    try {
      await doctorService.deleteDiscontinuedMedication(medicationId);
      setMedications((prev) => prev.filter((m) => m._id !== medicationId));
      showToast({
        type: 'success',
        title: 'Prescription deleted',
        message: 'Discontinued prescription removed successfully.',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Delete failed',
        message: err.response?.data?.message || 'Failed to delete discontinued prescription.',
      });
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFrequency = (freq) => {
    const opt = FREQUENCY_OPTIONS.find((f) => f.value === freq);
    return opt ? opt.label : freq;
  };

  return (
    <DoctorLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Prescriptions</h1>
            <p className={styles.subtitle}>Prescribe and manage medications for your patients</p>
          </div>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'list' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('list')}
            >
              <List size={16} /> All Prescriptions
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'create' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <Plus size={16} /> New Prescription
            </button>
          </div>
        </div>

        {success && <div className={styles.successBanner}>{success}</div>}
        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Prescription List Tab */}
        {activeTab === 'list' && (
          <div className={styles.listSection}>
            {listLoading ? (
              <div className={styles.loading}>Loading prescriptions...</div>
            ) : medications.length === 0 ? (
              <div className={styles.emptyState}>
                <Pill size={40} />
                <p>No prescriptions yet</p>
                <button className={styles.createBtn} onClick={() => setActiveTab('create')}>
                  <Plus size={16} /> Create First Prescription
                </button>
              </div>
            ) : (
              <div className={styles.medList}>
                {medications.map((med) => (
                  <div key={med._id} className={styles.medCard}>
                    <div className={styles.medHeader}>
                      <div>
                        <h3 className={styles.medName}>{med.medicationName}</h3>
                        <span className={styles.medPatient}>
                          Patient: {med.patientId?.name || 'Unknown'}
                        </span>
                      </div>
                      <span className={`${styles.medStatus} ${styles[med.status]}`}>
                        {med.status}
                      </span>
                    </div>
                    <div className={styles.medDetails}>
                      <span><Pill size={14} /> {med.dosage}</span>
                      <span><Clock size={14} /> {formatFrequency(med.frequency)}</span>
                      <span><Calendar size={14} /> {med.duration?.value} {med.duration?.unit}</span>
                    </div>
                    <div className={styles.medDates}>
                      <span>Start: {formatDate(med.startDate)}</span>
                      <span>End: {formatDate(med.endDate)}</span>
                    </div>
                    {med.instructions && (
                      <p className={styles.medInstructions}>{med.instructions}</p>
                    )}
                    {med.status === 'active' && (
                      <button
                        className={styles.discontinueBtn}
                        onClick={() => handleDiscontinue(med._id)}
                      >
                        <XCircle size={14} /> Discontinue
                      </button>
                    )}
                    {med.status === 'discontinued' && (
                      <button
                        className={styles.discontinueBtn}
                        onClick={() => handleDeleteDiscontinued(med._id)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Prescription Tab */}
        {activeTab === 'create' && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <Pill size={24} />
            <h2>Create New Prescription</h2>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Patient Selection */}
            <div className={styles.formGroup}>
              <label htmlFor="patient" className={styles.label}>
                <User size={16} /> Select Patient
              </label>
              <select
                id="patient"
                value={selectedPatient}
                onChange={(e) => {
                  setSelectedPatient(e.target.value);
                  setSelectedAppointment('');
                }}
                className={styles.select}
                required
              >
                <option value="">Choose a patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({calculateAge(p.dateOfBirth)} yrs)
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Selection */}
            <div className={styles.formGroup}>
              <label htmlFor="appointment" className={styles.label}>
                <Calendar size={16} /> Completed Appointment
              </label>
              <select
                id="appointment"
                value={selectedAppointment}
                onChange={(e) => setSelectedAppointment(e.target.value)}
                className={styles.select}
                required
                disabled={!selectedPatient}
              >
                <option value="">Select completed appointment</option>
                {completedAppointments.map((appt) => (
                  <option key={appt._id} value={appt._id}>
                    {new Date(appt.dateTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })} — {new Date(appt.dateTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </option>
                ))}
              </select>
              {selectedPatient && completedAppointments.length === 0 && (
                <p className={styles.helperText}>No completed appointments found for this patient.</p>
              )}
            </div>

            {/* Medicine Name */}
            <div className={styles.formGroup}>
              <label htmlFor="medicationName" className={styles.label}>
                Medication Name
              </label>
              <input
                type="text"
                id="medicationName"
                name="medicationName"
                value={formData.medicationName}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="e.g., Amoxicillin"
                required
              />
            </div>

            {/* Dosage */}
            <div className={styles.formGroup}>
              <label htmlFor="dosage" className={styles.label}>
                Dosage
              </label>
              <input
                type="text"
                id="dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="e.g., 500mg"
                required
              />
            </div>

            {/* Frequency */}
            <div className={styles.formGroup}>
              <label htmlFor="frequency" className={styles.label}>
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className={styles.select}
                required
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className={styles.formGroup}>
              <label htmlFor="durationValue" className={styles.label}>
                Duration
              </label>
              <div className={styles.durationRow}>
                <input
                  type="number"
                  id="durationValue"
                  name="durationValue"
                  value={formData.durationValue}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="e.g., 7"
                  min="1"
                  required
                />
                <select
                  name="durationUnit"
                  value={formData.durationUnit}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  {DURATION_UNITS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reason */}
            <div className={styles.formGroup}>
              <label htmlFor="reason" className={styles.label}>
                Reason for Prescription
              </label>
              <input
                type="text"
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="e.g., Bacterial infection"
              />
            </div>

            {/* Instructions */}
            <div className={styles.formGroup}>
              <label htmlFor="instructions" className={styles.label}>
                Instructions (Optional)
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Additional instructions or notes..."
                rows={4}
              />
            </div>

            {/* Reminders Toggle */}
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="remindersEnabled"
                name="remindersEnabled"
                checked={formData.remindersEnabled}
                onChange={handleInputChange}
              />
              <label htmlFor="remindersEnabled">
                Enable medication reminders for patient
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <Plus size={18} /> {loading ? 'Creating...' : 'Create Prescription'}
            </button>
          </form>
        </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default Prescriptions;
