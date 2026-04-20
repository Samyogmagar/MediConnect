import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Stethoscope,
  Award,
  DollarSign,
  Clock,
  Edit,
  Shield,
} from 'lucide-react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import useAuth from '../../hooks/useAuth';
import { ProfilePhotoUploader, UserAvatar } from '../../components/common/avatar';
import styles from './Profile.module.css';

const DoctorProfile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const details = user?.professionalDetails || {};

  const fullAddress = [
    user?.address?.street,
    user?.address?.city,
    user?.address?.province,
  ]
    .filter(Boolean)
    .join(', ');

  const qualifications = Array.isArray(details.qualifications)
    ? details.qualifications.filter(Boolean)
    : [];

  return (
    <DoctorLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.subtitle}>View your public doctor profile and professional details</p>
          </div>
          <button className={styles.editBtn} onClick={() => navigate('/doctor/settings')}>
            <Edit size={16} />
            Edit Profile
          </button>
        </div>

        <section className={styles.banner}>
          <div className={styles.avatarWrap}>
            <UserAvatar
              src={user?.profileImageUrl}
              name={user?.name || 'Doctor'}
              size="lg"
              shape="rounded"
              className={styles.avatarNode}
            />
          </div>

          <ProfilePhotoUploader
            currentImage={user?.profileImageUrl}
            name={user?.name}
            onUploaded={refreshUser}
            onRemoved={refreshUser}
            size="lg"
            shape="rounded"
            className={styles.photoActionsWrap}
          />

          <div className={styles.bannerInfo}>
            <h2 className={styles.name}>{user?.name || 'Doctor'}</h2>
            <p className={styles.email}>{user?.email || 'No email'}</p>
            <div className={styles.badges}>
              <span className={styles.badge}>
                <Stethoscope size={12} /> {details.specialization || 'General Medicine'}
              </span>
              <span className={styles.badge}>
                <Briefcase size={12} /> {details.experience || 0} years
              </span>
              <span className={`${styles.badge} ${user?.isVerified ? styles.verified : styles.pending}`}>
                <Shield size={12} /> {user?.isVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
        </section>

        <div className={styles.quickRow}>
          <Link to="/doctor/appointments" className={styles.quickCard}>
            <span className={styles.quickLabel}>Appointments</span>
            <span className={styles.quickValue}>Manage visits</span>
          </Link>
          <Link to="/doctor/patients" className={styles.quickCard}>
            <span className={styles.quickLabel}>Patients</span>
            <span className={styles.quickValue}>View patient list</span>
          </Link>
          <Link to="/doctor/settings" className={styles.quickCard}>
            <span className={styles.quickLabel}>Profile Settings</span>
            <span className={styles.quickValue}>Update details</span>
          </Link>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Personal Information</h3>
            <p><User size={14} /> {user?.name || 'N/A'}</p>
            <p><Mail size={14} /> {user?.email || 'N/A'}</p>
            <p><Phone size={14} /> {user?.phone || 'N/A'}</p>
            <p><MapPin size={14} /> {fullAddress || 'N/A'}</p>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Professional Information</h3>
            <p><Stethoscope size={14} /> {details.specialization || 'N/A'}</p>
            <p><Briefcase size={14} /> {details.experience || 0} years experience</p>
            <p><MapPin size={14} /> {details.hospital || 'Hospital Department'}</p>
            <p>
              <DollarSign size={14} /> NPR{' '}
              {Number(details.consultationFee || 0) > 0
                ? Number(details.consultationFee).toLocaleString()
                : 'N/A'}
            </p>
            <p>
              <Clock size={14} />
              {details.consultationDurationMinutes || 30} minutes per consultation
            </p>
          </section>
        </div>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Qualifications</h3>
          {qualifications.length > 0 ? (
            <div className={styles.tagsWrap}>
              {qualifications.map((qualification) => (
                <span key={qualification} className={styles.tag}>
                  <Award size={12} /> {qualification}
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.muted}>No qualifications added yet.</p>
          )}
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Professional Bio</h3>
          <p className={styles.bioText}>
            {details.bio ||
              'Add your professional bio from Settings to help patients know your expertise and care approach.'}
          </p>
        </section>
      </div>
    </DoctorLayout>
  );
};

export default DoctorProfile;
