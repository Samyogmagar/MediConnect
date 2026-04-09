import { useMemo, useState, useEffect } from 'react';
import { Eye, UserCheck, UserX, User } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import FilterToolbar from '../../components/admin/FilterToolbar';
import DataTable from '../../components/admin/DataTable';
import adminService from '../../services/adminService';
import styles from './DoctorApplications.module.css';

const DoctorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
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
      // Filter only doctors
      const doctors = allUsers.filter(u => u.role === 'doctor');
      setApplications(doctors);
      const pending = doctors.filter(d => !d.isVerified).length;
      setPendingCount(pending);
    } catch (err) {
      console.error('Error loading doctor applications:', err);
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((doctor) => {
      const status = doctor.isVerified ? 'verified' : 'pending';
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const keyword = search.trim().toLowerCase();
      const matchesSearch = !keyword || [doctor.name, doctor.email, doctor.professionalDetails?.specialization]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));
      return matchesStatus && matchesSearch;
    });
  }, [applications, search, statusFilter]);

  const handleVerify = async (userId) => {
    if (!window.confirm('Verify this doctor account?')) return;
    setActionLoading(userId);
    try {
      await adminService.verifyUser(userId);
      setApplications((prev) =>
        prev.map((a) => (a._id === userId ? { ...a, isVerified: true } : a))
      );
      setPendingCount((c) => Math.max(0, c - 1));
      alert('Doctor verified successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify doctor.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnverify = async (userId) => {
    if (!window.confirm('Unverify this doctor account? They will not be able to access the system.')) return;
    setActionLoading(userId);
    try {
      // We need to add an unverify endpoint
      await adminService.unverifyUser(userId);
      setApplications((prev) =>
        prev.map((a) => (a._id === userId ? { ...a, isVerified: false } : a))
      );
      setPendingCount((c) => c + 1);
      alert('Doctor unverified successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unverify doctor.');
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
      key: 'photo',
      label: 'Photo',
      render: (row) => (
        <div className={styles.photoCell}>
          {row.profilePicture ? (
            <img src={row.profilePicture} alt={row.name} className={styles.profilePhoto} />
          ) : (
            <div className={styles.profilePhotoPlaceholder}>
              <User size={20} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'doctor',
      label: 'Doctor',
      render: (row) => (
        <div>
          <span className={styles.nameCell}>Dr. {row.name || 'Unknown'}</span>
          <span className={styles.emailText}>{row.email}</span>
        </div>
      ),
    },
    {
      key: 'specialization',
      label: 'Specialization',
      render: (row) => row.professionalDetails?.specialization || '—',
    },
    {
      key: 'license',
      label: 'License Number',
      render: (row) => row.professionalDetails?.licenseNumber || '—',
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
            title="View Details"
            onClick={() => setSelectedApplication(row)}
          >
            <Eye size={16} /> View
          </button>
          {!row.isVerified ? (
            <button
              className={styles.verifyBtn}
              title="Verify"
              onClick={() => handleVerify(row._id)}
              disabled={actionLoading === row._id}
            >
              <UserCheck size={16} /> Verify
            </button>
          ) : (
            <button
              className={styles.unverifyBtn}
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
            <h1 className={styles.title}>Doctor Verification Queue</h1>
            <p className={styles.subtitle}>Review verification requests for self-registered doctors.</p>
          </div>
          {pendingCount > 0 && (
            <span className={styles.pendingBadge}>{pendingCount} pending</span>
          )}
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.tableSection}>
          <h2 className={styles.sectionTitle}>All Doctor Registrations</h2>
          <FilterToolbar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search doctor, email, specialization"
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
            emptyMessage="No doctor applications found"
          />
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApplication && (
        <div className={styles.modalOverlay} onClick={() => setSelectedApplication(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedApplication(null)}>
              ×
            </button>
            <div className={styles.modalHeader}>
              {selectedApplication.profilePicture ? (
                <img src={selectedApplication.profilePicture} alt={selectedApplication.name} className={styles.modalPhoto} />
              ) : (
                <div className={styles.modalPhotoPlaceholder}>
                  <User size={48} />
                </div>
              )}
              <div>
                <h2 className={styles.modalTitle}>Dr. {selectedApplication.name}</h2>
                <p className={styles.modalEmail}>{selectedApplication.email}</p>
              </div>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Specialization:</span>
                <span className={styles.detailValue}>{selectedApplication.professionalDetails?.specialization || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>License Number:</span>
                <span className={styles.detailValue}>{selectedApplication.professionalDetails?.licenseNumber || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Hospital:</span>
                <span className={styles.detailValue}>{selectedApplication.professionalDetails?.hospital || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Phone:</span>
                <span className={styles.detailValue}>{selectedApplication.phone || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Registered:</span>
                <span className={styles.detailValue}>{formatDate(selectedApplication.createdAt)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status:</span>
                <span className={selectedApplication.isVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
                  {selectedApplication.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                </span>
              </div>
              {selectedApplication.professionalDetails?.documentCount && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Documents Uploaded:</span>
                  <span className={styles.detailValue}>{selectedApplication.professionalDetails.documentCount} file(s)</span>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              {!selectedApplication.isVerified ? (
                <button
                  className={styles.modalVerifyBtn}
                  onClick={() => {
                    handleVerify(selectedApplication._id);
                    setSelectedApplication(null);
                  }}
                >
                  <UserCheck size={18} /> Verify Account
                </button>
              ) : (
                <button
                  className={styles.modalUnverifyBtn}
                  onClick={() => {
                    handleUnverify(selectedApplication._id);
                    setSelectedApplication(null);
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

export default DoctorApplications;
