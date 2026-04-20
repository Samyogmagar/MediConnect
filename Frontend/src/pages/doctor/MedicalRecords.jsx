import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  FileText, Calendar, FlaskConical, Pill, User, AlertCircle,
  Activity, Heart, Thermometer, Droplets, Weight, TrendingUp,
  Clock, Shield, Clipboard, Plus, X
} from 'lucide-react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import { useToast } from '../../components/common/feedback/ToastProvider';
import doctorService from '../../services/doctorService';
import medicalRecordService from '../../services/medicalRecordService';
import { resolveAssetUrl } from '../../utils/assetUrl.util';
import { isDiagnosticReportReady, normalizeDiagnosticStatus } from '../../utils/doctorWorkflowStatus.util';
import styles from './MedicalRecords.module.css';

// Demo/sample medical data for new patients or when records are empty
const DEMO_VITALS = {
  bloodPressure: '120/80 mmHg',
  heartRate: '72 bpm',
  temperature: '98.6°F (37°C)',
  oxygenSaturation: '98%',
  weight: '70 kg',
  height: '175 cm',
  bmi: '22.9',
  respiratoryRate: '16 breaths/min',
};

const DEMO_ALLERGIES = [
  { name: 'Penicillin', severity: 'High', reaction: 'Anaphylaxis' },
  { name: 'Peanuts', severity: 'Moderate', reaction: 'Hives, swelling' },
  { name: 'Latex', severity: 'Low', reaction: 'Skin irritation' },
];

const DEMO_CONDITIONS = [
  { name: 'Hypertension (Primary)', diagnosedDate: '2023-03-15', status: 'active', notes: 'Managed with Lisinopril 10mg daily' },
  { name: 'Type 2 Diabetes Mellitus', diagnosedDate: '2022-08-20', status: 'active', notes: 'HbA1c at 6.8%, well controlled with Metformin' },
  { name: 'Seasonal Allergic Rhinitis', diagnosedDate: '2021-05-10', status: 'active', notes: 'Flares in spring, managed with antihistamines' },
  { name: 'Appendicitis', diagnosedDate: '2019-11-02', status: 'resolved', notes: 'Appendectomy performed, fully recovered' },
];

const DEMO_IMMUNIZATIONS = [
  { name: 'COVID-19 (Pfizer Booster)', date: '2024-10-15', provider: 'City Health Center' },
  { name: 'Influenza (Seasonal)', date: '2025-09-20', provider: 'MediConnect Clinic' },
  { name: 'Hepatitis B (Dose 3/3)', date: '2023-06-10', provider: 'National Hospital' },
  { name: 'Tdap (Tetanus/Diphtheria)', date: '2022-01-12', provider: 'Community Health' },
];



const MedicalRecords = () => {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const patientId = searchParams.get('patientId');
  const patient = location.state?.patient;

  const [records, setRecords] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [showModal, setShowModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await doctorService.getPatientMedicalRecords(patientId);
      setRecords(res.data);
    } catch (err) {
      console.error('Error loading medical records:', err);
      setError('Failed to load medical records.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const fetchMedicalRecord = useCallback(async () => {
    try {
      console.log('🔍 Fetching medical record for patient:', patientId);
      const res = await medicalRecordService.getMedicalRecord(patientId);
      console.log('📊 API Response:', res);
      console.log('📊 Medical Record Data:', res.data);
      console.log('💓 Current Vitals:', res.data?.currentVitals);
      setMedicalRecord(res.data);
      console.log('✅ Medical record state updated');
    } catch (err) {
      console.error('❌ Error loading comprehensive medical record:', err);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      fetchRecords();
      fetchMedicalRecord();
    } else {
      setError('No patient selected.');
      setLoading(false);
    }
  }, [patientId, fetchRecords, fetchMedicalRecord]);

  const handleOpenModal = (modalType) => {
    setShowModal(modalType);
    setFormData({});
  };

  const handleCloseModal = () => {
    setShowModal(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitVitals = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const vitalsData = {
        bloodPressure: {
          systolic: formData.systolic ? parseInt(formData.systolic) : undefined,
          diastolic: formData.diastolic ? parseInt(formData.diastolic) : undefined,
        },
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        oxygenSaturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : undefined,
        notes: formData.notes,
      };
      
      console.log('📊 Submitting vitals data:', vitalsData);
      console.log('👤 Patient ID:', patientId);
      
      const response = await medicalRecordService.addVitalSigns(patientId, vitalsData);
      console.log('✅ Vitals submission response:', response);
      
      console.log('🔄 Refreshing medical record data...');
      await fetchMedicalRecord();
      console.log('✅ Medical record refresh completed');
      
      handleCloseModal();
      showToast({ type: 'success', title: 'Vitals added', message: 'Vital signs added successfully.' });
    } catch (err) {
      console.error('Error adding vitals:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      showToast({ type: 'error', title: 'Vitals update failed', message: `Failed to add vital signs: ${errorMessage}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAllergy = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Validate required fields
      if (!formData.allergen) {
        showToast({ type: 'error', title: 'Validation error', message: 'Allergen name is required.' });
        setSubmitting(false);
        return;
      }
      
      const allergyData = {
        allergen: formData.allergen,
        severity: formData.severity || 'moderate',
        reaction: formData.reaction,
        diagnosedDate: formData.diagnosedDate,
        status: 'active',
        notes: formData.notes,
      };
      
      console.log('Submitting allergy data:', allergyData);
      console.log('Patient ID:', patientId);
      
      await medicalRecordService.addAllergy(patientId, allergyData);
      await fetchMedicalRecord();
      handleCloseModal();
      showToast({ type: 'success', title: 'Allergy added', message: 'Allergy added successfully.' });
    } catch (err) {
      console.error('Error adding allergy:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      showToast({ type: 'error', title: 'Allergy update failed', message: `Failed to add allergy: ${errorMessage}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCondition = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Validate required fields
      if (!formData.name) {
        showToast({ type: 'error', title: 'Validation error', message: 'Condition name is required.' });
        setSubmitting(false);
        return;
      }
      
      const conditionData = {
        name: formData.name,
        icdCode: formData.icdCode,
        diagnosedDate: formData.diagnosedDate,
        status: formData.status || 'active',
        severity: formData.severity,
        notes: formData.notes,
        treatment: formData.treatment,
      };
      
      console.log('Submitting condition data:', conditionData);
      console.log('Patient ID:', patientId);
      
      await medicalRecordService.addCondition(patientId, conditionData);
      await fetchMedicalRecord();
      handleCloseModal();
      showToast({ type: 'success', title: 'Condition added', message: 'Condition added successfully.' });
    } catch (err) {
      console.error('Error adding condition:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      showToast({ type: 'error', title: 'Condition update failed', message: `Failed to add condition: ${errorMessage}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitImmunization = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Validate required fields
      if (!formData.vaccineName || !formData.administeredDate) {
        showToast({ type: 'error', title: 'Validation error', message: 'Vaccine name and administered date are required.' });
        setSubmitting(false);
        return;
      }
      
      const immunizationData = {
        vaccineName: formData.vaccineName,
        vaccineCode: formData.vaccineCode,
        administeredDate: formData.administeredDate,
        doseNumber: formData.doseNumber,
        route: formData.route,
        site: formData.site,
        manufacturer: formData.manufacturer,
        lotNumber: formData.lotNumber,
        providedBy: formData.providedBy,
        nextDueDate: formData.nextDueDate,
        notes: formData.notes,
      };
      
      console.log('Submitting immunization data:', immunizationData);
      console.log('Patient ID:', patientId);
      
      await medicalRecordService.addImmunization(patientId, immunizationData);
      await fetchMedicalRecord();
      handleCloseModal();
      showToast({ type: 'success', title: 'Immunization added', message: 'Immunization added successfully.' });
    } catch (err) {
      console.error('Error adding immunization:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      showToast({ type: 'error', title: 'Immunization update failed', message: `Failed to add immunization: ${errorMessage}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitLabResult = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Validate required fields
      if (!formData.testName || !formData.orderedDate) {
        showToast({ type: 'error', title: 'Validation error', message: 'Test name and ordered date are required.' });
        setSubmitting(false);
        return;
      }

      const labResultData = {
        testName: formData.testName,
        testCode: formData.testCode,
        category: formData.category,
        orderedDate: formData.orderedDate,
        collectedDate: formData.collectedDate,
        reportedDate: formData.reportedDate || new Date().toISOString(),
        status: formData.status || 'final',
        urgency: formData.urgency,
        interpretation: formData.interpretation,
        notes: formData.notes,
        results: [], // Could be enhanced to add result items
      };

      console.log('Submitting lab result data:', labResultData);
      console.log('Patient ID:', patientId);

      await medicalRecordService.addLabResult(patientId, labResultData);
      await fetchMedicalRecord();
      handleCloseModal();
      showToast({ type: 'success', title: 'Lab result added', message: 'Lab result added successfully.' });
    } catch (err) {
      console.error('Error adding lab result:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      showToast({ type: 'error', title: 'Lab result update failed', message: `Failed to add lab result: ${errorMessage}` });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const sections = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'appointments', label: 'Appointments', icon: Calendar },
    { key: 'diagnostics', label: 'Diagnostics', icon: FlaskConical },
    { key: 'medications', label: 'Medications', icon: Pill },
    { key: 'labResults', label: 'Lab Results', icon: Clipboard },
  ];

  if (loading) {
    return (
      <DoctorLayout>
        <div className={styles.page}>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            Loading medical records...
          </div>
        </div>
      </DoctorLayout>
    );
  }

  if (error || !patientId) {
    return (
      <DoctorLayout>
        <div className={styles.page}>
          <div className={styles.errorBanner}>
            <AlertCircle size={18} /> {error || 'No patient selected.'}
          </div>
        </div>
      </DoctorLayout>
    );
  }

  const appointments = records?.appointments || [];
  const diagnostics = records?.diagnostics || [];
  const medications = records?.medications || [];
  const currentVitals = medicalRecord?.currentVitals || null;
  const allergies = medicalRecord?.allergies || [];
  const conditions = medicalRecord?.conditions || [];
  const immunizations = medicalRecord?.immunizations || [];
  // Get lab results from diagnostic tests that have uploaded reports
  const labResults = diagnostics.filter((test) => isDiagnosticReportReady(test));
  
  // Debug logging for vitals
  console.log('🔍 Debug - Medical Record:', medicalRecord);
  console.log('💓 Debug - Current Vitals:', currentVitals);

  return (
    <DoctorLayout>
      <div className={styles.page}>
        {/* Patient Header */}
        <div className={styles.patientHeader}>
          <div className={styles.avatarWrap}>
            {(patient?.profilePicture || patient?.profileImageUrl) ? (
              <img src={patient.profilePicture || patient.profileImageUrl} alt={patient.name} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <User size={32} />
              </div>
            )}
          </div>
          <div className={styles.patientInfo}>
            <h1 className={styles.patientName}>{patient?.name || 'Patient'}</h1>
            <div className={styles.patientMeta}>
              {patient?.email && <span>{patient.email}</span>}
              {patient?.phone && <><span className={styles.metaDot}>•</span><span>{patient.phone}</span></>}
            </div>
            <div className={styles.patientTags}>
              <span className={styles.tag}><Shield size={12} /> Active Patient</span>
              <span className={styles.tag}><Calendar size={12} /> Last visit: {formatDate(patient?.lastVisit)}</span>
              {patient?.appointmentCount && (
                <span className={styles.tag}><FileText size={12} /> {patient.appointmentCount} visits</span>
              )}
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className={styles.tabBar}>
          {sections.map((s) => (
            <button
              key={s.key}
              className={`${styles.tabBtn} ${activeSection === s.key ? styles.tabActive : ''}`}
              onClick={() => setActiveSection(s.key)}
            >
              <s.icon size={16} />
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className={styles.overviewGrid}>
            {/* Vitals */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Heart size={18} className={styles.cardIcon} />
                <h3>Current Vitals</h3>
                <button className={styles.addButton} onClick={() => handleOpenModal('vitals')}>
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className={styles.vitalsGrid}>
                <div className={styles.vitalItem}>
                  <Activity size={16} className={styles.vitalIcon} />
                  <div>
                    <span className={styles.vitalLabel}>Blood Pressure</span>
                    <span className={styles.vitalValue}>
                      {currentVitals?.bloodPressure?.systolic && currentVitals?.bloodPressure?.diastolic
                        ? `${currentVitals.bloodPressure.systolic}/${currentVitals.bloodPressure.diastolic} mmHg`
                        : DEMO_VITALS.bloodPressure}
                    </span>
                  </div>
                </div>
                <div className={styles.vitalItem}>
                  <Heart size={16} className={styles.vitalIcon} />
                  <div>
                    <span className={styles.vitalLabel}>Heart Rate</span>
                    <span className={styles.vitalValue}>
                      {currentVitals?.heartRate ? `${currentVitals.heartRate} bpm` : DEMO_VITALS.heartRate}
                    </span>
                  </div>
                </div>
                <div className={styles.vitalItem}>
                  <Thermometer size={16} className={styles.vitalIcon} />
                  <div>
                    <span className={styles.vitalLabel}>Temperature</span>
                    <span className={styles.vitalValue}>
                      {currentVitals?.temperature ? `${currentVitals.temperature}°C` : DEMO_VITALS.temperature}
                    </span>
                  </div>
                </div>
                <div className={styles.vitalItem}>
                  <Droplets size={16} className={styles.vitalIcon} />
                  <div>
                    <span className={styles.vitalLabel}>O₂ Saturation</span>
                    <span className={styles.vitalValue}>
                      {currentVitals?.oxygenSaturation ? `${currentVitals.oxygenSaturation}%` : DEMO_VITALS.oxygenSaturation}
                    </span>
                  </div>
                </div>
                <div className={styles.vitalItem}>
                  <Weight size={16} className={styles.vitalIcon} />
                  <div>
                    <span className={styles.vitalLabel}>Weight / BMI</span>
                    <span className={styles.vitalValue}>
                      {currentVitals?.weight 
                        ? `${currentVitals.weight} kg${currentVitals.bmi ? ` / ${currentVitals.bmi}` : ''}`
                        : `${DEMO_VITALS.weight} / ${DEMO_VITALS.bmi}`}
                    </span>
                  </div>
                </div>
                <div className={styles.vitalItem}>
                  <TrendingUp size={16} className={styles.vitalIcon} />
                  <div>
                    <span className={styles.vitalLabel}>Respiratory Rate</span>
                    <span className={styles.vitalValue}>
                      {currentVitals?.respiratoryRate 
                        ? `${currentVitals.respiratoryRate} breaths/min` 
                        : DEMO_VITALS.respiratoryRate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <AlertCircle size={18} className={styles.cardIconRed} />
                <h3>Known Allergies</h3>
                <button className={styles.addButton} onClick={() => handleOpenModal('allergy')}>
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className={styles.allergyList}>
                {allergies.length > 0 ? allergies.filter(a => a.status === 'active').map((allergy) => (
                  <div key={allergy._id} className={styles.allergyItem}>
                    <div className={styles.allergyInfo}>
                      <span className={styles.allergyName}>{allergy.allergen}</span>
                      <span className={styles.allergyReaction}>{allergy.reaction || 'No reaction noted'}</span>
                    </div>
                    <span className={`${styles.severityBadge} ${styles[`severity${allergy.severity || 'moderate'}`]}`}>
                      {allergy.severity || 'moderate'}
                    </span>
                  </div>
                )) : DEMO_ALLERGIES.map((allergy, i) => (
                  <div key={i} className={styles.allergyItem}>
                    <div className={styles.allergyInfo}>
                      <span className={styles.allergyName}>{allergy.name}</span>
                      <span className={styles.allergyReaction}>{allergy.reaction}</span>
                    </div>
                    <span className={`${styles.severityBadge} ${styles[`severity${allergy.severity}`]}`}>
                      {allergy.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Clipboard size={18} className={styles.cardIcon} />
                <h3>Conditions & History</h3>
                <button className={styles.addButton} onClick={() => handleOpenModal('condition')}>
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className={styles.conditionsList}>
                {conditions.length > 0 ? conditions.map((condition) => (
                  <div key={condition._id} className={styles.conditionItem}>
                    <div className={styles.conditionTop}>
                      <span className={styles.conditionName}>{condition.name}</span>
                      <span className={`${styles.conditionStatus} ${styles[condition.status]}`}>
                        {condition.status}
                      </span>
                    </div>
                    <div className={styles.conditionMeta}>
                      <span><Clock size={12} /> Diagnosed: {formatDate(condition.diagnosedDate)}</span>
                    </div>
                    {condition.notes && <p className={styles.conditionNotes}>{condition.notes}</p>}
                  </div>
                )) : DEMO_CONDITIONS.map((condition, i) => (
                  <div key={i} className={styles.conditionItem}>
                    <div className={styles.conditionTop}>
                      <span className={styles.conditionName}>{condition.name}</span>
                      <span className={`${styles.conditionStatus} ${styles[condition.status]}`}>
                        {condition.status}
                      </span>
                    </div>
                    <div className={styles.conditionMeta}>
                      <span><Clock size={12} /> Diagnosed: {formatDate(condition.diagnosedDate)}</span>
                    </div>
                    <p className={styles.conditionNotes}>{condition.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Immunizations */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Shield size={18} className={styles.cardIconGreen} />
                <h3>Immunization History</h3>
                <button className={styles.addButton} onClick={() => handleOpenModal('immunization')}>
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className={styles.immunizationList}>
                {immunizations.length > 0 ? immunizations.map((imm) => (
                  <div key={imm._id} className={styles.immunizationItem}>
                    <div className={styles.immunizationDot} />
                    <div className={styles.immunizationInfo}>
                      <span className={styles.immunizationName}>{imm.vaccineName}</span>
                      <span className={styles.immunizationMeta}>
                        {formatDate(imm.administeredDate)} {imm.providedBy ? `— ${imm.providedBy}` : ''}
                      </span>
                    </div>
                  </div>
                )) : DEMO_IMMUNIZATIONS.map((imm, i) => (
                  <div key={i} className={styles.immunizationItem}>
                    <div className={styles.immunizationDot} />
                    <div className={styles.immunizationInfo}>
                      <span className={styles.immunizationName}>{imm.name}</span>
                      <span className={styles.immunizationMeta}>
                        {formatDate(imm.date)} — {imm.provider}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Section */}
        {activeSection === 'appointments' && (
          <div className={styles.sectionContent}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Calendar size={20} />
                <h2>Appointment History</h2>
                <span className={styles.countBadge}>{appointments.length}</span>
              </div>
              {appointments.length > 0 ? (
                <div className={styles.list}>
                  {appointments.map((apt) => (
                    <div key={apt._id} className={styles.recordCard}>
                      <div className={styles.recordDate}>{formatDate(apt.dateTime)}</div>
                      <div className={styles.recordContent}>
                        <span className={styles.recordLabel}>Reason:</span> {apt.reason || '—'}
                      </div>
                      {apt.notes && (
                        <div className={styles.recordContent}>
                          <span className={styles.recordLabel}>Notes:</span> {apt.notes}
                        </div>
                      )}
                      <span className={`${styles.statusBadge} ${styles[apt.status]}`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptySection}>No appointment history</div>
              )}
            </div>
          </div>
        )}

        {/* Diagnostics Section */}
        {activeSection === 'diagnostics' && (
          <div className={styles.sectionContent}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <FlaskConical size={20} />
                <h2>Diagnostic Tests</h2>
                <span className={styles.countBadge}>{diagnostics.length}</span>
              </div>
              {diagnostics.length > 0 ? (
                <div className={styles.list}>
                  {diagnostics.map((test) => (
                    <div key={test._id} className={styles.recordCard}>
                      <div className={styles.recordDate}>{formatDate(test.createdAt)}</div>
                      <div className={styles.recordContent}>
                        <span className={styles.recordLabel}>Test:</span> {test.testName || '—'}
                      </div>
                      <div className={styles.recordContent}>
                        <span className={styles.recordLabel}>Lab:</span> {test.labId?.name || 'Unassigned'}
                      </div>
                      <span className={`${styles.statusBadge} ${styles[test.status]}`}>
                        {test.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptySection}>No diagnostic tests</div>
              )}
            </div>
          </div>
        )}

        {/* Medications Section */}
        {activeSection === 'medications' && (
          <div className={styles.sectionContent}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Pill size={20} />
                <h2>Medications</h2>
                <span className={styles.countBadge}>{medications.length}</span>
              </div>
              {medications.length > 0 ? (
                <div className={styles.list}>
                  {medications.map((med) => (
                    <div key={med._id} className={styles.recordCard}>
                      <div className={styles.recordDate}>{formatDate(med.createdAt)}</div>
                      <div className={styles.recordContent}>
                        <span className={styles.recordLabel}>Medicine:</span> {med.medicationName || med.medicineName || '—'}
                      </div>
                      <div className={styles.recordContent}>
                        <span className={styles.recordLabel}>Dosage:</span> {med.dosage || '—'}
                      </div>
                      <div className={styles.recordContent}>
                        <span className={styles.recordLabel}>Duration:</span>{' '}
                        {med.duration?.value ? `${med.duration.value} ${med.duration.unit}` : med.duration || '—'}
                      </div>
                      {med.instructions && (
                        <div className={styles.recordContent}>
                          <span className={styles.recordLabel}>Instructions:</span> {med.instructions}
                        </div>
                      )}
                      <span className={`${styles.statusBadge} ${styles[med.status]}`}>
                        {med.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptySection}>No medications prescribed</div>
              )}
            </div>
          </div>
        )}

        {/* Lab Results Section */}
        {activeSection === 'labResults' && (
          <div className={styles.sectionContent}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Clipboard size={20} />
                <h2>Lab Results</h2>
                <span className={styles.countBadge}>{labResults.length}</span>
              </div>
              <div className={styles.labResultsList}>
                {labResults.length > 0 ? (
                  labResults.map((test) => (
                    <div key={test._id} className={styles.labResultCard}>
                      <div className={styles.labResultHeader}>
                        <div className={styles.labTestInfo}>
                          <h4>{test.testName}</h4>
                          <p className={styles.labTestType}>{test.testType}</p>
                        </div>
                        <div className={styles.labResultMeta}>
                          <span><Calendar size={13} /> {formatDate(test.report?.uploadedAt || test.updatedAt)}</span>
                          <span className={`${styles.statusBadge} ${styles.completed}`}>
                            {normalizeDiagnosticStatus(test.status)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Lab Information */}
                      <div className={styles.labInfo}>
                        <div className={styles.labDetail}>
                          <span className={styles.label}>Lab:</span>
                          <span>{test.labId?.name || 'Unknown Lab'}</span>
                        </div>
                        <div className={styles.labDetail}>
                          <span className={styles.label}>Test Date:</span>
                          <span>{formatDate(test.createdAt)}</span>
                        </div>
                        {test.urgency && (
                          <div className={styles.labDetail}>
                            <span className={styles.label}>Urgency:</span>
                            <span className={`${styles.urgencyBadge} ${styles[test.urgency]}`}>
                              {test.urgency}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Report Information */}
                      {test.report && (
                        <div className={styles.reportSection}>
                          <div className={styles.reportInfo}>
                            <FileText size={16} className={styles.reportIcon} />
                            <div className={styles.reportDetails}>
                              <span className={styles.reportFilename}>
                                {test.report.filename || `${test.testName}_report.pdf`}
                              </span>
                              <span className={styles.reportMeta}>
                                Uploaded: {formatDate(test.report.uploadedAt)}
                                {test.report.fileSize && ` • ${(test.report.fileSize / (1024 * 1024)).toFixed(2)} MB`}
                              </span>
                            </div>
                          </div>
                          <button 
                            className={styles.viewReportBtn}
                            onClick={() => window.open(resolveAssetUrl(test.report.url), '_blank')}
                          >
                            View Report
                          </button>
                        </div>
                      )}

                      {/* Findings and Recommendations */}
                      {(test.findings || test.recommendations) && (
                        <div className={styles.clinicalInfo}>
                          {test.findings && (
                            <div className={styles.clinicalSection}>
                              <h5>Findings:</h5>
                              <p>{test.findings}</p>
                            </div>
                          )}
                          {test.recommendations && (
                            <div className={styles.clinicalSection}>
                              <h5>Recommendations:</h5>
                              <p>{test.recommendations}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Instructions if available */}
                      {test.instructions && (
                        <div className={styles.instructionsSection}>
                          <span className={styles.label}>Instructions:</span>
                          <p>{test.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <FileText size={48} className={styles.emptyIcon} />
                    <h3>No Lab Results</h3>
                    <p>Lab reports will appear here once tests are completed and uploaded by the lab.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Forms */}
        {showModal && (
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>
                  {showModal === 'vitals' && 'Add Vital Signs'}
                  {showModal === 'allergy' && 'Add Allergy'}
                  {showModal === 'condition' && 'Add Medical Condition'}
                  {showModal === 'immunization' && 'Add Immunization'}
                  {showModal === 'labResult' && 'Add Lab Result'}
                </h2>
                <button className={styles.closeButton} onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              {/* Vitals Form */}
              {showModal === 'vitals' && (
                <form onSubmit={handleSubmitVitals} className={styles.modalForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Systolic BP (mmHg)</label>
                      <input type="number" name="systolic" value={formData.systolic || ''} onChange={handleInputChange} placeholder="120" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Diastolic BP (mmHg)</label>
                      <input type="number" name="diastolic" value={formData.diastolic || ''} onChange={handleInputChange} placeholder="80" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Heart Rate (bpm)</label>
                      <input type="number" name="heartRate" value={formData.heartRate || ''} onChange={handleInputChange} placeholder="72" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Temperature (°C)</label>
                      <input type="number" step="0.1" name="temperature" value={formData.temperature || ''} onChange={handleInputChange} placeholder="37.0" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Oxygen Saturation (%)</label>
                      <input type="number" name="oxygenSaturation" value={formData.oxygenSaturation || ''} onChange={handleInputChange} placeholder="98" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Respiratory Rate (breaths/min)</label>
                      <input type="number" name="respiratoryRate" value={formData.respiratoryRate || ''} onChange={handleInputChange} placeholder="16" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Weight (kg)</label>
                      <input type="number" step="0.1" name="weight" value={formData.weight || ''} onChange={handleInputChange} placeholder="70" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Height (cm)</label>
                      <input type="number" name="height" value={formData.height || ''} onChange={handleInputChange} placeholder="175" />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Notes</label>
                    <textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} rows="3" placeholder="Additional notes..." />
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.btnCancel} onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                      {submitting ? 'Saving...' : 'Save Vitals'}
                    </button>
                  </div>
                </form>
              )}

              {/* Allergy Form */}
              {showModal === 'allergy' && (
                <form onSubmit={handleSubmitAllergy} className={styles.modalForm}>
                  <div className={styles.formGroup}>
                    <label>Allergen *</label>
                    <input type="text" name="allergen" value={formData.allergen || ''} onChange={handleInputChange} required placeholder="e.g., Penicillin, Peanuts" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Severity</label>
                    <select name="severity" value={formData.severity || 'moderate'} onChange={handleInputChange}>
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Reaction</label>
                    <input type="text" name="reaction" value={formData.reaction || ''} onChange={handleInputChange} placeholder="e.g., Hives, Anaphylaxis" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Diagnosed Date</label>
                    <input type="date" name="diagnosedDate" value={formData.diagnosedDate || ''} onChange={handleInputChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Notes</label>
                    <textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} rows="3" placeholder="Additional notes..." />
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.btnCancel} onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                      {submitting ? 'Saving...' : 'Save Allergy'}
                    </button>
                  </div>
                </form>
              )}

              {/* Condition Form */}
              {showModal === 'condition' && (
                <form onSubmit={handleSubmitCondition} className={styles.modalForm}>
                  <div className={styles.formGroup}>
                    <label>Condition Name *</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required placeholder="e.g., Hypertension" />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>ICD-10 Code</label>
                      <input type="text" name="icdCode" value={formData.icdCode || ''} onChange={handleInputChange} placeholder="e.g., I10" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Diagnosed Date</label>
                      <input type="date" name="diagnosedDate" value={formData.diagnosedDate || ''} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Status</label>
                      <select name="status" value={formData.status || 'active'} onChange={handleInputChange}>
                        <option value="active">Active</option>
                        <option value="resolved">Resolved</option>
                        <option value="chronic">Chronic</option>
                        <option value="remission">Remission</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Severity</label>
                      <select name="severity" value={formData.severity || ''} onChange={handleInputChange}>
                        <option value="">Select severity</option>
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Treatment</label>
                    <input type="text" name="treatment" value={formData.treatment || ''} onChange={handleInputChange} placeholder="Current treatment plan" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Notes</label>
                    <textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} rows="3" placeholder="Additional notes..." />
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.btnCancel} onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                      {submitting ? 'Saving...' : 'Save Condition'}
                    </button>
                  </div>
                </form>
              )}

              {/* Immunization Form */}
              {showModal === 'immunization' && (
                <form onSubmit={handleSubmitImmunization} className={styles.modalForm}>
                  <div className={styles.formGroup}>
                    <label>Vaccine Name *</label>
                    <input type="text" name="vaccineName" value={formData.vaccineName || ''} onChange={handleInputChange} required placeholder="e.g., COVID-19 Pfizer" />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Vaccine Code (CVX)</label>
                      <input type="text" name="vaccineCode" value={formData.vaccineCode || ''} onChange={handleInputChange} placeholder="e.g., 208" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Administered Date *</label>
                      <input type="date" name="administeredDate" value={formData.administeredDate || ''} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Dose Number</label>
                      <input type="text" name="doseNumber" value={formData.doseNumber || ''} onChange={handleInputChange} placeholder="e.g., 1/3, Booster" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Route</label>
                      <input type="text" name="route" value={formData.route || ''} onChange={handleInputChange} placeholder="e.g., Intramuscular" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Site</label>
                      <input type="text" name="site" value={formData.site || ''} onChange={handleInputChange} placeholder="e.g., Left arm" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Manufacturer</label>
                      <input type="text" name="manufacturer" value={formData.manufacturer || ''} onChange={handleInputChange} placeholder="e.g., Pfizer" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Lot Number</label>
                      <input type="text" name="lotNumber" value={formData.lotNumber || ''} onChange={handleInputChange} placeholder="Vaccine lot number" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Provider</label>
                      <input type="text" name="providedBy" value={formData.providedBy || ''} onChange={handleInputChange} placeholder="e.g., City Health Center" />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Next Due Date</label>
                    <input type="date" name="nextDueDate" value={formData.nextDueDate || ''} onChange={handleInputChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Notes</label>
                    <textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} rows="2" placeholder="Additional notes..." />
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.btnCancel} onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                      {submitting ? 'Saving...' : 'Save Immunization'}
                    </button>
                  </div>
                </form>
              )}

              {/* Lab Result Form */}
              {showModal === 'labResult' && (
                <form onSubmit={handleSubmitLabResult} className={styles.modalForm}>
                  <div className={styles.formGroup}>
                    <label>Test Name *</label>
                    <input type="text" name="testName" value={formData.testName || ''} onChange={handleInputChange} required placeholder="e.g., Complete Blood Count" />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Test Code (LOINC)</label>
                      <input type="text" name="testCode" value={formData.testCode || ''} onChange={handleInputChange} placeholder="e.g., 58410-2" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Category</label>
                      <input type="text" name="category" value={formData.category || ''} onChange={handleInputChange} placeholder="e.g., Hematology" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Ordered Date</label>
                      <input type="date" name="orderedDate" value={formData.orderedDate || ''} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Collected Date</label>
                      <input type="date" name="collectedDate" value={formData.collectedDate || ''} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Status</label>
                      <select name="status" value={formData.status || 'final'} onChange={handleInputChange}>
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                        <option value="final">Final</option>
                        <option value="corrected">Corrected</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Urgency</label>
                      <select name="urgency" value={formData.urgency || ''} onChange={handleInputChange}>
                        <option value="">Select urgency</option>
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent</option>
                        <option value="stat">STAT</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Interpretation</label>
                    <textarea name="interpretation" value={formData.interpretation || ''} onChange={handleInputChange} rows="2" placeholder="Clinical interpretation of results" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Notes</label>
                    <textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} rows="2" placeholder="Additional notes..." />
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.btnCancel} onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                      {submitting ? 'Saving...' : 'Save Lab Result'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default MedicalRecords;
