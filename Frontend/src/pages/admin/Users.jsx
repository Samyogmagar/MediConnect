import { useMemo, useState, useEffect } from 'react';
import {
  Eye,
  Plus,
  Users as UsersIcon,
  UserCheck,
  Stethoscope,
  FlaskConical,
  CheckCircle,
  X,
  XCircle,
  UserX,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import FilterToolbar from '../../components/admin/FilterToolbar';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { useToast } from '../../components/common/feedback/ToastProvider';
import { useModal } from '../../components/common/feedback/ModalProvider';
import adminService from '../../services/adminService';
import styles from './Users.module.css';

const Users = () => {
  const { showToast } = useToast();
  const { showConfirm } = useModal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'doctor',
    password: '',
    confirmPassword: '',
    specialization: '',
    licenseNumber: '',
    consultationFee: '',
    labName: '',
    labLicenseNumber: '',
    accreditation: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getUsers();
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. The endpoint may not be available yet.');
    } finally {
      setLoading(false);
    }
  };

  const counts = users.reduce(
    (acc, u) => {
      acc.total++;
      const r = (u.role || '').toLowerCase();
      if (r === 'patient') acc.patients++;
      else if (r === 'doctor') acc.doctors++;
      else if (r === 'lab') acc.labs++;
      if (u.isActive !== false) acc.active++;
      return acc;
    },
    { total: 0, active: 0, patients: 0, doctors: 0, labs: 0 }
  );

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRoleSubtitle = (user) => {
    const role = (user.role || '').toLowerCase();
    if (role === 'doctor') return user.professionalDetails?.specialization || '';
    if (role === 'lab') return user.professionalDetails?.registrationNumber || '';
    return '';
  };

  const handleVerify = async (userId) => {
    const { confirmed } = await showConfirm({
      title: 'Verify account?',
      message: 'Are you sure you want to verify this account?',
      confirmText: 'Verify',
      cancelText: 'Cancel',
      confirmVariant: 'success',
    });
    if (!confirmed) return;
    
    try {
      await adminService.verifyUser(userId);
      showToast({ type: 'success', title: 'Account verified', message: 'Account verified successfully.' });
      fetchUsers();
    } catch (err) {
      console.error('Verify error:', err);
      showToast({
        type: 'error',
        title: 'Verify failed',
        message: `Failed to verify account: ${err.response?.data?.message || 'Unknown error'}`,
      });
    }
  };

  const handleUnverify = async (userId) => {
    const { confirmed } = await showConfirm({
      title: 'Unverify account?',
      message: 'Are you sure you want to unverify this account?',
      confirmText: 'Unverify',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
    });
    if (!confirmed) return;

    try {
      await adminService.unverifyUser(userId);
      showToast({ type: 'success', title: 'Account unverified', message: 'Account unverified successfully.' });
      fetchUsers();
    } catch (err) {
      console.error('Unverify error:', err);
      showToast({
        type: 'error',
        title: 'Unverify failed',
        message: `Failed to unverify account: ${err.response?.data?.message || 'Unknown error'}`,
      });
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
  };

  const handleStatusToggle = async (user) => {
    const nextStatus = user.isActive === false;
    const confirmText = nextStatus
      ? 'Activate this user account?'
      : 'Deactivate this user account? They will not be able to sign in.';
    const { confirmed } = await showConfirm({
      title: nextStatus ? 'Activate account?' : 'Deactivate account?',
      message: confirmText,
      confirmText: nextStatus ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      confirmVariant: nextStatus ? 'success' : 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await adminService.updateUserStatus(user._id, nextStatus);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? res.data?.user || u : u)));
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Status update failed',
        message: err.response?.data?.message || 'Failed to update user status.',
      });
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      role: 'doctor',
      password: '',
      confirmPassword: '',
      specialization: '',
      licenseNumber: '',
      consultationFee: '',
      labName: '',
      labLicenseNumber: '',
      accreditation: '',
    });
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setCreateLoading(true);
    setError('');

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        password: form.password,
        confirmPassword: form.confirmPassword,
        professionalDetails: {},
      };

      if (form.role === 'doctor') {
        payload.professionalDetails = {
          specialization: form.specialization,
          licenseNumber: form.licenseNumber,
          consultationFee: Number(form.consultationFee || 0),
        };
      }

      if (form.role === 'lab') {
        payload.professionalDetails = {
          labName: form.labName,
          labLicenseNumber: form.labLicenseNumber,
          accreditation: form.accreditation,
        };
      }

      const res = await adminService.createUser(payload);
      const newUser = res.data?.user;
      if (newUser) {
        setUsers((prev) => [newUser, ...prev]);
      }
      setShowCreate(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const role = (user.role || '').toLowerCase();
      const matchesRole = roleFilter === 'all' || role === roleFilter;

      const active = user.isActive !== false ? 'active' : 'inactive';
      const matchesStatus = statusFilter === 'all' || active === statusFilter;

      const isVerified = user.isVerified ? 'verified' : 'unverified';
      const matchesVerified = verifiedFilter === 'all' || isVerified === verifiedFilter;

      const keyword = search.trim().toLowerCase();
      const matchesSearch = !keyword || [user.name, user.email, user.phone]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));

      return matchesRole && matchesStatus && matchesVerified && matchesSearch;
    });
  }, [users, roleFilter, statusFilter, verifiedFilter, search]);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div>
          <span className={styles.primaryText}>{row.name || 'Unknown'}</span>
          <span className={styles.subText}>{getRoleSubtitle(row)}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => <span className={styles.emailText}>{row.email}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <StatusBadge status={row.role} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const needsVerification = (row.role === 'doctor' || row.role === 'lab') && !row.isVerified;
        return (
          <div>
            <span className={`${styles.statusDot} ${row.isActive !== false ? styles.activeDot : styles.inactiveDot}`}>
              <span className={styles.dot} />
              {row.isActive !== false ? 'Active' : 'Inactive'}
            </span>
            {needsVerification && (
              <span className={styles.pendingBadge}>Pending Verification</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'joined',
      label: 'Joined',
      render: (row) => <span className={styles.dateText}>{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        const needsVerification = (row.role === 'doctor' || row.role === 'lab') && !row.isVerified;
        const isVerified = (row.role === 'doctor' || row.role === 'lab') && row.isVerified;
        return (
          <div className={styles.actionsCell}>
            <button
              className={row.isActive === false ? styles.activateBtn : styles.deactivateBtn}
              onClick={() => handleStatusToggle(row)}
              title={row.isActive === false ? 'Activate user' : 'Deactivate user'}
            >
              {row.isActive === false ? <UserCheck size={16} /> : <UserX size={16} />}
            </button>
            {needsVerification && (
              <button 
                className={styles.verifyBtn} 
                onClick={() => handleVerify(row._id)}
                title="Verify account"
              >
                <CheckCircle size={16} />
              </button>
            )}
            {isVerified && (
              <button
                className={styles.unverifyBtn}
                onClick={() => handleUnverify(row._id)}
                title="Unverify account"
              >
                <XCircle size={16} />
              </button>
            )}
            <button className={styles.viewBtn} title="View user" onClick={() => handleView(row)}>
              <Eye size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>Manage all registered users in the system</p>
        </div>

        <div className={styles.statsGrid}>
          <StatCard icon={<UsersIcon size={20} />} label="Total Users" value={counts.total} color="blue" />
          <StatCard icon={<UserCheck size={20} />} label="Active" value={counts.active} color="green" />
          <StatCard icon={<UsersIcon size={20} />} label="Patients" value={counts.patients} color="purple" />
          <StatCard icon={<Stethoscope size={20} />} label="Doctors" value={counts.doctors} color="yellow" />
          <StatCard icon={<FlaskConical size={20} />} label="Labs" value={counts.labs} color="red" />
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.tableSection}>
          <h2 className={styles.sectionTitle}>All Users</h2>
          <FilterToolbar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search name, email, phone"
            filters={[
              {
                key: 'role',
                label: 'Role',
                value: roleFilter,
                onChange: setRoleFilter,
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'patient', label: 'Patients' },
                  { value: 'doctor', label: 'Doctors' },
                  { value: 'lab', label: 'Lab Staff' },
                  { value: 'admin', label: 'Admins' },
                ],
              },
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
            actions={[
              {
                label: 'Create Staff Account',
                icon: <Plus size={16} />,
                variant: 'primary',
                onClick: () => setShowCreate(true),
              },
            ]}
          />
          <DataTable
            columns={columns}
            rows={filteredUsers}
            loading={loading}
            emptyMessage="No users found"
          />
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>User Details</h2>
                <button className={styles.closeBtn} onClick={() => setSelectedUser(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Name</span>
                  <span className={styles.detailValue}>{selectedUser.name || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Email</span>
                  <span className={styles.detailValue}>{selectedUser.email || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Role</span>
                  <span className={styles.detailValue}>{selectedUser.role || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Phone</span>
                  <span className={styles.detailValue}>{selectedUser.phone || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={styles.detailValue}>{selectedUser.isActive !== false ? 'Active' : 'Inactive'}</span>
                </div>
                {(selectedUser.role === 'doctor' || selectedUser.role === 'lab') && (
                  <>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Verified</span>
                      <span className={styles.detailValue}>{selectedUser.isVerified ? 'Yes' : 'No'}</span>
                    </div>
                    {selectedUser.professionalDetails?.specialization && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Specialization</span>
                        <span className={styles.detailValue}>{selectedUser.professionalDetails.specialization}</span>
                      </div>
                    )}
                    {selectedUser.professionalDetails?.registrationNumber && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Registration #</span>
                        <span className={styles.detailValue}>{selectedUser.professionalDetails.registrationNumber}</span>
                      </div>
                    )}
                    {selectedUser.professionalDetails?.qualifications?.length > 0 && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Qualifications</span>
                        <span className={styles.detailValue}>
                          {selectedUser.professionalDetails.qualifications.join(', ')}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Joined</span>
                  <span className={styles.detailValue}>{formatDate(selectedUser.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCreate && (
          <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Create Staff Account</h2>
                <button className={styles.closeBtn} onClick={() => setShowCreate(false)}>
                  <X size={18} />
                </button>
              </div>
              <form className={styles.modalBody} onSubmit={handleCreateUser}>
                <div className={styles.formGrid}>
                  <label className={styles.formField}>
                    Full Name
                    <input value={form.name} onChange={(e) => handleFormChange('name', e.target.value)} required />
                  </label>
                  <label className={styles.formField}>
                    Email
                    <input type="email" value={form.email} onChange={(e) => handleFormChange('email', e.target.value)} required />
                  </label>
                  <label className={styles.formField}>
                    Phone
                    <input value={form.phone} onChange={(e) => handleFormChange('phone', e.target.value)} />
                  </label>
                  <label className={styles.formField}>
                    Role
                    <select value={form.role} onChange={(e) => handleFormChange('role', e.target.value)}>
                      <option value="doctor">Doctor</option>
                      <option value="lab">Lab Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <label className={styles.formField}>
                    Password
                    <input type="password" value={form.password} onChange={(e) => handleFormChange('password', e.target.value)} required />
                  </label>
                  <label className={styles.formField}>
                    Confirm Password
                    <input type="password" value={form.confirmPassword} onChange={(e) => handleFormChange('confirmPassword', e.target.value)} required />
                  </label>
                </div>

                {form.role === 'doctor' && (
                  <div className={styles.formGrid}>
                    <label className={styles.formField}>
                      Specialization
                      <input value={form.specialization} onChange={(e) => handleFormChange('specialization', e.target.value)} required />
                    </label>
                    <label className={styles.formField}>
                      License Number
                      <input value={form.licenseNumber} onChange={(e) => handleFormChange('licenseNumber', e.target.value)} required />
                    </label>
                    <label className={styles.formField}>
                      Consultation Fee
                      <input type="number" min="0" value={form.consultationFee} onChange={(e) => handleFormChange('consultationFee', e.target.value)} />
                    </label>
                  </div>
                )}

                {form.role === 'lab' && (
                  <div className={styles.formGrid}>
                    <label className={styles.formField}>
                      Lab Name
                      <input value={form.labName} onChange={(e) => handleFormChange('labName', e.target.value)} required />
                    </label>
                    <label className={styles.formField}>
                      Lab License Number
                      <input value={form.labLicenseNumber} onChange={(e) => handleFormChange('labLicenseNumber', e.target.value)} required />
                    </label>
                    <label className={styles.formField}>
                      Accreditation
                      <input value={form.accreditation} onChange={(e) => handleFormChange('accreditation', e.target.value)} />
                    </label>
                  </div>
                )}

                <div className={styles.modalFooter}>
                  <button type="button" className={styles.secondaryBtn} onClick={() => setShowCreate(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryBtn} disabled={createLoading}>
                    {createLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Users;
