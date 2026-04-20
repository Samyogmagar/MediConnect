import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BriefcaseMedical, ChevronLeft, GraduationCap, MapPin, Wallet } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import DoctorAvailabilityBadge from '../../components/patient/doctors/DoctorAvailabilityBadge';
import QuickSlotPreview from '../../components/patient/doctors/QuickSlotPreview';
import { UserAvatar } from '../../components/common/avatar';
import notificationService from '../../services/notificationService';
import doctorService from '../../services/doctorService';
import styles from './DoctorProfile.module.css';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [availabilitySnapshot, setAvailabilitySnapshot] = useState({ status: 'loading', label: 'Checking Availability' });

  const fetchDoctor = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await doctorService.getDoctorById(doctorId);
      setDoctor(response.data?.doctor || response.data?.user || null);
    } catch {
      setError('Unable to load doctor profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data?.count ?? res.data?.unreadCount ?? 0);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchDoctor();
    fetchUnreadCount();
  }, [fetchDoctor, fetchUnreadCount]);

  const handleAvailabilityChange = useCallback((_, snapshot) => {
    setAvailabilitySnapshot(snapshot);
  }, []);

  const handleBook = (slot) => {
    const params = new URLSearchParams();
    if (slot?.date) params.set('date', slot.date);
    if (slot?.dateTime) params.set('slot', slot.dateTime);
    const query = params.toString() ? `?${params.toString()}` : '';
    navigate(`/patient/book-appointment/${doctorId}${query}`);
  };

  if (loading) {
    return (
      <DashboardLayout unreadCount={unreadCount}>
        <div className={styles.loadingCard} />
      </DashboardLayout>
    );
  }

  if (error || !doctor) {
    return (
      <DashboardLayout unreadCount={unreadCount}>
        <div className={styles.errorBox}>
          <p>{error || 'Doctor not found.'}</p>
          <Button variant="secondary" onClick={() => navigate('/patient/doctors')}>
            Back to Doctor Directory
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const details = doctor.professionalDetails || {};
  const fee = Number(details.consultationFee || doctor.consultationFee || 0);
  const qualifications = Array.isArray(details.qualifications) ? details.qualifications : [];

  return (
    <DashboardLayout unreadCount={unreadCount}>
      <div className={styles.page}>
        <button type="button" className={styles.backBtn} onClick={() => navigate('/patient/doctors')}>
          <ChevronLeft size={16} /> Back to Find Doctors
        </button>

        <section className={styles.profileCard}>
          <div className={styles.avatarCol}>
            <UserAvatar
              src={doctor.profileImageUrl}
              name={doctor.name}
              size="xl"
              shape="rounded"
              className={styles.avatarNode}
              imageClassName={styles.avatarImage}
              fallbackClassName={styles.avatarFallback}
            />
            <DoctorAvailabilityBadge snapshot={availabilitySnapshot} />
          </div>

          <div className={styles.contentCol}>
            <h1 className={styles.name}>{doctor.name || 'Doctor Profile'}</h1>
            <p className={styles.specialization}>{details.specialization || 'General Medicine'}</p>

            <div className={styles.metaGrid}>
              <p>
                <GraduationCap size={14} />
                {qualifications.length > 0 ? qualifications.join(', ') : 'Board Certified Physician'}
              </p>
              <p>
                <BriefcaseMedical size={14} />
                {details.experience || 0} years of experience
              </p>
              <p>
                <MapPin size={14} />
                {details.department || details.hospital || 'Hospital Department'}
              </p>
              <p>
                <Wallet size={14} />
                Consultation Fee: NPR {fee > 0 ? fee.toLocaleString() : 'N/A'}
              </p>
            </div>

            <p className={styles.bio}>
              {details.bio || 'Committed to compassionate care and evidence-based treatment tailored to patient needs.'}
            </p>

            <div className={styles.slotSection}>
              <h3>Quick Available Slots</h3>
              <QuickSlotPreview
                doctorId={doctorId}
                onStatusChange={handleAvailabilityChange}
                onSlotClick={handleBook}
              />
            </div>

            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => navigate('/patient/doctors')}>
                Back to Directory
              </Button>
              <Button variant="primary" onClick={() => handleBook()}>
                Book Appointment
              </Button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfile;
