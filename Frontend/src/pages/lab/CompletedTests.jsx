import { useState, useEffect, useMemo } from 'react';
import { Filter } from 'lucide-react';
import LabLayout from '../../components/lab/LabLayout';
import StatCard from '../../components/lab/StatCard';
import ReportListTable from '../../components/lab/ReportListTable';
import labService from '../../services/labService';
import styles from './CompletedTests.module.css';

const CompletedTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [patientFilter, setPatientFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchCompletedTests();
  }, []);

  const fetchCompletedTests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await labService.getCompletedTests();
      setTests(res.data?.tests || []);
    } catch (err) {
      console.error('Error loading completed tests:', err);
      setError('Failed to load completed tests.');
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const c = {
      total: tests.length,
      uploadedToday: 0,
      urgent: 0,
    };
    tests.forEach((t) => {
      const completedDate = new Date(t.report?.uploadedAt || t.actualCompletionDate || t.updatedAt);
      if (completedDate >= todayStart) c.uploadedToday++;
      if (t.urgency === 'urgent' || t.urgency === 'emergency') c.urgent++;
    });
    return c;
  }, [tests]);

  const doctorOptions = useMemo(() => {
    const names = new Map();
    tests.forEach((t) => {
      if (t.doctorId?._id) names.set(t.doctorId._id, t.doctorId.name);
    });
    return Array.from(names.entries());
  }, [tests]);

  const typeOptions = useMemo(() => {
    const types = new Set();
    tests.forEach((t) => {
      if (t.testType) types.add(t.testType);
    });
    return Array.from(types);
  }, [tests]);

  const filteredTests = useMemo(() => {
    const now = new Date();
    return tests.filter((t) => {
      if (doctorFilter !== 'all' && t.doctorId?._id !== doctorFilter) return false;
      if (typeFilter !== 'all' && t.testType !== typeFilter) return false;
      if (patientFilter && !t.patientId?.name?.toLowerCase().includes(patientFilter.toLowerCase())) return false;
      if (dateFilter !== 'all') {
        const dateValue = new Date(t.report?.uploadedAt || t.actualCompletionDate || t.updatedAt);
        const diffDays = (now - dateValue) / (1000 * 60 * 60 * 24);
        if (dateFilter === '7' && diffDays > 7) return false;
        if (dateFilter === '30' && diffDays > 30) return false;
      }
      return true;
    });
  }, [tests, doctorFilter, typeFilter, patientFilter, dateFilter]);

  const handleView = (test) => {
    if (test.report?.url) {
      window.open(test.report.url, '_blank');
    } else {
      alert('No report file available for this test.');
    }
  };

  const handleDownload = (test) => {
    if (test.report?.url) {
      const link = document.createElement('a');
      link.href = test.report.url;
      link.download = test.report.filename || `report-${test._id}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('No report file available for download.');
    }
  };

  if (loading) {
    return (
      <LabLayout>
        <div className={styles.page}>
          <div className={styles.loading}>Loading completed tests...</div>
        </div>
      </LabLayout>
    );
  }

  return (
    <LabLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Report Management</h1>
          <p className={styles.subtitle}>Review uploaded diagnostic reports and download files</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard
            label="Total Reports"
            value={counts.total}
            color="blue"
          />
          <StatCard
            label="Uploaded Today"
            value={counts.uploadedToday}
            color="teal"
          />
          <StatCard
            label="Urgent Reports"
            value={counts.urgent}
            color="red"
          />
        </div>

        <div className={styles.filtersCard}>
          <div className={styles.filtersHeader}>
            <Filter size={16} />
            <span>Filters</span>
          </div>
          <div className={styles.filtersRow}>
            <input
              className={styles.searchInput}
              placeholder="Search patient name..."
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
            />
            <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
              <option value="all">All Doctors</option>
              {doctorOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Test Types</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">All Dates</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Uploaded Reports</h2>
          <ReportListTable tests={filteredTests} onView={handleView} onDownload={handleDownload} />
        </div>
      </div>
    </LabLayout>
  );
};

export default CompletedTests;
