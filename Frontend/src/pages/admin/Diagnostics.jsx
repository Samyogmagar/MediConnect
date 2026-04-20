import { useMemo, useState, useEffect } from 'react';
import { Eye, FlaskConical, FileText, Clock, CheckCircle2, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import FilterToolbar from '../../components/admin/FilterToolbar';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import medicalRecordService from '../../services/medicalRecordService';
import { resolveAssetUrl } from '../../utils/assetUrl.util';
import styles from './Diagnostics.module.css';

const Diagnostics = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await medicalRecordService.getDiagnosticTests();
      setTests(res.data?.tests || res.data?.diagnosticTests || []);
    } catch (err) {
      console.error('Error loading diagnostic tests:', err);
      setError('Failed to load diagnostic tests.');
    } finally {
      setLoading(false);
    }
  };

  const counts = tests.reduce(
    (acc, t) => {
      acc.total++;
      const s = (t.status || '').toLowerCase().replace(/\s/g, '_');
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    { total: 0, assigned: 0, sample_collected: 0, processing: 0, report_uploaded: 0, cancelled: 0 }
  );

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
      const keyword = search.trim().toLowerCase();
      const matchesSearch = !keyword || [
        test.patientId?.name,
        test.patientId?.email,
        test.testName,
        test.doctorId?.name,
        test.labId?.name,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));
      return matchesStatus && matchesSearch;
    });
  }, [tests, search, statusFilter]);

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
      key: 'testName',
      label: 'Test Name',
      render: (row) => <span className={styles.primaryText}>{row.testName || '—'}</span>,
    },
    {
      key: 'lab',
      label: 'Assigned Lab',
      render: (row) => (
        <div>
          <span className={styles.primaryText}>{row.labId?.name || 'Unassigned'}</span>
          <span className={styles.subText}>{row.labId?.address || ''}</span>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => <span className={styles.dateText}>{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'report',
      label: 'Report',
      render: (row) => {
        const isComplete = (row.status || '').toLowerCase() === 'report_uploaded';
        if (isComplete && row.report?.url) {
          return (
            <a href={resolveAssetUrl(row.report.url)} target="_blank" rel="noreferrer" className={styles.reportLink}>
              <FileText size={14} /> View Report
            </a>
          );
        }
        return <span className={styles.noReport}>Not available</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button className={styles.viewBtn} onClick={() => setSelectedTest(row)}>
          <Eye size={16} /> Details
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Diagnostics & Reports</h1>
          <p className={styles.subtitle}>Operational view of lab requests, progress, and report delivery</p>
        </div>

        <div className={styles.statsGrid}>
          <StatCard
            icon={<FlaskConical size={20} />}
            label="Total Tests"
            value={counts.total}
            color="blue"
          />
          <StatCard
            icon={<Clock size={20} />}
            label="Assigned"
            value={counts.assigned}
            color="yellow"
          />
          <StatCard
            icon={<FlaskConical size={20} />}
            label="Processing"
            value={counts.processing}
            color="purple"
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Reports Uploaded"
            value={counts.report_uploaded}
            color="green"
          />
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.tableSection}>
          <h2 className={styles.sectionTitle}>All Diagnostic Tests</h2>
          <FilterToolbar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search patient, test, doctor, or lab"
            filters={[
              {
                key: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'assigned', label: 'Assigned' },
                  { value: 'sample_collected', label: 'Sample Collected' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'report_uploaded', label: 'Report Uploaded' },
                  { value: 'cancelled', label: 'Cancelled' },
                ],
              },
            ]}
          />
          <DataTable
            columns={columns}
            rows={filteredTests}
            loading={loading}
            emptyMessage="No diagnostic tests found"
          />
        </div>

        {/* Test Detail Modal */}
        {selectedTest && (
          <div className={styles.modalOverlay} onClick={() => setSelectedTest(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Diagnostic Test Details</h2>
                <button className={styles.closeBtn} onClick={() => setSelectedTest(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Test Name</span>
                  <span className={styles.detailValue}>{selectedTest.testName || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Patient</span>
                  <span className={styles.detailValue}>{selectedTest.patientId?.name || 'Unknown'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Patient Email</span>
                  <span className={styles.detailValue}>{selectedTest.patientId?.email || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Assigned Lab</span>
                  <span className={styles.detailValue}>{selectedTest.labId?.name || 'Unassigned'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Prescribed By</span>
                  <span className={styles.detailValue}>Dr. {selectedTest.doctorId?.name || 'Unknown'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={styles.detailValue}>{selectedTest.status || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Date Ordered</span>
                  <span className={styles.detailValue}>{formatDate(selectedTest.createdAt)}</span>
                </div>
                {selectedTest.instructions && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Instructions</span>
                    <span className={styles.detailValue}>{selectedTest.instructions}</span>
                  </div>
                )}
                {selectedTest.report?.findings && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Findings</span>
                    <span className={styles.detailValue}>{selectedTest.report.findings}</span>
                  </div>
                )}
                {selectedTest.report?.url && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Report</span>
                    <span className={styles.detailValue}>
                      <a href={resolveAssetUrl(selectedTest.report.url)} target="_blank" rel="noreferrer" className={styles.reportLink}>
                        <FileText size={14} /> View Report
                      </a>
                    </span>
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

export default Diagnostics;
