import { useMemo, useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  Bell,
  Moon,
  Sun,
  Monitor,
  AlertTriangle,
  Camera,
  Eye,
  EyeOff,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
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

const Settings = () => {
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
  });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  const [emergency, setEmergency] = useState({ name: '', phone: '', relationship: '' });
  const [emergencyMsg, setEmergencyMsg] = useState({ type: '', text: '' });
  const [emergencySaving, setEmergencySaving] = useState(false);

  const [notifications, setNotifications] = useState({
    appointments: true,
    cancellations: true,
    prescriptions: true,
    labReports: true,
  });
  const [notificationMsg, setNotificationMsg] = useState({ type: '', text: '' });
  const [notificationSaving, setNotificationSaving] = useState(false);

  const [appearance, setAppearance] = useState('system');
  const [appearanceMsg, setAppearanceMsg] = useState({ type: '', text: '' });
  const [appearanceSaving, setAppearanceSaving] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const applyUserProfile = (currentUser) => {
    if (!currentUser) return;
    const nameParts = (currentUser.name || '').split(' ');
    setProfile({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      dateOfBirth: currentUser.dateOfBirth
        ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0]
        : '',
      gender: currentUser.gender || '',
      street: currentUser.address?.street || '',
      city: currentUser.address?.city || '',
      province: currentUser.address?.province || '',
      postalCode: currentUser.address?.postalCode || '',
      country: currentUser.address?.country || 'Nepal',
    });
    setEmergency({
      name: currentUser.emergencyContact?.name || '',
      phone: currentUser.emergencyContact?.phone || '',
      relationship: currentUser.emergencyContact?.relationship || '',
    });
    setNotifications({
      appointments: currentUser.notificationPreferences?.appointments ?? true,
      cancellations: currentUser.notificationPreferences?.cancellations ?? true,
      prescriptions: currentUser.notificationPreferences?.prescriptions ?? true,
      labReports: currentUser.notificationPreferences?.labReports ?? true,
    });
    setAppearance(currentUser.appearancePreference || 'system');
  };

  useEffect(() => {
    applyUserProfile(user);
  }, [user]);

  useEffect(() => {
    if (!appearance) return;
    localStorage.setItem('appearancePreference', appearance);
    if (appearance === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
      return;
    }
    document.documentElement.dataset.theme = appearance;
  }, [appearance]);

  const handleProfileChange = (field, value) => {
    setProfile((p) => ({ ...p, [field]: value }));
    setProfileMsg({ type: '', text: '' });
  };

  const handleEmergencyChange = (field, value) => {
    setEmergency((e) => ({ ...e, [field]: value }));
    setEmergencyMsg({ type: '', text: '' });
  };

  const handleNotificationToggle = (field) => {
    setNotifications((n) => ({ ...n, [field]: !n[field] }));
    setNotificationMsg({ type: '', text: '' });
  };

  const isValidPhone = (value) => {
    if (!value) return true;
    return /^\+?[0-9\s-]{7,15}$/.test(value);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });
    if (!profile.firstName.trim()) {
      setProfileSaving(false);
      return setProfileMsg({ type: 'error', text: 'First name is required.' });
    }
    if (!isValidPhone(profile.phone)) {
      setProfileSaving(false);
      return setProfileMsg({ type: 'error', text: 'Enter a valid phone number.' });
    }
    try {
      await authService.updateProfile({
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth || undefined,
        gender: profile.gender || undefined,
        address: {
          street: profile.street,
          city: profile.city,
          province: profile.province,
          postalCode: profile.postalCode,
          country: profile.country,
        },
      });
      await refreshUser();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleEmergencySave = async (e) => {
    e.preventDefault();
    setEmergencySaving(true);
    setEmergencyMsg({ type: '', text: '' });
    if (emergency.phone && !isValidPhone(emergency.phone)) {
      setEmergencySaving(false);
      return setEmergencyMsg({ type: 'error', text: 'Enter a valid emergency contact phone.' });
    }
    try {
      await authService.updateProfile({
        emergencyContact: {
          name: emergency.name,
          phone: emergency.phone,
          relationship: emergency.relationship,
        },
      });
      await refreshUser();
      setEmergencyMsg({ type: 'success', text: 'Emergency contact updated.' });
    } catch (err) {
      setEmergencyMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update emergency contact.',
      });
    } finally {
      setEmergencySaving(false);
    }
  };

  const handleNotificationSave = async () => {
    setNotificationSaving(true);
    setNotificationMsg({ type: '', text: '' });
    try {
      await authService.updateProfile({
        notificationPreferences: notifications,
      });
      await refreshUser();
      setNotificationMsg({ type: 'success', text: 'Notification preferences saved.' });
    } catch (err) {
      setNotificationMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save notification preferences.',
      });
    } finally {
      setNotificationSaving(false);
    }
  };

  const handleAppearanceSave = async () => {
    setAppearanceSaving(true);
    setAppearanceMsg({ type: '', text: '' });
    try {
      await authService.updateProfile({
        appearancePreference: appearance,
      });
      await refreshUser();
      setAppearanceMsg({ type: 'success', text: 'Appearance preference saved.' });
    } catch (err) {
      setAppearanceMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save appearance preference.',
      });
    } finally {
      setAppearanceSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
    }
    if (passwords.newPassword.length < 6) {
      return setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
    }
    setPasswordSaving(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeactivate = () => {
    if (window.confirm('Are you sure you want to deactivate your account? This can be reversed.')) {
      alert('Account deactivation is not yet implemented.');
    }
  };

  const passwordStrength = useMemo(() => {
    const value = passwords.newPassword;
    if (!value) return 'empty';
    if (value.length < 6) return 'weak';
    if (/[A-Z]/.test(value) && /[0-9]/.test(value)) return 'strong';
    return 'medium';
  }, [passwords.newPassword]);

  const passwordValid = useMemo(() => {
    return (
      passwords.currentPassword &&
      passwords.newPassword &&
      passwords.confirmPassword &&
      passwords.newPassword === passwords.confirmPassword &&
      passwords.newPassword.length >= 6
    );
  }, [passwords]);

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your profile, security, and preferences</p>
        </div>

        <form className={styles.section} onSubmit={handleProfileSave}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Profile Information</h2>
            <p className={styles.sectionDesc}>Update your personal information and profile picture</p>
          </div>

          <div className={styles.photoRow}>
            <div className={styles.photoAvatar}>
              {user?.profileImageUrl ? <img src={user.profileImageUrl} alt="" /> : <User size={36} />}
              <span className={styles.photoBadge}><Camera size={12} /></span>
            </div>
            <div className={styles.photoInfo}>
              <h4>Profile Photo</h4>
              <p>JPG, PNG or GIF. Max size 2MB</p>
              <div className={styles.photoActions}>
                <button type="button" className={styles.uploadBtn}>Upload New Photo</button>
                <button type="button" className={styles.removeBtn}>Remove</button>
              </div>
            </div>
          </div>

          <div className={styles.divider} />

          {profileMsg.text && (
            <div className={`${styles.msg} ${profileMsg.type === 'error' ? styles.msgError : styles.msgSuccess}`}>
              {profileMsg.text}
            </div>
          )}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>First Name</label>
              <input
                className={styles.input}
                value={profile.firstName}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Last Name</label>
              <input
                className={styles.input}
                value={profile.lastName}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputIcon}>
                <Mail size={16} />
                <input className={styles.input} value={profile.email} disabled />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone Number</label>
              <div className={styles.inputIcon}>
                <Phone size={16} />
                <input
                  className={styles.input}
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  placeholder="+977-9841234567"
                />
              </div>
              <p className={styles.helperText}>We use this for appointment updates.</p>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date of Birth</label>
              <input
                type="date"
                className={styles.input}
                value={profile.dateOfBirth}
                onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Gender</label>
              <select
                className={styles.select}
                value={profile.gender}
                onChange={(e) => handleProfileChange('gender', e.target.value)}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className={styles.subHeader}>
            <MapPin size={16} />
            <span>Address Information</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Street Address</label>
            <input
              className={styles.input}
              value={profile.street}
              onChange={(e) => handleProfileChange('street', e.target.value)}
              placeholder="Thamel, Kathmandu"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>City</label>
              <input
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
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Postal Code</label>
              <input
                className={styles.input}
                value={profile.postalCode}
                onChange={(e) => handleProfileChange('postalCode', e.target.value)}
                placeholder="44600"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Country</label>
              <input
                className={styles.input}
                value={profile.country}
                onChange={(e) => handleProfileChange('country', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => applyUserProfile(user)}>
              Reset
            </button>
            <button type="submit" className={styles.saveBtn} disabled={profileSaving}>
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <form className={styles.section} onSubmit={handlePasswordChange}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><Lock size={18} /></div>
            <div>
              <h2 className={styles.sectionTitle}>Security</h2>
              <p className={styles.sectionDesc}>Keep your account secure by updating your password</p>
            </div>
          </div>

          {passwordMsg.text && (
            <div className={`${styles.msg} ${passwordMsg.type === 'error' ? styles.msgError : styles.msgSuccess}`}>
              {passwordMsg.text}
            </div>
          )}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Current Password</label>
              <div className={styles.inputIcon}>
                <Lock size={16} />
                <input
                  className={styles.input}
                  type={showPasswords.current ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPasswords((s) => ({ ...s, current: !s.current }))}
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>New Password</label>
              <div className={styles.inputIcon}>
                <Lock size={16} />
                <input
                  className={styles.input}
                  type={showPasswords.next ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPasswords((s) => ({ ...s, next: !s.next }))}
                >
                  {showPasswords.next ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className={`${styles.passwordStrength} ${styles[`strength${passwordStrength}`]}`}>
                {passwordStrength === 'empty' ? 'Enter a new password' : `Strength: ${passwordStrength}`}
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Confirm New Password</label>
              <div className={styles.inputIcon}>
                <Lock size={16} />
                <input
                  className={styles.input}
                  type={showPasswords.confirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPasswords((s) => ({ ...s, confirm: !s.confirm }))}
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })}
            >
              Reset
            </button>
            <button type="submit" className={styles.saveBtn} disabled={passwordSaving || !passwordValid}>
              {passwordSaving ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><Bell size={18} /></div>
            <div>
              <h2 className={styles.sectionTitle}>Notification Preferences</h2>
              <p className={styles.sectionDesc}>Choose which updates you want to receive.</p>
            </div>
          </div>

          {notificationMsg.text && (
            <div className={`${styles.msg} ${notificationMsg.type === 'error' ? styles.msgError : styles.msgSuccess}`}>
              {notificationMsg.text}
            </div>
          )}

          <div className={styles.toggleList}>
            <label className={styles.toggleRow}>
              <div>
                <span className={styles.toggleTitle}>Appointment updates</span>
                <span className={styles.toggleDesc}>Reminders, approvals, and schedule changes.</span>
              </div>
              <span className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={notifications.appointments}
                  onChange={() => handleNotificationToggle('appointments')}
                />
                <span className={styles.slider} />
              </span>
            </label>
            <label className={styles.toggleRow}>
              <div>
                <span className={styles.toggleTitle}>Reschedule and cancellation</span>
                <span className={styles.toggleDesc}>Get alerted for changes to your slots.</span>
              </div>
              <span className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={notifications.cancellations}
                  onChange={() => handleNotificationToggle('cancellations')}
                />
                <span className={styles.slider} />
              </span>
            </label>
            <label className={styles.toggleRow}>
              <div>
                <span className={styles.toggleTitle}>Prescription updates</span>
                <span className={styles.toggleDesc}>When a doctor issues or updates medication.</span>
              </div>
              <span className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={notifications.prescriptions}
                  onChange={() => handleNotificationToggle('prescriptions')}
                />
                <span className={styles.slider} />
              </span>
            </label>
            <label className={styles.toggleRow}>
              <div>
                <span className={styles.toggleTitle}>Lab report ready</span>
                <span className={styles.toggleDesc}>Get notified when results are uploaded.</span>
              </div>
              <span className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={notifications.labReports}
                  onChange={() => handleNotificationToggle('labReports')}
                />
                <span className={styles.slider} />
              </span>
            </label>
          </div>

          <div className={styles.formActions}>
            <button className={styles.saveBtn} type="button" onClick={handleNotificationSave} disabled={notificationSaving}>
              {notificationSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><Monitor size={18} /></div>
            <div>
              <h2 className={styles.sectionTitle}>Appearance</h2>
              <p className={styles.sectionDesc}>Choose a theme that feels comfortable.</p>
            </div>
          </div>

          {appearanceMsg.text && (
            <div className={`${styles.msg} ${appearanceMsg.type === 'error' ? styles.msgError : styles.msgSuccess}`}>
              {appearanceMsg.text}
            </div>
          )}

          <div className={styles.appearanceGrid}>
            <button
              type="button"
              className={`${styles.appearanceCard} ${appearance === 'light' ? styles.appearanceActive : ''}`}
              onClick={() => setAppearance('light')}
            >
              <Sun size={18} /> Light Mode
            </button>
            <button
              type="button"
              className={`${styles.appearanceCard} ${appearance === 'dark' ? styles.appearanceActive : ''}`}
              onClick={() => setAppearance('dark')}
            >
              <Moon size={18} /> Dark Mode
            </button>
            <button
              type="button"
              className={`${styles.appearanceCard} ${appearance === 'system' ? styles.appearanceActive : ''}`}
              onClick={() => setAppearance('system')}
            >
              <Monitor size={18} /> System Default
            </button>
          </div>

          <div className={styles.formActions}>
            <button className={styles.saveBtn} type="button" onClick={handleAppearanceSave} disabled={appearanceSaving}>
              {appearanceSaving ? 'Saving...' : 'Save Appearance'}
            </button>
          </div>
        </div>

        <form className={styles.section} onSubmit={handleEmergencySave}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><AlertTriangle size={18} /></div>
            <div>
              <h2 className={styles.sectionTitle}>Emergency Contact</h2>
              <p className={styles.sectionDesc}>Optional contact in case of urgent medical coordination.</p>
            </div>
          </div>

          {emergencyMsg.text && (
            <div className={`${styles.msg} ${emergencyMsg.type === 'error' ? styles.msgError : styles.msgSuccess}`}>
              {emergencyMsg.text}
            </div>
          )}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Contact Name</label>
              <input
                className={styles.input}
                value={emergency.name}
                onChange={(e) => handleEmergencyChange('name', e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Relationship</label>
              <input
                className={styles.input}
                value={emergency.relationship}
                onChange={(e) => handleEmergencyChange('relationship', e.target.value)}
                placeholder="Parent, spouse, guardian"
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone Number</label>
              <input
                className={styles.input}
                value={emergency.phone}
                onChange={(e) => handleEmergencyChange('phone', e.target.value)}
                placeholder="+977-98XXXXXXXX"
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={styles.saveBtn} type="submit" disabled={emergencySaving}>
              {emergencySaving ? 'Saving...' : 'Save Emergency Contact'}
            </button>
          </div>
        </form>

        <div className={`${styles.section} ${styles.dangerZone}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Danger Zone</h2>
            <p className={styles.sectionDesc}>Account actions that require confirmation.</p>
          </div>
          <div className={styles.dangerContent}>
            <div>
              <h4>Deactivate account</h4>
              <p>Temporarily disable your account. You can reactivate by contacting hospital support.</p>
            </div>
            <button type="button" className={styles.dangerBtn} onClick={handleDeactivate}>
              Request Deactivation
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
