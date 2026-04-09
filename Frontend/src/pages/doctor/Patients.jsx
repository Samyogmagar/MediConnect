import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Calendar } from 'lucide-react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import PatientCard from '../../components/doctor/PatientCard';
import StatCard from '../../components/doctor/StatCard';
import doctorService from '../../services/doctorService';
import styles from './Patients.module.css';

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await doctorService.getPatients();
      setPatients(res.data?.patients || []);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecords = (patient) => {
    navigate(`/doctor/records?patientId=${patient._id}`, { state: { patient } });
  };

  const handleAssignLabTest = (patient) => {
    navigate(`/doctor/assign-lab-test?patientId=${patient._id}`, { state: { patient } });
  };

  const filteredPatients = patients.filter((p) =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPatients = patients.length;
  const maleCount = patients.filter((p) => p.gender === 'male').length;
  const femaleCount = patients.filter((p) => p.gender === 'female').length;

  // Visits this week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const visitsThisWeek = patients.filter((p) => {
    if (!p.lastVisit) return false;
    return new Date(p.lastVisit) >= startOfWeek;
  }).length;

  return (
    <DoctorLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Patients</h1>
            <p className={styles.subtitle}>View and manage your patient records</p>
          </div>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard
            icon={<Users size={20} />}
            label="Total Patients"
            value={totalPatients}
            color="blue"
          />
          <StatCard
            icon={<Users size={20} />}
            label="Male"
            value={maleCount}
            color="purple"
          />
          <StatCard
            icon={<Users size={20} />}
            label="Female"
            value={femaleCount}
            color="teal"
          />
          <StatCard
            icon={<Calendar size={20} />}
            label="Visits This Week"
            value={visitsThisWeek}
            color="green"
          />
        </div>

        {/* Patient Cards */}
        {loading ? (
          <div className={styles.loading}>Loading patients...</div>
        ) : filteredPatients.length === 0 ? (
          <div className={styles.empty}>
            {searchTerm ? 'No patients found matching your search.' : 'No patients yet.'}
          </div>
        ) : (
          <div className={styles.patientsGrid}>
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient._id}
                patient={patient}
                onViewRecords={handleViewRecords}
                onAssignLabTest={handleAssignLabTest}
              />
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default Patients;
