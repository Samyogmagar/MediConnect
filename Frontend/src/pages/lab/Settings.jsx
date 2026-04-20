import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  Moon,
  Sun,
  Monitor,
  Eye,
  EyeOff,
  Shield,
  Beaker,
  Building2,
  FileCheck,
  Award,
  Briefcase,
} from 'lucide-react';
import LabLayout from '../../components/lab/LabLayout';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import notificationService from '../../services/notificationService';
import styles from './Settings.module.css';

const PROVINCES = [
  'Bagmati Province',
  'Gandaki Province',
  'Koshi Province',
  'Lumbini Province',
  'Madhesh Province',
  'Karnali Province',
  'Sudurpashchim Province',
];

const LAB_SERVICES = [
  'Blood Tests',
  'Urine Analysis',
  'Stool Tests',
  'Microbiology',
  'Biochemistry',
  'Hematology',
  'Serology',
  'Histopathology',
  'Cytology',
  'Molecular Diagnostics',
  'Immunology',
  'Clinical Chemistry',
  'Toxicology',
  'X-Ray',
  'Ultrasound',
  'CT Scan',
  'MRI',
  'ECG',
  'Other',
];

const Settings = () => {
  const { user, refreshUser } = useAuth();

  // Personal Information State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
  });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  // Work Information State
  const [workInfo, setWorkInfo] = useState({
    labName: '',
    labLicenseNumber: '',
    accreditation: '',
    servicesOffered: [],
  });
  const [workMsg, setWorkMsg] = useState({ type: '', text: '' });
  const [workSaving, setWorkSaving] = useState(false);

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    appointments: true,
    cancellations: true,
    prescriptions: true,
    labReports: true,
  });
  const [pushEnabled, setPushEnabled] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState({ type: '', text: '' });
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [pushSaving, setPushSaving] = useState(false);
  const [pushTestSending, setPushTestSending] = useState(false);

  // Appearance State
  const [appearance, setAppearance] = useState('system');
  const [appearanceMsg, setAppearanceMsg] = useState({ type: '', text: '' });
  const [appearanceSaving, setAppearanceSaving] = useState(false);

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Initialize data from user context
  useEffect(() => {
    if (user) {
      loadUserData(user);
    }
  }, [user]);

  useEffect(() => {
    const loadNotificationPreferences = async () => {
      try {
        const res = await notificationService.getPreferences();
        const prefs = res?.data?.notificationPreferences || res?.data?.data?.notificationPreferences || {};

        setNotifications((prev) => ({
          ...prev,
          appointments: prefs.appointments ?? prev.appointments,
          cancellations: prefs.cancellations ?? prev.cancellations,
          prescriptions: prefs.prescriptions ?? prev.prescriptions,
          labReports: prefs.labReports ?? prev.labReports,
        }));
        setPushEnabled(prefs.channels?.push === true);
      } catch {
        // Keep user context values as fallback.
      }
    };

    loadNotificationPreferences();
  }, []);

  const loadUserData = (currentUser) => {
    // Load personal information
    setProfile({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      gender: currentUser.gender || '',
      street: currentUser.address?.street || '',
      city: currentUser.address?.city || '',
      province: currentUser.address?.province || '',
      postalCode: currentUser.address?.postalCode || '',
      country: currentUser.address?.country || 'Nepal',
    });

    // Load work information
    const pd = currentUser.professionalDetails || {};
    setWorkInfo({
      labName: pd.labName || '',
      labLicenseNumber: pd.labLicenseNumber || '',
      accreditation: pd.accreditation || '',
      servicesOffered: pd.servicesOffered || [],
    });

    // Load notification preferences
    if (currentUser.notificationPreferences) {
      setNotifications({
        appointments: currentUser.notificationPreferences.appointments !== false,
        cancellations: currentUser.notificationPreferences.cancellations !== false,
        prescriptions: currentUser.notificationPreferences.prescriptions !== false,
        labReports: currentUser.notificationPreferences.labReports !== false,
      });
      setPushEnabled(currentUser.notificationPreferences.channels?.push === true);
    }

    // Load appearance preference
    setAppearance(currentUser.appearancePreference || 'system');
    applyTheme(currentUser.appearancePreference || 'system');
  };

  // Personal Information Handlers
  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setProfileMsg({ type: '', text: '' });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const updates = {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        gender: profile.gender,
        address: {
          street: profile.street.trim(),
          city: profile.city.trim(),
          province: profile.province,
          postalCode: profile.postalCode.trim(),
          country: profile.country,
        },
      };

      await authService.updateProfile(updates);
      await refreshUser();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setProfileMsg({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // Work Information Handlers
  const handleWorkInfoChange = (field, value) => {
    setWorkInfo((prev) => ({ ...prev, [field]: value }));
    setWorkMsg({ type: '', text: '' });
  };

  const handleServiceToggle = (service) => {
    setWorkInfo((prev) => {
      const services = prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter((s) => s !== service)
        : [...prev.servicesOffered, service];
      return { ...prev, servicesOffered: services };
    });
    setWorkMsg({ type: '', text: '' });
  };

  const handleWorkInfoSave = async (e) => {
    e.preventDefault();
    setWorkSaving(true);
    setWorkMsg({ type: '', text: '' });

    // Validation
    if (!workInfo.labName.trim()) {
      setWorkMsg({ type: 'error', text: 'Lab name is required' });
      setWorkSaving(false);
      return;
    }

    if (workInfo.servicesOffered.length === 0) {
      setWorkMsg({ type: 'error', text: 'At least one service must be selected' });
      setWorkSaving(false);
      return;
    }

    try {
      const updates = {
        professionalDetails: {
          labName: workInfo.labName.trim(),
          labLicenseNumber: workInfo.labLicenseNumber.trim(),
          accreditation: workInfo.accreditation.trim(),
          servicesOffered: workInfo.servicesOffered,
        },
      };

      await authService.updateProfile(updates);
      await refreshUser();
      setWorkMsg({ type: 'success', text: 'Work information updated successfully!' });
    } catch (error) {
      setWorkMsg({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update work information',
      });
    } finally {
      setWorkSaving(false);
    }
  };

  // Notification Handlers
  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setNotificationMsg({ type: '', text: '' });
  };

  const handleNotificationSave = async (e) => {
    e.preventDefault();
    setNotificationSaving(true);
    setNotificationMsg({ type: '', text: '' });

    try {
      await notificationService.updatePreferences(notifications);
      await refreshUser();
      setNotificationMsg({
        type: 'success',
        text: 'Notification preferences updated successfully!',
      });
    } catch (error) {
      setNotificationMsg({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update notification preferences',
      });
    } finally {
      setNotificationSaving(false);
    }
  };

  const isPushSupported =
    typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;

  const handleEnablePush = async () => {
    if (!isPushSupported) {
      setNotificationMsg({
        type: 'error',
        text: 'Push notifications are not supported on this browser/device.',
      });
      return;
    }

    setPushSaving(true);
    setNotificationMsg({ type: '', text: '' });

    try {
      await notificationService.enablePushOnCurrentDevice();
      await notificationService.updatePreferences({ channels: { push: true } });
      setPushEnabled(true);
      await refreshUser();
      setNotificationMsg({ type: 'success', text: 'Push notifications enabled for this device.' });
    } catch (error) {
      setNotificationMsg({
        type: 'error',
        text: error.message || 'Failed to enable push notifications for this device.',
      });
    } finally {
      setPushSaving(false);
    }
  };

  const handleDisablePush = async () => {
    setPushSaving(true);
    setNotificationMsg({ type: '', text: '' });

    try {
      await notificationService.disablePushOnCurrentDevice();
      await notificationService.updatePreferences({ channels: { push: false } });
      setPushEnabled(false);
      await refreshUser();
      setNotificationMsg({
        type: 'success',
        text: 'Push notifications disabled for this device.',
      });
    } catch (error) {
      setNotificationMsg({
        type: 'error',
        text: error.message || 'Failed to disable push notifications for this device.',
      });
    } finally {
      setPushSaving(false);
    }
  };

  const handleSendTestPush = async () => {
    setPushTestSending(true);
    setNotificationMsg({ type: '', text: '' });

    try {
      const response = await notificationService.sendTestPush({
        title: 'MediConnect Test Notification',
        message: 'Push delivery check from lab settings.',
        actionUrl: '/lab/notifications',
        actionLabel: 'Open Notifications',
      });

      const data = response?.data || {};

      if (data.sentCount > 0) {
        setNotificationMsg({
          type: 'success',
          text: `Test push sent to ${data.sentCount} device(s).`,
        });
      } else if (data.reason === 'no_subscriptions') {
        setNotificationMsg({
          type: 'error',
          text: 'No subscribed devices found. Enable push on this device first.',
        });
      } else if (data.reason === 'vapid_not_configured') {
        setNotificationMsg({
          type: 'error',
          text: 'Server push is not configured yet (missing VAPID keys).',
        });
      } else {
        setNotificationMsg({
          type: 'error',
          text: 'Push test did not send. Please verify your push setup.',
        });
      }
    } catch (error) {
      setNotificationMsg({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send test push notification.',
      });
    } finally {
      setPushTestSending(false);
    }
  };

  // Appearance Handlers
  const applyTheme = (theme) => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  };

  const handleAppearanceChange = (value) => {
    setAppearance(value);
    applyTheme(value);
    setAppearanceMsg({ type: '', text: '' });
  };

  const handleAppearanceSave = async (e) => {
    e.preventDefault();
    setAppearanceSaving(true);
    setAppearanceMsg({ type: '', text: '' });

    try {
      await authService.updateProfile({ appearancePreference: appearance });
      await refreshUser();
      setAppearanceMsg({ type: 'success', text: 'Appearance preference updated successfully!' });
    } catch (error) {
      setAppearanceMsg({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update appearance preference',
      });
    } finally {
      setAppearanceSaving(false);
    }
  };

  // Password Handlers
  const handlePasswordChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    setPasswordMsg({ type: '', text: '' });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 'none', label: '' };
    if (password.length < 6) return { strength: 'weak', label: 'Weak' };
    if (password.length < 10) return { strength: 'medium', label: 'Medium' };
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const complexityCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    if (complexityCount >= 3) return { strength: 'strong', label: 'Strong' };
    return { strength: 'medium', label: 'Medium' };
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg({ type: '', text: '' });

    // Validation
    if (!passwords.currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Current password is required' });
      setPasswordSaving(false);
      return;
    }
    if (!passwords.newPassword || passwords.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      setPasswordSaving(false);
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      setPasswordSaving(false);
      return;
    }

    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordMsg({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const passwordStrength = getPasswordStrength(passwords.newPassword);

  return (
    <LabLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Lab Settings</h1>
          <p className={styles.subtitle}>
            Manage your profile, work information, security, and preferences
          </p>
        </div>

        {/* Account Status Card (Read-only) */}
        {user && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <Shield className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Account Status</h2>
              </div>
              <p className={styles.sectionDesc}>Your account verification and role information</p>
            </div>
            <div className={styles.readOnlyCard}>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Account Type:</span>
                <span className={styles.statusValue}>Lab Assistant</span>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Verification Status:</span>
                <span
                  className={`${styles.statusBadge} ${
                    user.isVerified ? styles.statusVerified : styles.statusPending
                  }`}
                >
                  {user.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              {!user.isVerified && (
                <p className={styles.statusNote}>
                  Your account is awaiting verification by hospital administration. Some features
                  may be restricted until verification is complete.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Personal Information */}
        <form onSubmit={handleProfileSave} className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleRow}>
              <User className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Personal Information</h2>
            </div>
            <p className={styles.sectionDesc}>Update your personal contact details</p>
          </div>

          {profileMsg.text && (
            <div className={`${styles.message} ${styles[`message${profileMsg.type}`]}`}>
              {profileMsg.text}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Full Name <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWithIcon}>
                <User className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.input}
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  required
                  placeholder="Full Name"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Email <span className={styles.readOnlyLabel}>(Read-only)</span>
              </label>
              <div className={styles.inputWithIcon}>
                <Mail className={styles.inputIcon} />
                <input
                  type="email"
                  className={`${styles.input} ${styles.inputReadOnly}`}
                  value={profile.email}
                  disabled
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Phone Number</label>
              <div className={styles.inputWithIcon}>
                <Phone className={styles.inputIcon} />
                <input
                  type="tel"
                  className={styles.input}
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  placeholder="+977-9800000000"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Gender</label>
              <select
                className={styles.select}
                value={profile.gender}
                onChange={(e) => handleProfileChange('gender', e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className={styles.addressSection}>
            <h3 className={styles.subsectionTitle}>Address</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.label}>Street Address</label>
                <div className={styles.inputWithIcon}>
                  <MapPin className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.input}
                    value={profile.street}
                    onChange={(e) => handleProfileChange('street', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>City</label>
                <input
                  type="text"
                  className={styles.input}
                  value={profile.city}
                  onChange={(e) => handleProfileChange('city', e.target.value)}
                  placeholder="Kathmandu"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Province</label>
                <select
                  className={styles.select}
                  value={profile.province}
                  onChange={(e) => handleProfileChange('province', e.target.value)}
                >
                  <option value="">Select Province</option>
                  {PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Postal Code</label>
                <input
                  type="text"
                  className={styles.input}
                  value={profile.postalCode}
                  onChange={(e) => handleProfileChange('postalCode', e.target.value)}
                  placeholder="44600"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Country</label>
                <input
                  type="text"
                  className={styles.input}
                  value={profile.country}
                  onChange={(e) => handleProfileChange('country', e.target.value)}
                  placeholder="Nepal"
                />
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton} disabled={profileSaving}>
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Work Information */}
        <form onSubmit={handleWorkInfoSave} className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleRow}>
              <Beaker className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Work Information</h2>
            </div>
            <p className={styles.sectionDesc}>
              Manage your laboratory facility and operational details
            </p>
          </div>

          {workMsg.text && (
            <div className={`${styles.message} ${styles[`message${workMsg.type}`]}`}>
              {workMsg.text}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Lab/Facility Name <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWithIcon}>
                <Building2 className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.input}
                  value={workInfo.labName}
                  onChange={(e) => handleWorkInfoChange('labName', e.target.value)}
                  required
                  placeholder="Diagnostic Lab Center"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Lab License Number</label>
              <div className={styles.inputWithIcon}>
                <FileCheck className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.input}
                  value={workInfo.labLicenseNumber}
                  onChange={(e) => handleWorkInfoChange('labLicenseNumber', e.target.value)}
                  placeholder="LAB-2024-001"
                />
              </div>
              <span className={styles.helperText}>
                Official registration number from regulatory authority
              </span>
            </div>

            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Accreditation/Certification</label>
              <div className={styles.inputWithIcon}>
                <Award className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.input}
                  value={workInfo.accreditation}
                  onChange={(e) => handleWorkInfoChange('accreditation', e.target.value)}
                  placeholder="ISO 15189:2012, CAP Accredited"
                />
              </div>
              <span className={styles.helperText}>
                Quality certifications and accreditations
              </span>
            </div>
          </div>

          <div className={styles.servicesSection}>
            <div className={styles.subsectionTitleRow}>
              <Briefcase className={styles.subsectionIcon} />
              <h3 className={styles.subsectionTitle}>
                Services Offered <span className={styles.required}>*</span>
              </h3>
            </div>
            <p className={styles.helperText} style={{ marginBottom: '1rem' }}>
              Select all laboratory services your facility provides
            </p>
            <div className={styles.servicesGrid}>
              {LAB_SERVICES.map((service) => (
                <label key={service} className={styles.serviceCheckbox}>
                  <input
                    type="checkbox"
                    checked={workInfo.servicesOffered.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                  />
                  <span className={styles.checkboxLabel}>{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton} disabled={workSaving}>
              {workSaving ? 'Saving...' : 'Save Work Information'}
            </button>
          </div>
        </form>

        {/* Security Section */}
        <form onSubmit={handlePasswordSave} className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleRow}>
              <Lock className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Security</h2>
            </div>
            <p className={styles.sectionDesc}>Change your password to keep your account secure</p>
          </div>

          {passwordMsg.text && (
            <div className={`${styles.message} ${styles[`message${passwordMsg.type}`]}`}>
              {passwordMsg.text}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Current Password <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordInput}>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  className={styles.input}
                  value={passwords.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  required
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? (
                    <EyeOff className={styles.eyeIcon} />
                  ) : (
                    <Eye className={styles.eyeIcon} />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                New Password <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordInput}>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  className={styles.input}
                  value={passwords.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  required
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? (
                    <EyeOff className={styles.eyeIcon} />
                  ) : (
                    <Eye className={styles.eyeIcon} />
                  )}
                </button>
              </div>
              {passwords.newPassword && (
                <div className={styles.passwordStrength}>
                  <span className={styles.strengthLabel}>Password Strength:</span>
                  <span className={`${styles.strengthBadge} ${styles[passwordStrength.strength]}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Confirm New Password <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordInput}>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  className={styles.input}
                  value={passwords.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  required
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className={styles.eyeIcon} />
                  ) : (
                    <Eye className={styles.eyeIcon} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton} disabled={passwordSaving}>
              {passwordSaving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>

        {/* Notification Preferences */}
        <form onSubmit={handleNotificationSave} className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleRow}>
              <Bell className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Notification Preferences</h2>
            </div>
            <p className={styles.sectionDesc}>
              Choose which notifications you want to receive about lab operations
            </p>
          </div>

          {notificationMsg.text && (
            <div className={`${styles.message} ${styles[`message${notificationMsg.type}`]}`}>
              {notificationMsg.text}
            </div>
          )}

          <div className={styles.notificationList}>
            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <h4 className={styles.notificationTitle}>New Test Assignments</h4>
                <p className={styles.notificationDesc}>
                  Get notified when doctors assign new diagnostic tests to your lab
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.appointments}
                  onChange={() => handleNotificationToggle('appointments')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <h4 className={styles.notificationTitle}>Test Status Updates</h4>
                <p className={styles.notificationDesc}>
                  Get notified about test status changes and completion confirmations
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.cancellations}
                  onChange={() => handleNotificationToggle('cancellations')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <h4 className={styles.notificationTitle}>Report Upload Confirmations</h4>
                <p className={styles.notificationDesc}>
                  Get notified when lab reports are successfully uploaded and delivered
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.prescriptions}
                  onChange={() => handleNotificationToggle('prescriptions')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <h4 className={styles.notificationTitle}>System Notifications</h4>
                <p className={styles.notificationDesc}>
                  Get notified about important system updates and operational alerts
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.labReports}
                  onChange={() => handleNotificationToggle('labReports')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          <div className={styles.pushActions}>
            <p className={styles.helperText}>
              Device push status: {pushEnabled ? 'Enabled' : 'Disabled'}
              {!isPushSupported ? ' (unsupported browser)' : ''}
            </p>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleEnablePush}
              disabled={pushSaving || pushTestSending || !isPushSupported || pushEnabled}
            >
              {pushSaving && !pushEnabled ? 'Enabling...' : 'Enable Push on This Device'}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleDisablePush}
              disabled={pushSaving || pushTestSending || !pushEnabled}
            >
              {pushSaving && pushEnabled ? 'Disabling...' : 'Disable Push on This Device'}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleSendTestPush}
              disabled={pushSaving || pushTestSending}
            >
              {pushTestSending ? 'Sending Test...' : 'Send Test Push'}
            </button>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton} disabled={notificationSaving}>
              {notificationSaving ? 'Saving...' : 'Save Notification Preferences'}
            </button>
          </div>
        </form>

        {/* Appearance Preferences */}
        <form onSubmit={handleAppearanceSave} className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleRow}>
              <Monitor className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Appearance</h2>
            </div>
            <p className={styles.sectionDesc}>Customize how MediConnect looks for you</p>
          </div>

          {appearanceMsg.text && (
            <div className={`${styles.message} ${styles[`message${appearanceMsg.type}`]}`}>
              {appearanceMsg.text}
            </div>
          )}

          <div className={styles.themeOptions}>
            <label
              className={`${styles.themeOption} ${
                appearance === 'light' ? styles.themeOptionActive : ''
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="light"
                checked={appearance === 'light'}
                onChange={(e) => handleAppearanceChange(e.target.value)}
                className={styles.themeRadio}
              />
              <div className={styles.themeContent}>
                <Sun className={styles.themeIcon} />
                <div className={styles.themeText}>
                  <h4 className={styles.themeTitle}>Light Mode</h4>
                  <p className={styles.themeDesc}>Bright and clear interface</p>
                </div>
              </div>
            </label>

            <label
              className={`${styles.themeOption} ${
                appearance === 'dark' ? styles.themeOptionActive : ''
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={appearance === 'dark'}
                onChange={(e) => handleAppearanceChange(e.target.value)}
                className={styles.themeRadio}
              />
              <div className={styles.themeContent}>
                <Moon className={styles.themeIcon} />
                <div className={styles.themeText}>
                  <h4 className={styles.themeTitle}>Dark Mode</h4>
                  <p className={styles.themeDesc}>Easy on the eyes in low light</p>
                </div>
              </div>
            </label>

            <label
              className={`${styles.themeOption} ${
                appearance === 'system' ? styles.themeOptionActive : ''
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="system"
                checked={appearance === 'system'}
                onChange={(e) => handleAppearanceChange(e.target.value)}
                className={styles.themeRadio}
              />
              <div className={styles.themeContent}>
                <Monitor className={styles.themeIcon} />
                <div className={styles.themeText}>
                  <h4 className={styles.themeTitle}>System Default</h4>
                  <p className={styles.themeDesc}>Follow your device settings</p>
                </div>
              </div>
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton} disabled={appearanceSaving}>
              {appearanceSaving ? 'Saving...' : 'Save Appearance Preference'}
            </button>
          </div>
        </form>
      </div>
    </LabLayout>
  );
};

export default Settings;
