import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Droplet,
  Calendar,
  Upload,
  FileText,
  Clock,
  AlertCircle,
  Zap,
  X,
  CheckCircle,
} from 'lucide-react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import doctorService from '../../services/doctorService';
import styles from './AssignLabTest.module.css';

const TEST_TYPES = [
  'Blood Test',
  'Urine Test',
  'X-Ray',
  'CT Scan',
  'MRI',
  'Ultrasound',
  'ECG',
  'EEG',
  'Biopsy',
  'Endoscopy',
  'Other',
];

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Normal', icon: <Clock size={18} />, color: '#22c55e', description: 'Standard processing time' },
  { value: 'urgent', label: 'Urgent', icon: <AlertCircle size={18} />, color: '#f59e0b', description: 'Priority processing' },
  { value: 'emergency', label: 'Critical', icon: <Zap size={18} />, color: '#ef4444', description: 'Immediate attention required' },
];

const AssignLabTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const patientFromState = location.state?.patient;
  const patientId = searchParams.get('patientId');

  const [patient] = useState(patientFromState || null);
  const [labs, setLabs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [previousTests, setPreviousTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    labId: '',
    appointmentId: '',
    testType: '',
    testName: '',
    urgency: 'routine',
    estimatedCompletionDate: '',
    description: '',
    instructions: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [labsRes, testsRes] = await Promise.all([
        doctorService.getLabs(),
        patientId ? doctorService.getPatientDiagnosticTests(patientId) : Promise.resolve(null),
      ]);

      setLabs(labsRes?.data?.labs || []);

      if (testsRes) {
        const tests = testsRes?.data?.tests || [];
        setPreviousTests(tests);
      }

      const apptRes = await doctorService.getAppointments();
      setAppointments(apptRes.data?.appointments || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.labId) return setError('Please select a laboratory.');
    if (!form.appointmentId) return setError('Please select a completed appointment.');
    if (!form.testType) return setError('Please select a test category.');
    if (!form.testName) return setError('Please enter a test name.');

    setSubmitting(true);
    try {
      await doctorService.assignDiagnosticTest({
        patientId,
        labId: form.labId,
        appointmentId: form.appointmentId,
        testType: form.testType,
        testName: form.testName,
        urgency: form.urgency,
        description: form.description,
        instructions: form.instructions,
        estimatedCompletionDate: form.estimatedCompletionDate || undefined,
      });

      setSuccess('Lab test assigned successfully! The lab has been notified.');
      
      // Reset form
      setForm({
        labId: '',
        appointmentId: '',
        testType: '',
        testName: '',
        urgency: 'routine',
        estimatedCompletionDate: '',
        description: '',
        instructions: '',
      });

      // Reload previous tests to show the new assignment
      const testsRes = await doctorService.getPatientDiagnosticTests(patientId);
      setPreviousTests(testsRes?.data?.tests || []);
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error assigning test:', err);
      setError(err.response?.data?.message || 'Failed to assign lab test.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'report_uploaded': return styles.statusCompleted;
      case 'processing': return styles.statusProgress;
      case 'sample_collected': return styles.statusPending;
      case 'cancelled': return styles.statusCancelled;
      default: return styles.statusAssigned;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'sample_collected': return 'Sample Collected';
      case 'processing': return 'Processing';
      case 'report_uploaded': return 'Report Uploaded';
      case 'cancelled': return 'Cancelled';
      default: return 'Assigned';
    }
  };

  const normalizeStatus = (status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'approved') return 'confirmed';
    if (normalized === 'rejected') return 'cancelled';
    return normalized;
  };

  const completedAppointments = appointments.filter(
    (appt) => appt.patientId?._id === patientId && normalizeStatus(appt.status) === 'completed'
  );

  const age = patient ? getAge(patient.dateOfBirth) : null;
  const bloodType = patient?.bloodType || patient?.bloodGroup || null;

  return (
    <DoctorLayout>
      <div className={styles.page}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button className={styles.backBtn} onClick={() => navigate('/doctor/patients')}>
            <ArrowLeft size={18} />
            <span>Back to Patients</span>
          </button>
          <div className={styles.breadcrumbPath}>
            <span>Patients</span>
            <span className={styles.sep}>/</span>
            <span>{patient?.name || 'Patient'}</span>
            <span className={styles.sep}>/</span>
            <span className={styles.active}>Assign Lab Test</span>
          </div>
        </div>

        {/* Patient Info Banner */}
        {patient && (
          <div className={styles.patientBanner}>
            <div className={styles.patientAvatar}>
              {patient.profilePicture || patient.profileImageUrl ? (
                <img src={patient.profilePicture || patient.profileImageUrl} alt={patient.name} />
              ) : (
                <span>{(patient.name || '?').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className={styles.patientDetails}>
              <h2 className={styles.patientName}>{patient.name}</h2>
              <div className={styles.patientMeta}>
                <div className={styles.metaItem}>
                  <User size={14} />
                  <span>ID: {(patient._id || '').slice(-8).toUpperCase()}</span>
                </div>
                {age && (
                  <div className={styles.metaItem}>
                    <Calendar size={14} />
                    <span>{age} yrs, {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : ''}</span>
                  </div>
                )}
                {bloodType && (
                  <div className={styles.metaItem}>
                    <Droplet size={14} />
                    <span>{bloodType}</span>
                  </div>
                )}
                {patient.phone && (
                  <div className={styles.metaItem}>
                    <Phone size={14} />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.email && (
                  <div className={styles.metaItem}>
                    <Mail size={14} />
                    <span>{patient.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {success && (
          <div className={styles.successBanner}>
            <CheckCircle size={16} />
            {success}
          </div>
        )}
        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <>
            {/* Lab Test Request Form */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <FileText size={20} />
                <div>
                  <h3>Lab Test Request Details</h3>
                  <p>Fill in the details below to assign a lab test for this patient</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Lab Selection */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Select Laboratory *</label>
                  <select
                    className={styles.select}
                    value={form.labId}
                    onChange={(e) => handleChange('labId', e.target.value)}
                  >
                    <option value="">Choose a laboratory...</option>
                    {labs.map((lab) => (
                      <option key={lab._id} value={lab._id}>
                        {lab.name} {lab.labName ? `(${lab.labName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Appointment Selection */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Completed Appointment *</label>
                  <select
                    className={styles.select}
                    value={form.appointmentId}
                    onChange={(e) => handleChange('appointmentId', e.target.value)}
                  >
                    <option value="">Select completed appointment...</option>
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
                  {completedAppointments.length === 0 && (
                    <p className={styles.helperText}>No completed appointments found for this patient.</p>
                  )}
                </div>

                {/* Test Category */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Test Category *</label>
                    <select
                      className={styles.select}
                      value={form.testType}
                      onChange={(e) => handleChange('testType', e.target.value)}
                    >
                      <option value="">Select test category...</option>
                      {TEST_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Test Name *</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g., Complete Blood Count, TSH Level"
                      value={form.testName}
                      onChange={(e) => handleChange('testName', e.target.value)}
                    />
                  </div>
                </div>

                {/* Urgency Level */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Urgency Level</label>
                  <div className={styles.urgencyCards}>
                    {URGENCY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.urgencyCard} ${form.urgency === opt.value ? styles.urgencyActive : ''}`}
                        style={{ '--urgency-color': opt.color }}
                        onClick={() => handleChange('urgency', opt.value)}
                      >
                        <span className={styles.urgencyIcon}>{opt.icon}</span>
                        <span className={styles.urgencyLabel}>{opt.label}</span>
                        <span className={styles.urgencyDesc}>{opt.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Date */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Preferred Date</label>
                    <input
                      type="date"
                      className={styles.input}
                      value={form.estimatedCompletionDate}
                      onChange={(e) => handleChange('estimatedCompletionDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Clinical Notes */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Clinical Notes</label>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    placeholder="Add any clinical notes or reasons for this test..."
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>

                {/* Instructions */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Patient Instructions</label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    placeholder="Special instructions for the patient (e.g., fasting requirements)..."
                    value={form.instructions}
                    onChange={(e) => handleChange('instructions', e.target.value)}
                  />
                </div>

                {/* Submit Buttons */}
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => navigate('/doctor/patients')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={submitting}
                  >
                    {submitting ? 'Assigning...' : 'Assign Test'}
                  </button>
                </div>
              </form>
            </div>

            {/* Previously Assigned Tests */}
            {previousTests.length > 0 && (
              <div className={styles.previousSection}>
                <h3 className={styles.previousTitle}>Previously Assigned Tests</h3>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Test ID</th>
                        <th>Test Name</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Assigned Date</th>
                        <th>Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previousTests.map((test) => (
                        <tr key={test._id}>
                          <td className={styles.testId}>
                            #{(test._id || '').slice(-6).toUpperCase()}
                          </td>
                          <td>{test.testName}</td>
                          <td>{test.testType}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${getStatusClass(test.status)}`}>
                              {getStatusLabel(test.status)}
                            </span>
                          </td>
                          <td>{formatDate(test.assignedAt || test.createdAt)}</td>
                          <td>
                            {test.report?.url ? (
                              <a
                                href={test.report.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.reportLink}
                              >
                                View Report
                              </a>
                            ) : (
                              <span className={styles.noReport}>Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DoctorLayout>
  );
};

export default AssignLabTest;
