import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DoctorCard from '../../components/patient/DoctorCard';
import notificationService from '../../services/notificationService';
import doctorService from '../../services/doctorService';
import styles from './DoctorSearch.module.css';

const DoctorSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchDoctors();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    const specParam = searchParams.get('specialization') || '';
    setSpecialization(specParam);
  }, [searchParams]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await doctorService.getDoctors();
      setDoctors(response.data?.doctors || response.data?.users || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data?.count ?? res.data?.unreadCount ?? 0);
    } catch {
      // silent
    }
  };

  // Client-side filtering
  const filteredDoctors = useMemo(() => {
    const filtered = doctors.filter((doc) => {
      // Only show verified doctors
      if (!doc.isVerified) return false;
      
      const name = (doc.name || '').toLowerCase();
      const spec = (doc.professionalDetails?.specialization || '').toLowerCase();
      const hospital = (doc.professionalDetails?.hospital || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        !query || name.includes(query) || spec.includes(query) || hospital.includes(query);

      const matchesSpec =
        !specialization || spec === specialization.toLowerCase();

      return matchesSearch && matchesSpec;
    });

    const sorted = [...filtered];
    if (sortBy === 'fee_low') {
      sorted.sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0));
    }
    if (sortBy === 'experience_high') {
      sorted.sort(
        (a, b) =>
          (b.professionalDetails?.experience || 0) -
          (a.professionalDetails?.experience || 0)
      );
    }
    return sorted;
  }, [doctors, searchQuery, specialization, sortBy]);

  // Extract unique specializations for the dropdown (only from verified doctors)
  const specializations = useMemo(() => {
    const specSet = new Set();
    doctors.forEach((doc) => {
      if (doc.isVerified) {
        const spec = doc.professionalDetails?.specialization;
        if (spec) specSet.add(spec);
      }
    });
    return Array.from(specSet).sort();
  }, [doctors]);

  const handleSpecialtySelect = (spec) => {
    if (spec) {
      navigate(`/patient/doctors?specialization=${encodeURIComponent(spec)}`);
    } else {
      navigate('/patient/doctors');
    }
  };

  return (
    <DashboardLayout unreadCount={unreadCount}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Find Doctors</h1>
          <p className={styles.subtitle}>Search and book appointments with verified doctors</p>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by doctor name, specialization, or clinic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className={styles.select}
            value={specialization}
            onChange={(e) => handleSpecialtySelect(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recommended">Recommended</option>
            <option value="fee_low">Lowest Fee</option>
            <option value="experience_high">Most Experience</option>
          </select>
        </div>

        <p className={styles.resultCount}>
          Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
        </p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {loading ? (
          <p className={styles.loadingText}>Loading doctors...</p>
        ) : filteredDoctors.length === 0 ? (
          <p className={styles.emptyText}>No doctors found matching your criteria.</p>
        ) : (
          <div className={styles.grid}>
            {filteredDoctors.map((doc) => (
              <DoctorCard key={doc._id} doctor={doc} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorSearch;
