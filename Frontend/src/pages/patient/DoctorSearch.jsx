import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DoctorsPageHeader from '../../components/patient/doctors/DoctorsPageHeader';
import DoctorSearchToolbar from '../../components/patient/doctors/DoctorSearchToolbar';
import DoctorResultsMeta from '../../components/patient/doctors/DoctorResultsMeta';
import DoctorListItemCard from '../../components/patient/doctors/DoctorListItemCard';
import EmptyDoctorsState from '../../components/patient/doctors/EmptyDoctorsState';
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
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [unreadCount, setUnreadCount] = useState(0);
  const [availabilityMap, setAvailabilityMap] = useState({});

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

      const snapshot = availabilityMap[doc._id];
      const status = snapshot?.status || 'unavailable';
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available_today' && status === 'available_today') ||
        (availabilityFilter === 'bookable' && ['available_today', 'next_tomorrow', 'upcoming'].includes(status)) ||
        (availabilityFilter === 'unavailable' && status === 'unavailable');

      return matchesSearch && matchesSpec && matchesAvailability;
    });

    const sorted = [...filtered];
    if (sortBy === 'recommended') {
      const rank = (doctor) => {
        const status = availabilityMap[doctor._id]?.status;
        if (status === 'available_today') return 3;
        if (status === 'next_tomorrow') return 2;
        if (status === 'upcoming') return 1;
        return 0;
      };
      sorted.sort((a, b) => rank(b) - rank(a));
    } else if (sortBy === 'fee_low') {
      sorted.sort(
        (a, b) =>
          Number(a.professionalDetails?.consultationFee || a.consultationFee || 0) -
          Number(b.professionalDetails?.consultationFee || b.consultationFee || 0)
      );
    } else if (sortBy === 'fee_high') {
      sorted.sort(
        (a, b) =>
          Number(b.professionalDetails?.consultationFee || b.consultationFee || 0) -
          Number(a.professionalDetails?.consultationFee || a.consultationFee || 0)
      );
    } else if (sortBy === 'experience_high') {
      sorted.sort(
        (a, b) =>
          Number(b.professionalDetails?.experience || 0) -
          Number(a.professionalDetails?.experience || 0)
      );
    } else if (sortBy === 'name_az') {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return sorted;
  }, [doctors, searchQuery, specialization, availabilityFilter, sortBy, availabilityMap]);

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

  const handleAvailabilityChange = (doctorId, snapshot) => {
    setAvailabilityMap((prev) => {
      const existing = prev[doctorId];
      if (
        existing &&
        existing.status === snapshot.status &&
        existing.label === snapshot.label &&
        existing.slotCount === snapshot.slotCount
      ) {
        return prev;
      }

      return {
        ...prev,
        [doctorId]: snapshot,
      };
    });
  };

  const handleViewProfile = (doctor) => {
    navigate(`/patient/doctors/${doctor._id}`);
  };

  const handleBookAppointment = (doctor, slot = null) => {
    if (slot?.dateTime) {
      const encoded = encodeURIComponent(slot.dateTime);
      navigate(`/patient/book-appointment/${doctor._id}?slot=${encoded}`);
      return;
    }

    navigate(`/patient/book-appointment/${doctor._id}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setAvailabilityFilter('all');
    setSortBy('recommended');
    handleSpecialtySelect('');
  };

  const activeFilters = useMemo(() => {
    const tags = [];
    if (searchQuery.trim()) tags.push(`Search: ${searchQuery.trim()}`);
    if (specialization) tags.push(`Specialization: ${specialization}`);
    if (availabilityFilter !== 'all') {
      const labelMap = {
        available_today: 'Available Today',
        bookable: 'Bookable Soon',
        unavailable: 'Unavailable',
      };
      tags.push(`Availability: ${labelMap[availabilityFilter]}`);
    }
    if (sortBy !== 'recommended') {
      const labelMap = {
        fee_low: 'Fee Low-High',
        fee_high: 'Fee High-Low',
        experience_high: 'Most Experience',
        name_az: 'Name A-Z',
      };
      tags.push(`Sort: ${labelMap[sortBy] || sortBy}`);
    }
    return tags;
  }, [searchQuery, specialization, availabilityFilter, sortBy]);

  return (
    <DashboardLayout unreadCount={unreadCount}>
      <div className={styles.page}>
        <DoctorsPageHeader />
        <DoctorSearchToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          specializations={specializations}
          specialization={specialization}
          onSpecializationChange={handleSpecialtySelect}
          availabilityFilter={availabilityFilter}
          onAvailabilityFilterChange={setAvailabilityFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          hasActiveFilters={activeFilters.length > 0}
          onClearFilters={clearFilters}
        />

        <DoctorResultsMeta
          count={filteredDoctors.length}
          total={doctors.filter((doc) => doc.isVerified).length}
          activeFilters={activeFilters}
        />

        {error && <div className={styles.errorBanner}>{error}</div>}

        {loading ? (
          <p className={styles.loadingText}>Loading doctors...</p>
        ) : filteredDoctors.length === 0 ? (
          <EmptyDoctorsState hasFilters={activeFilters.length > 0} onClearFilters={clearFilters} />
        ) : (
          <div className={styles.list}>
            {filteredDoctors.map((doc) => (
              <DoctorListItemCard
                key={doc._id}
                doctor={doc}
                availabilitySnapshot={availabilityMap[doc._id]}
                onAvailabilityChange={handleAvailabilityChange}
                onBook={handleBookAppointment}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorSearch;
