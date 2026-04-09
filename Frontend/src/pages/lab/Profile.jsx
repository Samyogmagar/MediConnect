import { useState, useEffect, useCallback } from 'react';
import LabLayout from '../../components/lab/LabLayout';
import useAuth from '../../hooks/useAuth';
import labService from '../../services/labService';
import styles from './Profile.module.css';

const Profile = () => {
  const { user } = useAuth();
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
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Lab Profile</h1>
          <p className={styles.subtitle}>View your diagnostic center details</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.grid}>
          {/* Lab Information */}
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

          {/* Contact Information */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Contact Information</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.label}>Contact Person</span>
                <span className={styles.value}>
                  {displayProfile?.firstName} {displayProfile?.lastName}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>
                  {displayProfile?.email || 'Not specified'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Phone</span>
                <span className={styles.value}>
                  {displayProfile?.phone || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Address</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.label}>Street</span>
                <span className={styles.value}>
                  {address.street || 'Not specified'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>City</span>
                <span className={styles.value}>
                  {address.city || 'Not specified'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>State</span>
                <span className={styles.value}>
                  {address.state || 'Not specified'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Zip Code</span>
                <span className={styles.value}>
                  {address.zipCode || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Status */}
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
