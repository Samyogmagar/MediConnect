import { useState, useEffect, createElement } from 'react';
import { FileText, Pill, FlaskConical, ChevronDown, ChevronUp, Download, Eye, Calendar, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import medicalRecordService from '../../services/medicalRecordService';
import { resolveAssetUrl } from '../../utils/assetUrl.util';
import styles from './MedicalRecords.module.css';

const TABS = [
  { key: 'diagnostics', label: 'Lab Reports', icon: FlaskConical },
  { key: 'medications', label: 'Prescriptions', icon: Pill },
];

const statusColors = {
  pending: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'in-progress': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  sample_collected: { bg: '#eef2ff', color: '#1d4ed8', border: '#c7d2fe' },
  processing: { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  report_uploaded: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  completed: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  active: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  inactive: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const MedicalRecords = () => {
  const [activeTab, setActiveTab] = useState('diagnostics');
  const [diagnostics, setDiagnostics] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchRecords();
    
    // Auto-refresh every 30 seconds to show new prescriptions/lab results
    const interval = setInterval(fetchRecords, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const [diagRes, medRes] = await Promise.all([
        medicalRecordService.getDiagnosticTests(),
        medicalRecordService.getMedications(),
      ]);
      const diagnosticTests = diagRes.data?.diagnosticTests || diagRes.data?.tests || [];
      const medications = medRes.data?.medications || [];
      
      // Sort by creation date (newest first)
      setDiagnostics(diagnosticTests.sort((a, b) => new Date(b.createdAt || b.assignedAt) - new Date(a.createdAt || a.assignedAt)));
      setMedications(medications.sort((a, b) => new Date(b.prescribedAt || b.createdAt) - new Date(a.prescribedAt || a.createdAt)));
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to load medical records.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStatusBadge = (status) => {
    const s = statusColors[status] || statusColors.inactive;
    return (
      <span
        className={styles.statusBadge}
        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
      >
        {status}
      </span>
    );
  };

  const renderDiagnostics = () => {
    if (diagnostics.length === 0)
      return (
        <div className={styles.empty}>
          <FlaskConical size={36} className={styles.emptyIcon} />
          <h3>No lab reports</h3>
          <p>Your diagnostic test results will appear here.</p>
        </div>
      );

    return (
      <div className={styles.recordList}>
        {diagnostics.map((test) => (
          <div key={test._id} className={styles.recordCard}>
            <div className={styles.recordRow}>
              <div className={styles.recordInfo}>
                <FlaskConical size={18} className={styles.recordIcon} />
                <div className={styles.recordDetails}>
                  <h4 className={styles.recordName}>{test.testName || test.testType || 'Diagnostic Test'}</h4>
                  <p className={styles.recordMeta}>
                    {test.doctorId?.name && `Prescribed by Dr. ${test.doctorId.name}`}
                    {test.labId?.name && ` • Lab: ${test.labId.name}`}
                  </p>
                  <div className={styles.testMetaInfo}>
                    <span className={styles.testDate}>
                      <Calendar size={14} />
                      Test Date: {formatDate(test.createdAt)}
                    </span>
                    {test.urgency && (
                      <span className={`${styles.urgencyBadge} ${styles[test.urgency]}`}>
                        {test.urgency}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.recordActions}>
                {renderStatusBadge(test.status)}
                {/* Show View Report button if report is available */}
                {(test.status === 'completed' || test.status === 'report_uploaded') && test.report && test.report.url && (
                  <button
                    className={styles.viewReportBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(resolveAssetUrl(test.report.url), '_blank');
                    }}
                  >
                    <Eye size={14} />
                    View Report
                  </button>
                )}
                <button 
                  className={styles.expandBtn}
                  onClick={() => toggleExpand(test._id)}
                >
                  {expandedId === test._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === test._id && (
              <div className={styles.expandedContent}>
                <div className={styles.expandedGrid}>
                  {/* Test Information */}
                  <div className={styles.expandedSection}>
                    <h5>Test Information</h5>
                    {test.description && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Description:</span>
                        <span>{test.description}</span>
                      </div>
                    )}
                    {test.testType && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Test Type:</span>
                        <span>{test.testType}</span>
                      </div>
                    )}
                    {test.instructions && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Instructions:</span>
                        <span>{test.instructions}</span>
                      </div>
                    )}
                    {test.estimatedCompletionDate && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Estimated Completion:</span>
                        <span>{formatDate(test.estimatedCompletionDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Report Information */}
                  {test.report && test.report.url && (
                    <div className={styles.expandedSection}>
                      <h5>Report Details</h5>
                      <div className={styles.reportInfo}>
                        <div className={styles.reportIcon}>
                          <FileText size={24} />
                        </div>
                        <div className={styles.reportDetails}>
                          <span className={styles.reportFilename}>
                            {test.report.filename || `${test.testName}_report.pdf`}
                          </span>
                          <span className={styles.reportMeta}>
                            Uploaded: {formatDate(test.report.uploadedAt)}
                            {test.report.fileSize && ` • ${(test.report.fileSize / (1024 * 1024)).toFixed(2)} MB`}
                          </span>
                        </div>
                        <button
                          className={styles.downloadBtn}
                          onClick={() => window.open(resolveAssetUrl(test.report.url), '_blank')}
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Clinical Results */}
                  {(test.findings || test.recommendations) && (
                    <div className={styles.expandedSection}>
                      <h5>Clinical Information</h5>
                      {test.findings && (
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Findings:</span>
                          <span>{test.findings}</span>
                        </div>
                      )}
                      {test.recommendations && (
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Recommendations:</span>
                          <span>{test.recommendations}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Information */}
                <div className={styles.statusInfo}>
                  <div className={styles.statusTimeline}>
                    {test.statusHistory && test.statusHistory.length > 0 ? (
                      test.statusHistory.map((status, index) => (
                        <div key={index} className={styles.statusStep}>
                          <div className={`${styles.statusDot} ${styles[status.status]}`}></div>
                          <div className={styles.statusText}>
                            <span className={styles.statusName}>{status.status}</span>
                            <span className={styles.statusDate}>{formatDate(status.timestamp)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.statusStep}>
                        <div className={`${styles.statusDot} ${styles[test.status]}`}></div>
                        <div className={styles.statusText}>
                          <span className={styles.statusName}>{test.status}</span>
                          <span className={styles.statusDate}>{formatDate(test.updatedAt || test.createdAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderMedications = () => {
    if (medications.length === 0)
      return (
        <div className={styles.empty}>
          <Pill size={36} className={styles.emptyIcon} />
          <h3>No prescriptions</h3>
          <p>Your medication prescriptions will appear here.</p>
        </div>
      );

    return (
      <div className={styles.recordList}>
        {medications.map((med) => (
          <div key={med._id} className={styles.recordCard}>
            <div className={styles.recordRow} onClick={() => toggleExpand(med._id)}>
              <div className={styles.recordInfo}>
                <Pill size={18} className={styles.recordIcon} />
                <div>
                  <h4 className={styles.recordName}>{med.name}</h4>
                  <p className={styles.recordMeta}>
                    {med.dosage && `${med.dosage}`}
                    {med.frequency && ` · ${med.frequency}`}
                    {med.prescribedBy?.name && ` · Dr. ${med.prescribedBy.name}`}
                  </p>
                </div>
              </div>
              <div className={styles.recordActions}>
                {renderStatusBadge(med.status)}
                {expandedId === med._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
            {expandedId === med._id && (
              <div className={styles.expandedContent}>
                {med.instructions && (
                  <p><strong>Instructions:</strong> {med.instructions}</p>
                )}
                {med.startDate && (
                  <p><strong>Start Date:</strong> {formatDate(med.startDate)}</p>
                )}
                {med.endDate && (
                  <p><strong>End Date:</strong> {formatDate(med.endDate)}</p>
                )}
                {med.sideEffects && (
                  <p><strong>Side Effects:</strong> {med.sideEffects}</p>
                )}
                {med.notes && (
                  <p><strong>Notes:</strong> {med.notes}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const diagnosticsCompleted = diagnostics.filter((t) => t.status === 'completed' || t.status === 'report_uploaded').length;
  const diagnosticsPending = diagnostics.filter(
    (t) => ['pending', 'assigned', 'sample_collected', 'processing', 'in_progress'].includes(t.status)
  ).length;
  const activeMeds = medications.filter((m) => m.status === 'active').length;

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Medical Records</h1>
        <p className={styles.pageSubtitle}>View your lab reports and prescriptions</p>

        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Lab Reports</span>
            <span className={styles.summaryValue}>{diagnostics.length}</span>
            <span className={styles.summaryMeta}>{diagnosticsCompleted} completed</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Pending Tests</span>
            <span className={styles.summaryValue}>{diagnosticsPending}</span>
            <span className={styles.summaryMeta}>in progress</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Active Medications</span>
            <span className={styles.summaryValue}>{activeMeds}</span>
            <span className={styles.summaryMeta}>{medications.length} total</span>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {createElement(Icon, { size: 16 })}
              {label}
            </button>
          ))}
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {loading ? (
          <p className={styles.loadingText}>Loading records...</p>
        ) : activeTab === 'diagnostics' ? (
          renderDiagnostics()
        ) : (
          renderMedications()
        )}
      </div>
    </DashboardLayout>
  );
};

export default MedicalRecords;
