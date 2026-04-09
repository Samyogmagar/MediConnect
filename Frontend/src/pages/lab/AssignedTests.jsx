import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Calendar, User, ClipboardList } from 'lucide-react';
import LabLayout from '../../components/lab/LabLayout';
import StatCard from '../../components/lab/StatCard';
import TestStatusBadge from '../../components/lab/TestStatusBadge';
import labService from '../../services/labService';
import styles from './AssignedTests.module.css';

const AssignedTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchAssignedTests();
  }, []);

  const fetchAssignedTests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await labService.getTests();
      const allTests = res.data?.tests || [];
      // Show active workflow tests
      setTests(
        allTests.filter((t) => ['assigned', 'sample_collected', 'processing'].includes(t.status))
      );
    } catch (err) {
      console.error('Error loading assigned tests:', err);
      setError('Failed to load assigned tests.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const counts = useMemo(() => {
    const c = { total: tests.length, assigned: 0, collected: 0, processing: 0 };
    tests.forEach((t) => {
      if (t.status === 'assigned') c.assigned++;
      if (t.status === 'sample_collected') c.collected++;
      if (t.status === 'processing') c.processing++;
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
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (doctorFilter !== 'all' && t.doctorId?._id !== doctorFilter) return false;
      if (typeFilter !== 'all' && t.testType !== typeFilter) return false;
      if (dateFilter !== 'all') {
        const dateValue = new Date(t.assignedAt || t.createdAt);
        const diffDays = (now - dateValue) / (1000 * 60 * 60 * 24);
        if (dateFilter === '7' && diffDays > 7) return false;
        if (dateFilter === '30' && diffDays > 30) return false;
      }
      return true;
    });
  }, [tests, statusFilter, doctorFilter, typeFilter, dateFilter]);

  if (loading) {
    return (
      <LabLayout>
        <div className={styles.page}>
          <div className={styles.loading}>Loading assigned tests...</div>
        </div>
      </LabLayout>
    );
  }

  return (
    <LabLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Assigned Tests</h1>
          <p className={styles.subtitle}>Operational queue of assigned lab tests</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard
            label="Total Assigned"
            value={counts.total}
            color="blue"
          />
          <StatCard
            label="Sample Collected"
            value={counts.collected}
            color="teal"
          />
          <StatCard
            label="Processing"
            value={counts.processing}
            color="orange"
          />
        </div>

        <div className={styles.filtersCard}>
          <div className={styles.filtersHeader}>
            <Filter size={16} />
            <span>Filters</span>
          </div>
          <div className={styles.filtersRow}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="sample_collected">Sample Collected</option>
              <option value="processing">Processing</option>
            </select>
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

        {filteredTests.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Test</th>
                  <th>Doctor</th>
                  <th>Appointment</th>
                  <th>Assigned</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test) => (
                  <tr key={test._id}>
                    <td>
                      <div className={styles.cellRow}>
                        <User size={14} />
                        <span>{test.patientId?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.cellRow}>
                        <ClipboardList size={14} />
                        <span>{test.testName || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span>{test.doctorId?.name ? `Dr. ${test.doctorId.name}` : '—'}</span>
                    </td>
                    <td>
                      <span>
                        {test.appointmentId?._id
                          ? test.appointmentId._id.slice(-8).toUpperCase()
                          : '—'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.cellRow}>
                        <Calendar size={13} />
                        <span>{formatDate(test.assignedAt || test.createdAt)}</span>
                      </div>
                    </td>
                    <td>
                      <TestStatusBadge status={test.status} />
                    </td>
                    <td>
                      <button
                        className={styles.manageBtn}
                        onClick={() => navigate(`/lab/tests/${test._id}`)}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>No assigned tests at the moment</div>
        )}
      </div>
    </LabLayout>
  );
};

export default AssignedTests;
