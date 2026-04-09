import { useEffect, useMemo, useState } from 'react';
import { Eye, Pill } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import FilterToolbar from '../../components/admin/FilterToolbar';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import medicationService from '../../services/medicationService';
import styles from './Prescriptions.module.css';

const Prescriptions = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMedication, setSelectedMedication] = useState(null);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    setLoading(true);
    try {
      const res = await medicationService.getMedications();
      const payload = res.data?.data || res.data || {};
      setMedications(payload.medications || payload.data?.medications || []);
    } catch (err) {
      console.error('Failed to load medications', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return medications.filter((med) => {
      const matchesStatus = statusFilter === 'all' || med.status === statusFilter;
      const keyword = search.trim().toLowerCase();
      const matchesSearch = !keyword || [
        med.medicationName,
        med.patientId?.name,
        med.doctorId?.name,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));
      return matchesStatus && matchesSearch;
    });
  }, [medications, search, statusFilter]);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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
      key: 'doctor',
      label: 'Prescribing Doctor',
      render: (row) => (
        <div>
          <span className={styles.primaryText}>Dr. {row.doctorId?.name || 'Unknown'}</span>
          <span className={styles.subText}>{row.doctorId?.professionalDetails?.specialization || ''}</span>
        </div>
      ),
    },
    {
      key: 'medication',
      label: 'Medication',
      render: (row) => (
        <div>
          <span className={styles.primaryText}>{row.medicationName}</span>
          <span className={styles.subText}>{row.dosage} · {row.frequency}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'date',
      label: 'Issued',
      render: (row) => formatDate(row.prescribedAt || row.createdAt),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button className={styles.viewBtn} onClick={() => setSelectedMedication(row)}>
          <Eye size={14} /> View
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Prescription Monitoring</h1>
          <p className={styles.subtitle}>Operational visibility into prescriptions and medication status.</p>
        </div>

        <FilterToolbar
          searchValue={search}
          onSearchChange={setSearch}
          placeholder="Search patient, doctor, medication"
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'discontinued', label: 'Discontinued' },
              ],
            },
          ]}
        />

        <div className={styles.tableSection}>
          <DataTable
            columns={columns}
            rows={filtered}
            loading={loading}
            emptyMessage="No prescriptions found"
          />
        </div>

        {selectedMedication && (
          <div className={styles.modalOverlay} onClick={() => setSelectedMedication(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Prescription Details</h2>
                <button className={styles.closeBtn} onClick={() => setSelectedMedication(null)}>
                  <Pill size={16} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.detailRow}>
                  <span>Medication</span>
                  <strong>{selectedMedication.medicationName}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Dosage</span>
                  <strong>{selectedMedication.dosage}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Frequency</span>
                  <strong>{selectedMedication.frequency}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Patient</span>
                  <strong>{selectedMedication.patientId?.name || '—'}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Doctor</span>
                  <strong>Dr. {selectedMedication.doctorId?.name || '—'}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Status</span>
                  <StatusBadge status={selectedMedication.status} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Prescriptions;
