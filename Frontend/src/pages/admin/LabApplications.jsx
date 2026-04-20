import { useMemo, useState, useEffect } from 'react';
import { Eye, UserCheck, UserX, FlaskConical } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import FilterToolbar from '../../components/admin/FilterToolbar';
import DataTable from '../../components/admin/DataTable';
import { useToast } from '../../components/common/feedback/ToastProvider';
import { useModal } from '../../components/common/feedback/ModalProvider';
import adminService from '../../services/adminService';
import styles from './LabApplications.module.css';

const LabApplications = () => {
  const { showToast } = useToast();
  const { showConfirm } = useModal();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedLab, setSelectedLab] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const usersRes = await adminService.getUsers();
      const allUsers = usersRes.data?.users || [];
      // Filter only lab users
      const labs = allUsers.filter(u => u.role === 'lab');
      setApplications(labs);
      const pending = labs.filter(l => !l.isVerified).length;
      setPendingCount(pending);
    } catch (err) {
      console.error('Error loading lab applications:', err);
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((lab) => {
      const status = lab.isVerified ? 'verified' : 'pending';
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const keyword = search.trim().toLowerCase();
      const matchesSearch = !keyword || [
        lab.name,
        lab.email,
        lab.professionalDetails?.labName,
        lab.professionalDetails?.labLicenseNumber,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));
      return matchesStatus && matchesSearch;
    });
  }, [applications, search, statusFilter]);

  const handleVerify = async (userId) => {
    const { confirmed } = await showConfirm({
      title: 'Verify lab account?',
      message: 'This lab account will gain full system access after verification.',
      confirmText: 'Verify',
      cancelText: 'Cancel',
      confirmVariant: 'success',
    });
    if (!confirmed) return;

    setActionLoading(userId);
    try {
      await adminService.verifyUser(userId);
      setApplications((prev) =>
        prev.map((a) => (a._id === userId ? { ...a, isVerified: true } : a))
      );
      setPendingCount((c) => Math.max(0, c - 1));
      showToast({
        type: 'success',
        title: 'Lab verified',
        message: 'Lab account verified successfully.',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Verification failed',
        message: err.response?.data?.message || 'Failed to verify lab.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnverify = async (userId) => {
    const { confirmed } = await showConfirm({
      title: 'Unverify lab account?',
      message: 'This lab account will lose system access until re-verified.',
      confirmText: 'Unverify',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
    });
    if (!confirmed) return;

    setActionLoading(userId);
    try {
      await adminService.unverifyUser(userId);
      setApplications((prev) =>
        prev.map((a) => (a._id === userId ? { ...a, isVerified: false } : a))
      );
      setPendingCount((c) => c + 1);
      showToast({
        type: 'success',
        title: 'Lab unverified',
        message: 'Lab account unverified successfully.',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Unverify failed',
        message: err.response?.data?.message || 'Failed to unverify lab.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const columns = [
    {
      key: 'labName',
      label: 'Lab Name',
      render: (row) => (
        <div>
          <span className={styles.nameCell}>
            {row.professionalDetails?.labName || row.name || 'Unknown'}
          </span>
          {row.address?.city && (
            <span className={styles.subText}>{row.address.city}{row.address.province ? `, ${row.address.province}` : ''}</span>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => row.email || '—',
    },
    {
      key: 'regNo',
      label: 'Registration No.',
      render: (row) => row.professionalDetails?.labLicenseNumber || '—',
    },
    {
      key: 'registered',
      label: 'Registered',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={row.isVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
          {row.isVerified ? '✓ Verified' : '⏳ Pending'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className={styles.actions}>
          <button
            className={styles.viewBtn}
            title="View"
            onClick={() => setSelectedLab(row)}
          >
            <Eye size={16} /> View
          </button>
          {!row.isVerified ? (
            <button
              className={styles.approveBtn}
              title="Verify"
              onClick={() => handleVerify(row._id)}
              disabled={actionLoading === row._id}
            >
              <UserCheck size={16} /> Verify
            </button>
          ) : (
            <button
              className={styles.rejectBtn}
              title="Unverify"
              onClick={() => handleUnverify(row._id)}
              disabled={actionLoading === row._id}
            >
              <UserX size={16} /> Unverify
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Lab Verification Queue</h1>
            <p className={styles.subtitle}>Review verification requests for self-registered lab staff.</p>
          </div>
          {pendingCount > 0 && (
            <span className={styles.pendingBadge}>{pendingCount} pending</span>
          )}
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.tableSection}>
          <h2 className={styles.sectionTitle}>All Lab Registrations</h2>
          <FilterToolbar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search lab staff, email, license"
            filters={[
              {
                key: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'pending', label: 'Pending' },
                  { value: 'verified', label: 'Verified' },
                  { value: 'all', label: 'All' },
                ],
              },
            ]}
          />
          <DataTable
            columns={columns}
            rows={filteredApplications}
            loading={loading}
            emptyMessage="No lab applications found"
          />
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLab && (
        <div className={styles.modalOverlay} onClick={() => setSelectedLab(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedLab(null)}>
              ×
            </button>
            <div className={styles.modalHeader}>
              <div className={styles.modalPhotoPlaceholder}>
                <FlaskConical size={32} />
              </div>
              <div>
                <h2 className={styles.modalTitle}>
                  {selectedLab.professionalDetails?.labName || selectedLab.name}
                </h2>
                <p className={styles.modalEmail}>{selectedLab.email}</p>
              </div>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Contact Person:</span>
                <span className={styles.detailValue}>{selectedLab.name || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>License Number:</span>
                <span className={styles.detailValue}>{selectedLab.professionalDetails?.labLicenseNumber || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Accreditation:</span>
                <span className={styles.detailValue}>{selectedLab.professionalDetails?.accreditation || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Services:</span>
                <span className={styles.detailValue}>
                  {selectedLab.professionalDetails?.servicesOffered?.join(', ') || '—'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Phone:</span>
                <span className={styles.detailValue}>{selectedLab.phone || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Address:</span>
                <span className={styles.detailValue}>
                  {selectedLab.address?.city ? `${selectedLab.address.city}${selectedLab.address.province ? `, ${selectedLab.address.province}` : ''}` : '—'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Registered:</span>
                <span className={styles.detailValue}>{formatDate(selectedLab.createdAt)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status:</span>
                <span className={selectedLab.isVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
                  {selectedLab.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                </span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              {!selectedLab.isVerified ? (
                <button
                  className={styles.modalVerifyBtn}
                  onClick={() => {
                    handleVerify(selectedLab._id);
                    setSelectedLab(null);
                  }}
                >
                  <UserCheck size={18} /> Verify Account
                </button>
              ) : (
                <button
                  className={styles.modalUnverifyBtn}
                  onClick={() => {
                    handleUnverify(selectedLab._id);
                    setSelectedLab(null);
                  }}
                >
                  <UserX size={18} /> Unverify Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default LabApplications;
