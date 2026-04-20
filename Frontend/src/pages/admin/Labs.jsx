import { useEffect, useMemo, useState } from 'react';
import { Edit3, Eye, Save, UserCheck, UserX, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import FilterToolbar from '../../components/admin/FilterToolbar';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { useModal } from '../../components/common/feedback/ModalProvider';
import adminService from '../../services/adminService';
import styles from './Labs.module.css';

const Labs = () => {
  const { showConfirm } = useModal();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [selectedLab, setSelectedLab] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ role: 'lab' });
      setLabs(res.data?.users || []);
    } catch (err) {
      console.error('Failed to load labs', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLabs = useMemo(() => {
    return labs.filter((lab) => {
      const matchesStatus = statusFilter === 'all' || (lab.isActive !== false ? 'active' : 'inactive') === statusFilter;
      const matchesVerified = verifiedFilter === 'all' || (lab.isVerified ? 'verified' : 'unverified') === verifiedFilter;
      const keyword = search.trim().toLowerCase();
      const matchesSearch = !keyword || [
        lab.name,
        lab.email,
        lab.professionalDetails?.labName,
        lab.professionalDetails?.labLicenseNumber,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));
      return matchesStatus && matchesVerified && matchesSearch;
    });
  }, [labs, search, statusFilter, verifiedFilter]);

  const openEdit = (lab) => {
    setSelectedLab({
      ...lab,
      professionalDetails: {
        ...lab.professionalDetails,
      },
    });
  };

  const saveProfile = async () => {
    if (!selectedLab) return;
    setSaving(true);
    try {
      const payload = {
        name: selectedLab.name,
        phone: selectedLab.phone,
        professionalDetails: selectedLab.professionalDetails,
      };
      const res = await adminService.updateUserProfile(selectedLab._id, payload);
      const updated = res.data?.user || selectedLab;
      setLabs((prev) => prev.map((lab) => (lab._id === updated._id ? updated : lab)));
      setSelectedLab(null);
    } catch (err) {
      console.error('Failed to update lab profile', err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (lab) => {
    const nextStatus = lab.isActive === false;
    const confirmText = nextStatus
      ? 'Activate this lab account?'
      : 'Deactivate this lab account? They will not be able to sign in.';
    const { confirmed } = await showConfirm({
      title: nextStatus ? 'Activate lab account?' : 'Deactivate lab account?',
      message: confirmText,
      confirmText: nextStatus ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      confirmVariant: nextStatus ? 'success' : 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await adminService.updateUserStatus(lab._id, nextStatus);
      const updated = res.data?.user || lab;
      setLabs((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
    } catch (err) {
      console.error('Failed to update lab status', err);
    }
  };

  const columns = [
    {
      key: 'lab',
      label: 'Lab',
      render: (row) => (
        <div>
          <span className={styles.primaryText}>{row.professionalDetails?.labName || row.name}</span>
          <span className={styles.subText}>{row.professionalDetails?.labLicenseNumber || 'License pending'}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (row) => (
        <div>
          <span className={styles.primaryText}>{row.email}</span>
          <span className={styles.subText}>{row.phone || '—'}</span>
        </div>
      ),
    },
    {
      key: 'accreditation',
      label: 'Accreditation',
      render: (row) => row.professionalDetails?.accreditation || '—',
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
            title={row.isActive === false ? 'Activate lab' : 'Deactivate lab'}
          >
            {row.isActive === false ? <UserCheck size={14} /> : <UserX size={14} />}
          </button>
          <button className={styles.actionBtn} onClick={() => openEdit(row)}>
            <Edit3 size={14} /> Edit
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
          <h1 className={styles.title}>Lab Management</h1>
          <p className={styles.subtitle}>Manage lab staff profiles and operational accreditation details.</p>
        </div>

        <FilterToolbar
          searchValue={search}
          onSearchChange={setSearch}
          placeholder="Search lab staff"
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
            rows={filteredLabs}
            loading={loading}
            emptyMessage="No lab staff found"
          />
        </div>

        {selectedLab && (
          <div className={styles.modalOverlay} onClick={() => setSelectedLab(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Edit Lab Profile</h2>
                <button className={styles.closeBtn} onClick={() => setSelectedLab(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <label className={styles.formField}>
                  Contact Name
                  <input
                    value={selectedLab.name}
                    onChange={(e) => setSelectedLab({ ...selectedLab, name: e.target.value })}
                  />
                </label>
                <label className={styles.formField}>
                  Phone
                  <input
                    value={selectedLab.phone || ''}
                    onChange={(e) => setSelectedLab({ ...selectedLab, phone: e.target.value })}
                  />
                </label>
                <label className={styles.formField}>
                  Lab Name
                  <input
                    value={selectedLab.professionalDetails?.labName || ''}
                    onChange={(e) =>
                      setSelectedLab({
                        ...selectedLab,
                        professionalDetails: {
                          ...selectedLab.professionalDetails,
                          labName: e.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label className={styles.formField}>
                  Lab License Number
                  <input
                    value={selectedLab.professionalDetails?.labLicenseNumber || ''}
                    onChange={(e) =>
                      setSelectedLab({
                        ...selectedLab,
                        professionalDetails: {
                          ...selectedLab.professionalDetails,
                          labLicenseNumber: e.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label className={styles.formField}>
                  Accreditation
                  <input
                    value={selectedLab.professionalDetails?.accreditation || ''}
                    onChange={(e) =>
                      setSelectedLab({
                        ...selectedLab,
                        professionalDetails: {
                          ...selectedLab.professionalDetails,
                          accreditation: e.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.secondaryBtn} onClick={() => setSelectedLab(null)}>
                  Cancel
                </button>
                <button className={styles.primaryBtn} onClick={saveProfile} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Labs;
