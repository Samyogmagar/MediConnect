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
  Building2,
  Settings as SettingsIcon,
  Globe,
  Clock,
  DollarSign,
  ListChecks,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import settingsService from '../../services/settingsService';
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

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Personal Profile State
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

  // Security State
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

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    appointments: true,
    cancellations: true,
    prescriptions: true,
    labReports: true,
  });
  const [notificationMsg, setNotificationMsg] = useState({ type: '', text: '' });
  const [notificationSaving, setNotificationSaving] = useState(false);

  // Appearance State
  const [appearance, setAppearance] = useState('system');
  const [appearanceMsg, setAppearanceMsg] = useState({ type: '', text: '' });
  const [appearanceSaving, setAppearanceSaving] = useState(false);

  // Hospital Settings State
  const [hospitalSettings, setHospitalSettings] = useState({
    hospitalName: '',
    tagline: '',
    contactEmail: '',
    contactPhone: '',
    timezone: 'Asia/Kathmandu',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Nepal',
    departments: '',
    testCategories: '',
    defaultConsultationFee: 1000,
    defaultConsultationDurationMinutes: 30,
  });
  const [hospitalMsg, setHospitalMsg] = useState({ type: '', text: '' });
  const [hospitalSaving, setHospitalSaving] = useState(false);
  const [hospitalLoading, setHospitalLoading] = useState(false);

  // Initialize data
  useEffect(() => {
    if (user) {
      loadUserData(user);
    }
    if (activeTab === 'hospital') {
      loadHospitalSettings();
    }
  }, [user, activeTab]);

  const loadUserData = (currentUser) => {
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

    if (currentUser.notificationPreferences) {
      setNotifications({
        appointments: currentUser.notificationPreferences.appointments !== false,
        cancellations: currentUser.notificationPreferences.cancellations !== false,
        prescriptions: currentUser.notificationPreferences.prescriptions !== false,
        labReports: currentUser.notificationPreferences.labReports !== false,
      });
    }

    const persistedPreference =
      currentUser.appearancePreference ||
      localStorage.getItem('appearancePreference') ||
      'system';

    setAppearance(persistedPreference);
    localStorage.setItem('appearancePreference', persistedPreference);
    applyTheme(persistedPreference);
  };

  const loadHospitalSettings = async () => {
    setHospitalLoading(true);
    try {
      const res = await settingsService.getSettings();
      const settings = res.data?.settings || res.data?.data?.settings || res.data || {};
      setHospitalSettings({
        hospitalName: settings.hospitalName || '',
        tagline: settings.tagline || '',
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        timezone: settings.timezone || 'Asia/Kathmandu',
        street: settings.address?.street || '',
        city: settings.address?.city || '',
        province: settings.address?.province || '',
        postalCode: settings.address?.postalCode || '',
        country: settings.address?.country || 'Nepal',
        departments: Array.isArray(settings.departments) ? settings.departments.join(', ') : '',
        testCategories: Array.isArray(settings.testCategories) ? settings.testCategories.join(', ') : '',
        defaultConsultationFee: settings.defaultConsultationFee || 1000,
        defaultConsultationDurationMinutes: settings.defaultConsultationDurationMinutes || 30,
      });
    } catch (error) {
      console.error('Failed to load hospital settings:', error);
    } finally {
      setHospitalLoading(false);
    }
  };

  // Personal Profile Handlers
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
      await authService.updateProfile({
        notificationPreferences: notifications,
      });
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

  // Appearance Handlers
  const applyTheme = (theme) => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
    } else {
      document.documentElement.dataset.theme = theme;
    }
  };

  const handleAppearanceChange = (value) => {
    setAppearance(value);
    localStorage.setItem('appearancePreference', value);
    applyTheme(value);
    setAppearanceMsg({ type: '', text: '' });
  };

  const handleAppearanceSave = async (e) => {
    e.preventDefault();
    setAppearanceSaving(true);
    setAppearanceMsg({ type: '', text: '' });

    try {
      await authService.updateProfile({ appearancePreference: appearance });
      localStorage.setItem('appearancePreference', appearance);
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

  // Hospital Settings Handlers
  const handleHospitalChange = (field, value) => {
    setHospitalSettings((prev) => ({ ...prev, [field]: value }));
    setHospitalMsg({ type: '', text: '' });
  };

  const handleHospitalSave = async (e) => {
    e.preventDefault();
    setHospitalSaving(true);
    setHospitalMsg({ type: '', text: '' });

    try {
      const payload = {
        hospitalName: hospitalSettings.hospitalName.trim(),
        tagline: hospitalSettings.tagline.trim(),
        contactEmail: hospitalSettings.contactEmail.trim(),
        contactPhone: hospitalSettings.contactPhone.trim(),
        timezone: hospitalSettings.timezone,
        address: {
          street: hospitalSettings.street.trim(),
          city: hospitalSettings.city.trim(),
          province: hospitalSettings.province,
          postalCode: hospitalSettings.postalCode.trim(),
          country: hospitalSettings.country,
        },
        departments: hospitalSettings.departments
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
        testCategories: hospitalSettings.testCategories
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
        defaultConsultationFee: Number(hospitalSettings.defaultConsultationFee) || 1000,
        defaultConsultationDurationMinutes: Number(hospitalSettings.defaultConsultationDurationMinutes) || 30,
      };

      await settingsService.updateSettings(payload);
      setHospitalMsg({ type: 'success', text: 'Hospital settings updated successfully!' });
    } catch (error) {
      setHospitalMsg({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update hospital settings',
      });
    } finally {
      setHospitalSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'hospital', label: 'Hospital', icon: Building2 },
  ];

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Settings</h1>
          <p className={styles.subtitle}>
            Manage your account, hospital configuration, and system preferences
          </p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className={styles.tabIcon} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Account Status Card (Always visible) */}
        {user && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <Shield className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Account Status</h2>
              </div>
              <p className={styles.sectionDesc}>Your administrative account information</p>
            </div>
            <div className={styles.readOnlyCard}>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Role:</span>
                <span className={styles.statusValue}>Administrator</span>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Account Status:</span>
                <span className={`${styles.statusBadge} ${styles.statusActive}`}>Active</span>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Email:</span>
                <span className={styles.statusValue}>{user.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
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
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Country</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={profile.country}
                    onChange={(e) => handleProfileChange('country', e.target.value)}
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
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
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
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleNotificationSave} className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <Bell className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Notification Preferences</h2>
              </div>
              <p className={styles.sectionDesc}>
                Choose which notifications you want to receive about hospital operations
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
                  <h4 className={styles.notificationTitle}>New User Registrations</h4>
                  <p className={styles.notificationDesc}>
                    Get notified when doctors, labs, or new admins register for verification
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
                  <h4 className={styles.notificationTitle}>Appointment Activity</h4>
                  <p className={styles.notificationDesc}>
                    Get notified about appointment cancellations and important changes
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
                  <h4 className={styles.notificationTitle}>Prescription Alerts</h4>
                  <p className={styles.notificationDesc}>
                    Get notified about prescription-related activities requiring attention
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
                  <h4 className={styles.notificationTitle}>Lab Report Alerts</h4>
                  <p className={styles.notificationDesc}>
                    Get notified when lab reports are uploaded and system alerts occur
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

            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryButton} disabled={notificationSaving}>
                {notificationSaving ? 'Saving...' : 'Save Notification Preferences'}
              </button>
            </div>
          </form>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
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
        )}

        {/* Hospital Tab */}
        {activeTab === 'hospital' && (
          <form onSubmit={handleHospitalSave} className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <Building2 className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Hospital Information</h2>
              </div>
              <p className={styles.sectionDesc}>
                Configure hospital profile, departments, and system defaults
              </p>
            </div>

            {hospitalLoading ? (
              <div className={styles.loadingText}>Loading hospital settings...</div>
            ) : (
              <>
                {hospitalMsg.text && (
                  <div className={`${styles.message} ${styles[`message${hospitalMsg.type}`]}`}>
                    {hospitalMsg.text}
                  </div>
                )}

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Hospital Name <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputWithIcon}>
                      <Building2 className={styles.inputIcon} />
                      <input
                        type="text"
                        className={styles.input}
                        value={hospitalSettings.hospitalName}
                        onChange={(e) => handleHospitalChange('hospitalName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tagline</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={hospitalSettings.tagline}
                      onChange={(e) => handleHospitalChange('tagline', e.target.value)}
                      placeholder="Your trusted healthcare partner"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Contact Email</label>
                    <div className={styles.inputWithIcon}>
                      <Mail className={styles.inputIcon} />
                      <input
                        type="email"
                        className={styles.input}
                        value={hospitalSettings.contactEmail}
                        onChange={(e) => handleHospitalChange('contactEmail', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Contact Phone</label>
                    <div className={styles.inputWithIcon}>
                      <Phone className={styles.inputIcon} />
                      <input
                        type="tel"
                        className={styles.input}
                        value={hospitalSettings.contactPhone}
                        onChange={(e) => handleHospitalChange('contactPhone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Timezone</label>
                    <div className={styles.inputWithIcon}>
                      <Globe className={styles.inputIcon} />
                      <input
                        type="text"
                        className={styles.input}
                        value={hospitalSettings.timezone}
                        onChange={(e) => handleHospitalChange('timezone', e.target.value)}
                      />
                    </div>
                    <span className={styles.helperText}>e.g., Asia/Kathmandu</span>
                  </div>
                </div>

                <div className={styles.addressSection}>
                  <h3 className={styles.subsectionTitle}>Hospital Address</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.label}>Street Address</label>
                      <div className={styles.inputWithIcon}>
                        <MapPin className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.input}
                          value={hospitalSettings.street}
                          onChange={(e) => handleHospitalChange('street', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>City</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={hospitalSettings.city}
                        onChange={(e) => handleHospitalChange('city', e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Province</label>
                      <select
                        className={styles.select}
                        value={hospitalSettings.province}
                        onChange={(e) => handleHospitalChange('province', e.target.value)}
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
                        value={hospitalSettings.postalCode}
                        onChange={(e) => handleHospitalChange('postalCode', e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Country</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={hospitalSettings.country}
                        onChange={(e) => handleHospitalChange('country', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.configSection}>
                  <h3 className={styles.subsectionTitle}>
                    <SettingsIcon className={styles.subsectionIcon} />
                    System Configuration
                  </h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.label}>
                        <ListChecks className={styles.inlineLabelIcon} />
                        Departments
                      </label>
                      <textarea
                        className={styles.textarea}
                        value={hospitalSettings.departments}
                        onChange={(e) => handleHospitalChange('departments', e.target.value)}
                        rows="3"
                        placeholder="Cardiology, Neurology, Pediatrics, Orthopedics (comma-separated)"
                      />
                      <span className={styles.helperText}>
                        Enter department names separated by commas
                      </span>
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.label}>
                        <ListChecks className={styles.inlineLabelIcon} />
                        Lab Test Categories
                      </label>
                      <textarea
                        className={styles.textarea}
                        value={hospitalSettings.testCategories}
                        onChange={(e) => handleHospitalChange('testCategories', e.target.value)}
                        rows="3"
                        placeholder="Blood Tests, Urine Analysis, X-Ray, CT Scan (comma-separated)"
                      />
                      <span className={styles.helperText}>
                        Enter lab test categories separated by commas
                      </span>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Default Consultation Fee (NPR)</label>
                      <div className={styles.inputWithIcon}>
                        <DollarSign className={styles.inputIcon} />
                        <input
                          type="number"
                          className={styles.input}
                          value={hospitalSettings.defaultConsultationFee}
                          onChange={(e) =>
                            handleHospitalChange(
                              'defaultConsultationFee',
                              Number(e.target.value) || 0
                            )
                          }
                          min="0"
                        />
                      </div>
                      <span className={styles.helperText}>
                        Default fee for doctor consultations
                      </span>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Default Consultation Duration (minutes)</label>
                      <div className={styles.inputWithIcon}>
                        <Clock className={styles.inputIcon} />
                        <input
                          type="number"
                          className={styles.input}
                          value={hospitalSettings.defaultConsultationDurationMinutes}
                          onChange={(e) =>
                            handleHospitalChange(
                              'defaultConsultationDurationMinutes',
                              Number(e.target.value) || 30
                            )
                          }
                          min="10"
                          max="180"
                        />
                      </div>
                      <span className={styles.helperText}>Typical consultation length: 10-180 minutes</span>
                    </div>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={hospitalSaving}
                  >
                    {hospitalSaving ? 'Saving...' : 'Save Hospital Settings'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default Settings;
