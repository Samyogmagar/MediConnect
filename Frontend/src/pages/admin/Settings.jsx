import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import settingsService from '../../services/settingsService';
import styles from './Settings.module.css';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsService.getSettings();
      setSettings(res.data?.settings || res.data?.data?.settings || res.data?.settings || {});
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        ...settings,
        departments: (settings.departments || '').split(',').map((d) => d.trim()).filter(Boolean),
        testCategories: (settings.testCategories || '').split(',').map((d) => d.trim()).filter(Boolean),
      };
      await settingsService.updateSettings(payload);
      setMessage('Settings saved successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.loading}>Loading settings...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Hospital Settings</h1>
          <p className={styles.subtitle}>Configure hospital profile, departments, and lab categories.</p>
        </div>

        {message && <div className={styles.message}>{message}</div>}

        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <label className={styles.formField}>
              Hospital Name
              <input value={settings?.hospitalName || ''} onChange={(e) => handleChange('hospitalName', e.target.value)} />
            </label>
            <label className={styles.formField}>
              Tagline
              <input value={settings?.tagline || ''} onChange={(e) => handleChange('tagline', e.target.value)} />
            </label>
            <label className={styles.formField}>
              Contact Email
              <input type="email" value={settings?.contactEmail || ''} onChange={(e) => handleChange('contactEmail', e.target.value)} />
            </label>
            <label className={styles.formField}>
              Contact Phone
              <input value={settings?.contactPhone || ''} onChange={(e) => handleChange('contactPhone', e.target.value)} />
            </label>
            <label className={styles.formField}>
              Timezone
              <input value={settings?.timezone || ''} onChange={(e) => handleChange('timezone', e.target.value)} />
            </label>
            <label className={styles.formField}>
              Default Consultation Fee
              <input type="number" value={settings?.defaultConsultationFee || 0} onChange={(e) => handleChange('defaultConsultationFee', Number(e.target.value || 0))} />
            </label>
            <label className={styles.formField}>
              Default Consultation Duration (minutes)
              <input type="number" value={settings?.defaultConsultationDurationMinutes || 30} onChange={(e) => handleChange('defaultConsultationDurationMinutes', Number(e.target.value || 30))} />
            </label>
            <label className={styles.formField}>
              Departments (comma separated)
              <input
                value={Array.isArray(settings?.departments) ? settings.departments.join(', ') : settings?.departments || ''}
                onChange={(e) => handleChange('departments', e.target.value)}
              />
            </label>
            <label className={styles.formField}>
              Lab Test Categories (comma separated)
              <input
                value={Array.isArray(settings?.testCategories) ? settings.testCategories.join(', ') : settings?.testCategories || ''}
                onChange={(e) => handleChange('testCategories', e.target.value)}
              />
            </label>
          </div>

          <div className={styles.formFooter}>
            <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
