import { useEffect, useState } from 'react';
import { CalendarClock, Save } from 'lucide-react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import doctorService from '../../services/doctorService';
import styles from './Availability.module.css';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const buildDefaultDays = () =>
  DAY_LABELS.map((label, index) => ({
    label,
    dayOfWeek: index,
    isWorking: index >= 1 && index <= 5,
    startTime: '09:00',
    endTime: '17:00',
  }));

const Availability = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(30);
  const [workingDays, setWorkingDays] = useState(buildDefaultDays());

  useEffect(() => {
    const loadAvailability = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await doctorService.getMyAvailability();
        const availability = res.data?.availability || res.data?.data?.availability;

        if (availability) {
          setSlotDurationMinutes(availability.slotDurationMinutes || 30);
          const days = availability.workingDays || [];
          const merged = buildDefaultDays().map((day) => {
            const existing = days.find((d) => Number(d.dayOfWeek) === day.dayOfWeek);
            return existing
              ? {
                  ...day,
                  isWorking: Boolean(existing.isWorking),
                  startTime: existing.startTime || day.startTime,
                  endTime: existing.endTime || day.endTime,
                }
              : day;
          });
          setWorkingDays(merged);
        }
      } catch (err) {
        console.error('Error loading availability:', err);
        setError('Unable to load availability settings.');
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, []);

  const updateDay = (index, field, value) => {
    setWorkingDays((prev) =>
      prev.map((day, idx) =>
        idx === index
          ? {
              ...day,
              [field]: value,
            }
          : day
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        slotDurationMinutes: Number(slotDurationMinutes),
        workingDays: workingDays.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          isWorking: day.isWorking,
          startTime: day.startTime,
          endTime: day.endTime,
        })),
      };

      await doctorService.updateMyAvailability(payload);
      setSuccess('Availability updated successfully.');
    } catch (err) {
      console.error('Error saving availability:', err);
      setError('Failed to update availability.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DoctorLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Availability</h1>
            <p className={styles.subtitle}>Set working days and appointment slot duration.</p>
          </div>
          <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {success && <div className={styles.successBanner}>{success}</div>}

        {loading ? (
          <div className={styles.loading}>Loading availability...</div>
        ) : (
          <>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <CalendarClock size={18} />
                <h2>Slot Duration</h2>
              </div>
              <div className={styles.durationRow}>
                <label className={styles.label}>Duration (minutes)</label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  value={slotDurationMinutes}
                  onChange={(e) => setSlotDurationMinutes(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <CalendarClock size={18} />
                <h2>Working Days</h2>
              </div>
              <div className={styles.daysGrid}>
                {workingDays.map((day, index) => (
                  <div key={day.dayOfWeek} className={styles.dayRow}>
                    <label className={styles.dayLabel}>
                      <input
                        type="checkbox"
                        checked={day.isWorking}
                        onChange={(e) => updateDay(index, 'isWorking', e.target.checked)}
                      />
                      <span>{day.label}</span>
                    </label>
                    <div className={styles.timeInputs}>
                      <input
                        type="time"
                        value={day.startTime}
                        disabled={!day.isWorking}
                        onChange={(e) => updateDay(index, 'startTime', e.target.value)}
                        className={styles.input}
                      />
                      <span className={styles.toLabel}>to</span>
                      <input
                        type="time"
                        value={day.endTime}
                        disabled={!day.isWorking}
                        onChange={(e) => updateDay(index, 'endTime', e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DoctorLayout>
  );
};

export default Availability;
