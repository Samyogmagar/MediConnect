import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Building2, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import LabLayout from '../../components/lab/LabLayout';
import useAuth from '../../hooks/useAuth';
import labService from '../../services/labService';
import styles from './Profile.module.css';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await labService.getProfile();
      setProfile(res.data?.user || res.user || res.data || null);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile information.');
      // Fallback to auth context user
      setProfile(user);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const displayProfile = profile || user;
  const professional = displayProfile?.professionalDetails || {};
  const address = displayProfile?.address || {};
  const initials = (displayProfile?.name || 'L').slice(0, 1).toUpperCase();
  const fullAddress = [address.street, address.city, address.state || address.province, address.zipCode]
    .filter(Boolean)
    .join(', ');

  if (loading) {
    return (
      <LabLayout>
        <div className={styles.page}>
          <div className={styles.loading}>Loading profile...</div>
        </div>
      </LabLayout>
    );
  }

  return (
    <LabLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Lab Profile</h1>
            <p className={styles.subtitle}>View and manage your diagnostic center profile details</p>
          </div>
          <button className={styles.editBtn} onClick={() => navigate('/lab/settings')}>
            <Edit size={16} /> Edit Profile
          </button>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <section className={styles.banner}>
          <div className={styles.bannerAvatar}>{initials}</div>
          <div className={styles.bannerInfo}>
            <h2 className={styles.bannerName}>{professional.labName || displayProfile?.name || 'Lab Center'}</h2>
            <p className={styles.bannerEmail}>{displayProfile?.email || 'No email available'}</p>
            <div className={styles.badges}>
              <span className={styles.badge}>
                <Building2 size={12} /> {professional.accreditation || 'Accreditation pending'}
              </span>
              <span className={styles.badge}>
                <ShieldCheck size={12} /> {displayProfile?.isVerified ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
          </div>
        </section>

        <div className={styles.quickRow}>
          <Link to="/lab/test-requests" className={styles.quickCard}>
            <span className={styles.quickLabel}>Test Requests</span>
            <span className={styles.quickValue}>Review incoming</span>
          </Link>
          <Link to="/lab/upload-reports" className={styles.quickCard}>
            <span className={styles.quickLabel}>Upload Reports</span>
            <span className={styles.quickValue}>Submit completed tests</span>
          </Link>
          <Link to="/lab/settings" className={styles.quickCard}>
            <span className={styles.quickLabel}>Settings</span>
            <span className={styles.quickValue}>Update profile</span>
          </Link>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Lab Information</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.label}>Lab Name</span>
                <span className={styles.value}>
                  {professional.labName || 'Not specified'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Registration Number</span>
                <span className={styles.value}>
                  {professional.labLicenseNumber || 'Not specified'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Accreditation</span>
                <span className={styles.value}>
                  {professional.accreditation || 'Not specified'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Services Offered</span>
                <span className={styles.value}>
                  {professional.servicesOffered?.length > 0
                    ? professional.servicesOffered.join(', ')
                    : 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Contact Information</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.label}><Mail size={14} /> Contact Person</span>
                <span className={styles.value}>
                  {displayProfile?.name || `${displayProfile?.firstName || ''} ${displayProfile?.lastName || ''}`.trim() || 'Not specified'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}><Mail size={14} /> Email</span>
                <span className={styles.value}>
                  {displayProfile?.email || 'Not specified'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}><Phone size={14} /> Phone</span>
                <span className={styles.value}>
                  {displayProfile?.phone || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Address</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.label}><MapPin size={14} /> Location</span>
                <span className={styles.value}>{fullAddress || 'Not specified'}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Account Status</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.label}>Approval Status</span>
                <span className={styles.value}>
                  <span
                    className={`${styles.statusBadge} ${
                      displayProfile?.isVerified
                        ? styles.statusApproved
                        : styles.statusPending
                    }`}
                  >
                    {displayProfile?.isVerified ? 'Approved' : 'Pending Approval'}
                  </span>
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Role</span>
                <span className={styles.value} style={{ textTransform: 'capitalize' }}>
                  {displayProfile?.role || 'Lab'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Member Since</span>
                <span className={styles.value}>
                  {displayProfile?.createdAt
                    ? new Date(displayProfile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LabLayout>
  );
};

export default Profile;
