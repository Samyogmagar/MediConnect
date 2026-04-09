import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Droplet,
  Shield,
  Heart,
  AlertCircle,
  Pill,
  Edit,
  Clock,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useAuth from '../../hooks/useAuth';
import patientService from '../../services/patientService';
import styles from './Profile.module.css';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);

  const loadMedications = useCallback(async () => {
    try {
      const res = await patientService.getDashboardData();
      setMedications(res?.data?.activeMedications || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMedications();
  }, [loadMedications]);

  const getAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let years = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      years -= 1;
    }
    return years > 0 ? years : null;
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const age = getAge(user?.dateOfBirth);

  const bloodGroup = user?.bloodGroup || null;
  const gender = user?.gender
    ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
    : null;

  const fullAddress = [
    user?.address?.street,
    user?.address?.city,
    user?.address?.province,
  ]
    .filter(Boolean)
    .join(', ');
  const postalCode = user?.address?.postalCode;

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.subtitle}>Manage your personal and medical information</p>
          </div>
          <button
            className={styles.editBtn}
            onClick={() => navigate('/patient/settings')}
          >
            <Edit size={16} />
            Edit Profile
          </button>
        </div>

        {/* Profile Banner */}
        <div className={styles.banner}>
          <div className={styles.bannerAvatar}>
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" />
            ) : (
              <span>{getInitials(user?.name)}</span>
            )}
          </div>
          <div className={styles.bannerInfo}>
            <h2 className={styles.bannerName}>{user?.name || 'User'}</h2>
            <p className={styles.bannerEmail}>{user?.email}</p>
            <div className={styles.badges}>
              {age && <span className={styles.badge}>{age} years old</span>}
              {gender && <span className={styles.badge}>{gender}</span>}
              {bloodGroup && (
                <span className={`${styles.badge} ${styles.badgeBlood}`}>
                  <Droplet size={12} /> {bloodGroup}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.quickRow}>
          <Link to="/patient/records" className={styles.quickCard}>
            <span className={styles.quickLabel}>Medical Records</span>
            <span className={styles.quickValue}>View reports</span>
          </Link>
          <Link to="/patient/appointments" className={styles.quickCard}>
            <span className={styles.quickLabel}>Appointments</span>
            <span className={styles.quickValue}>Manage visits</span>
          </Link>
          <Link to="/patient/settings" className={styles.quickCard}>
            <span className={styles.quickLabel}>Profile Settings</span>
            <span className={styles.quickValue}>Update details</span>
          </Link>
        </div>

        {/* Info Cards Row */}
        <div className={styles.infoGrid}>
          {/* Personal Info */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span className={styles.cardIcon}><User size={16} /></span>
              Personal Information
            </h3>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Full Name</span>
              <span className={styles.infoValue}>{user?.name || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <Calendar size={14} /> Date of Birth
              </span>
              <span className={styles.infoValue}>
                {user?.dateOfBirth ? `${formatDate(user.dateOfBirth)} (${age} years)` : 'N/A'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Gender</span>
              <span className={styles.infoValue}>{gender || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Blood Group</span>
              <span className={`${styles.infoValue} ${styles.bloodValue}`}>
                {bloodGroup || 'N/A'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <Clock size={14} /> Joined Date
              </span>
              <span className={styles.infoValue}>
                {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span className={styles.cardIcon}><Phone size={16} /></span>
              Contact Information
            </h3>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <Phone size={14} /> Phone Number
              </span>
              <span className={styles.infoValue}>{user?.phone || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <Mail size={14} /> Email Address
              </span>
              <span className={styles.infoValue}>{user?.email || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <MapPin size={14} /> Address
              </span>
              <span className={styles.infoValue}>
                {fullAddress || 'N/A'}
                {postalCode && <><br />Postal Code: {postalCode}</>}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        {user?.emergencyContact?.name && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span className={`${styles.cardIcon} ${styles.emergencyIcon}`}><Phone size={16} /></span>
              Emergency Contact
            </h3>
            <div className={styles.emergencyGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Name</span>
                <span className={styles.infoValue}>{user.emergencyContact.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Relationship</span>
                <span className={styles.infoValue}>{user.emergencyContact.relationship || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Phone Number</span>
                <span className={styles.infoValue}>{user.emergencyContact.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Medical History */}
        {user?.medicalHistory && user.medicalHistory.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <span className={styles.cardIcon}><Shield size={16} /></span>
              Medical History
            </h3>
            {user.medicalHistory.map((item, i) => (
              <div key={i} className={styles.historyItem}>
                <div>
                  <strong>{item.condition}</strong>
                  <p>Diagnosed: {item.diagnosedDate ? formatDate(item.diagnosedDate) : 'N/A'}</p>
                </div>
                <span className={`${styles.historyStatus} ${
                  item.status === 'Under Control' ? styles.statusGreen :
                  item.status === 'Managed' ? styles.statusBlue : styles.statusDefault
                }`}>
                  {item.status || 'Active'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Allergies & Medications Row */}
        <div className={styles.infoGrid}>
          {/* Allergies */}
          {user?.allergies && user.allergies.length > 0 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <span className={`${styles.cardIcon} ${styles.allergyIcon}`}><AlertCircle size={16} /></span>
                Allergies
              </h3>
              {user.allergies.map((allergy, i) => (
                <div key={i} className={styles.allergyItem}>
                  <span className={styles.allergyDot}>!</span>
                  {allergy}
                </div>
              ))}
            </div>
          )}

          {/* Current Medications */}
          {medications.length > 0 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIcon}><Pill size={16} /></span>
                Current Medications
              </h3>
              {medications.map((med, i) => (
                <div key={i} className={styles.medItem}>
                  <strong>{med.name || med.medicationName}</strong>
                  <p>
                    Dosage: {med.dosage || 'N/A'} &bull; {med.frequency || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Privacy Notice */}
        <div className={styles.privacyNotice}>
          <Shield size={16} />
          <div>
            <strong>Profile Privacy</strong>
            <p>
              Your medical information is kept private and secure. Only authorized healthcare providers
              you&apos;ve given consent to can view your medical records and history.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
