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
  Stethoscope,
  Award,
  Briefcase,
  DollarSign,
  Clock,
  Calendar,
  Shield,
  BookOpen,
  Building2,
} from 'lucide-react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
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

const SPECIALIZATIONS = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'Psychiatry',
  'Gynecology',
  'Ophthalmology',
  'ENT',
  'Dentistry',
  'Radiology',
  'Surgery',
  'Oncology',
  'Endocrinology',
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

  // Professional Information State
  const [professional, setProfessional] = useState({
    licenseNumber: '',
    specialization: '',
    qualifications: [''],
    hospital: '',
    experience: '',
    consultationFee: '',
    consultationDurationMinutes: '',
    bio: '',
  });
  const [professionalMsg, setProfessionalMsg] = useState({ type: '', text: '' });
  const [professionalSaving, setProfessionalSaving] = useState(false);

  // Availability State
  const [availability, setAvailability] = useState({
    slotDurationMinutes: 30,
    workingDays: [],
  });
  const [availabilityMsg, setAvailabilityMsg] = useState({ type: '', text: '' });
  const [availabilitySaving, setAvailabilitySaving] = useState(false);

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

    // Load professional information
    const pd = currentUser.professionalDetails || {};
    setProfessional({
      licenseNumber: pd.licenseNumber || '',
      specialization: pd.specialization || '',
      qualifications: pd.qualifications?.length > 0 ? pd.qualifications : [''],
      hospital: pd.hospital || '',
      experience: pd.experience || '',
      consultationFee: pd.consultationFee || '',
      consultationDurationMinutes: pd.consultationDurationMinutes || 30,
      bio: pd.bio || '',
    });

    // Load notification preferences
    if (currentUser.notificationPreferences) {
      setNotifications({
        appointments: currentUser.notificationPreferences.appointments !== false,
        cancellations: currentUser.notificationPreferences.cancellations !== false,
        prescriptions: currentUser.notificationPreferences.prescriptions !== false,
        labReports: currentUser.notificationPreferences.labReports !== false,
      });
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

  // Professional Information Handlers
  const handleProfessionalChange = (field, value) => {
    setProfessional((prev) => ({ ...prev, [field]: value }));
    setProfessionalMsg({ type: '', text: '' });
  };

  const handleQualificationChange = (index, value) => {
    const newQualifications = [...professional.qualifications];
    newQualifications[index] = value;
    setProfessional((prev) => ({ ...prev, qualifications: newQualifications }));
    setProfessionalMsg({ type: '', text: '' });
  };

  const addQualification = () => {
    setProfessional((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, ''],
    }));
  };

  const removeQualification = (index) => {
    const newQualifications = professional.qualifications.filter((_, i) => i !== index);
    setProfessional((prev) => ({
      ...prev,
      qualifications: newQualifications.length > 0 ? newQualifications : [''],
    }));
  };

  const handleProfessionalSave = async (e) => {
    e.preventDefault();
    setProfessionalSaving(true);
    setProfessionalMsg({ type: '', text: '' });

    // Validation
    const filteredQualifications = professional.qualifications.filter((q) => q.trim() !== '');
    if (filteredQualifications.length === 0) {
      setProfessionalMsg({ type: 'error', text: 'At least one qualification is required' });
      setProfessionalSaving(false);
      return;
    }

    if (!professional.consultationFee || professional.consultationFee < 0) {
      setProfessionalMsg({ type: 'error', text: 'Please enter a valid consultation fee' });
      setProfessionalSaving(false);
      return;
    }

    if (
      !professional.consultationDurationMinutes ||
      professional.consultationDurationMinutes < 10 ||
      professional.consultationDurationMinutes > 180
    ) {
      setProfessionalMsg({
        type: 'error',
        text: 'Consultation duration must be between 10-180 minutes',
      });
      setProfessionalSaving(false);
      return;
    }

    try {
      const updates = {
        professionalDetails: {
          specialization: professional.specialization,
          qualifications: filteredQualifications,
          hospital: professional.hospital.trim(),
          experience: parseInt(professional.experience) || 0,
          consultationFee: parseFloat(professional.consultationFee),
          consultationDurationMinutes: parseInt(professional.consultationDurationMinutes),
          bio: professional.bio.trim(),
        },
      };

      await authService.updateProfile(updates);
      await refreshUser();
      setProfessionalMsg({
        type: 'success',
        text: 'Professional information updated successfully!',
      });
    } catch (error) {
      setProfessionalMsg({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update professional information',
      });
    } finally {
      setProfessionalSaving(false);
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
    <DoctorLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Doctor Settings</h1>
          <p className={styles.subtitle}>
            Manage your profile, availability, security, and preferences
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
                <span className={styles.statusValue}>Doctor</span>
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
                  placeholder="Dr. John Doe"
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

        {/* Professional Information */}
        <form onSubmit={handleProfessionalSave} className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleRow}>
              <Stethoscope className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Professional Information</h2>
            </div>
            <p className={styles.sectionDesc}>
              Manage your medical credentials and practice details
            </p>
          </div>

          {professionalMsg.text && (
            <div
              className={`${styles.message} ${styles[`message${professionalMsg.type}`]}`}
            >
              {professionalMsg.text}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Medical License Number <span className={styles.readOnlyLabel}>(Read-only)</span>
              </label>
              <div className={styles.inputWithIcon}>
                <Shield className={styles.inputIcon} />
                <input
                  type="text"
                  className={`${styles.input} ${styles.inputReadOnly}`}
                  value={professional.licenseNumber || 'Not specified'}
                  disabled
                />
              </div>
              <span className={styles.helperText}>
                License number is set by hospital administration
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Specialization <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                value={professional.specialization}
                onChange={(e) => handleProfessionalChange('specialization', e.target.value)}
                required
              >
                <option value="">Select Specialization</option>
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Hospital/Clinic Name <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWithIcon}>
                <Building2 className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.input}
                  value={professional.hospital}
                  onChange={(e) => handleProfessionalChange('hospital', e.target.value)}
                  required
                  placeholder="Medical Center Name"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Years of Experience</label>
              <div className={styles.inputWithIcon}>
                <Briefcase className={styles.inputIcon} />
                <input
                  type="number"
                  className={styles.input}
                  value={professional.experience}
                  onChange={(e) => handleProfessionalChange('experience', e.target.value)}
                  min="0"
                  placeholder="5"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Consultation Fee (NPR) <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWithIcon}>
                <DollarSign className={styles.inputIcon} />
                <input
                  type="number"
                  className={styles.input}
                  value={professional.consultationFee}
                  onChange={(e) => handleProfessionalChange('consultationFee', e.target.value)}
                  required
                  min="0"
                  placeholder="1000"
                />
              </div>
              <span className={styles.helperText}>Amount charged per consultation</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Consultation Duration (minutes) <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWithIcon}>
                <Clock className={styles.inputIcon} />
                <input
                  type="number"
                  className={styles.input}
                  value={professional.consultationDurationMinutes}
                  onChange={(e) =>
                    handleProfessionalChange('consultationDurationMinutes', e.target.value)
                  }
                  required
                  min="10"
                  max="180"
                  placeholder="30"
                />
              </div>
              <span className={styles.helperText}>Typical duration: 10-180 minutes</span>
            </div>
          </div>

          <div className={styles.qualificationsSection}>
            <div className={styles.subsectionTitleRow}>
              <Award className={styles.subsectionIcon} />
              <h3 className={styles.subsectionTitle}>
                Qualifications <span className={styles.required}>*</span>
              </h3>
            </div>
            {professional.qualifications.map((qual, index) => (
              <div key={index} className={styles.qualificationRow}>
                <input
                  type="text"
                  className={styles.input}
                  value={qual}
                  onChange={(e) => handleQualificationChange(index, e.target.value)}
                  placeholder="e.g., MBBS, MD (Cardiology)"
                />
                {professional.qualifications.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeQualification(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" className={styles.addButton} onClick={addQualification}>
              + Add Qualification
            </button>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <BookOpen className={styles.inlineLabelIcon} />
              Professional Bio
            </label>
            <textarea
              className={styles.textarea}
              value={professional.bio}
              onChange={(e) => handleProfessionalChange('bio', e.target.value)}
              rows="4"
              maxLength="500"
              placeholder="Brief introduction about your medical practice, areas of expertise, and approach to patient care..."
            />
            <span className={styles.helperText}>
              {professional.bio.length}/500 characters
            </span>
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={professionalSaving}
            >
              {professionalSaving ? 'Saving...' : 'Save Professional Information'}
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
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={passwordSaving}
            >
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
              Choose which notifications you want to receive about your practice
            </p>
          </div>

          {notificationMsg.text && (
            <div
              className={`${styles.message} ${styles[`message${notificationMsg.type}`]}`}
            >
              {notificationMsg.text}
            </div>
          )}

          <div className={styles.notificationList}>
            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <h4 className={styles.notificationTitle}>New Appointments</h4>
                <p className={styles.notificationDesc}>
                  Get notified when patients book appointments with you
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
                <h4 className={styles.notificationTitle}>Appointment Cancellations</h4>
                <p className={styles.notificationDesc}>
                  Get notified when appointments are cancelled by patients
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
                <h4 className={styles.notificationTitle}>Prescription Updates</h4>
                <p className={styles.notificationDesc}>
                  Get notified about prescription-related activities
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
                <h4 className={styles.notificationTitle}>Lab Reports</h4>
                <p className={styles.notificationDesc}>
                  Get notified when lab reports are uploaded for your patients
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
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={notificationSaving}
            >
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
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={appearanceSaving}
            >
              {appearanceSaving ? 'Saving...' : 'Save Appearance Preference'}
            </button>
          </div>
        </form>
      </div>
    </DoctorLayout>
  );
};

export default Settings;
