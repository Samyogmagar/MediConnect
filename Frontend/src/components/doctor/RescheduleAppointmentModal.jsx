import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import doctorService from '../../services/doctorService';
import styles from './RescheduleAppointmentModal.module.css';

const toLocalDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  const tzOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().split('T')[0];
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const RescheduleAppointmentModal = ({ open, appointment, onClose, onSubmit, submitting = false }) => {
  const [date, setDate] = useState('');
  const [slotDateTime, setSlotDateTime] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');

  const doctorId = appointment?.doctorId?._id || appointment?.doctorId;

  useEffect(() => {
    if (!open || !appointment) return;

    setDate(toLocalDate(appointment.dateTime));
    setSlotDateTime('');
    setCustomTime('');
    setReason('');
    setNotes('');
    setError('');
  }, [open, appointment]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!open || !doctorId || !date) {
        setSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const res = await doctorService.getDoctorSlots(doctorId, date);
        const fetched = res?.data?.slots || res?.data?.data?.slots || [];
        setSlots(fetched);
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [open, doctorId, date]);

  const minDate = useMemo(() => toLocalDate(new Date()), []);

  if (!open || !appointment) return null;

  const buildDateTimeFromCustomTime = () => {
    if (!date || !customTime) return null;
    const composed = new Date(`${date}T${customTime}`);
    if (Number.isNaN(composed.getTime())) return null;
    return composed;
  };

  const handleSubmit = () => {
    setError('');

    if (!date) {
      setError('Please select a new date.');
      return;
    }

    if (!reason.trim()) {
      setError('Reschedule reason is required.');
      return;
    }

    let selectedDateTime = null;
    if (slotDateTime) {
      selectedDateTime = new Date(slotDateTime);
    } else {
      selectedDateTime = buildDateTimeFromCustomTime();
    }

    if (!selectedDateTime || Number.isNaN(selectedDateTime.getTime())) {
      setError('Please select a valid time or available slot.');
      return;
    }

    if (selectedDateTime <= new Date()) {
      setError('New appointment time must be in the future.');
      return;
    }

    onSubmit?.({
      dateTime: selectedDateTime.toISOString(),
      reason: reason.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Reschedule Appointment</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Patient</span>
            <strong>{appointment.patientId?.name || 'Unknown'}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Current Schedule</span>
            <strong>{formatDateTime(appointment.dateTime)}</strong>
          </div>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.fieldLabel}>
            <span>
              <Calendar size={14} /> New Date
            </span>
            <input type="date" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label className={styles.fieldLabel}>
            <span>
              <Clock size={14} /> Available Slots
            </span>
            <select
              value={slotDateTime}
              onChange={(e) => {
                setSlotDateTime(e.target.value);
                if (e.target.value) setCustomTime('');
              }}
              disabled={loadingSlots || slots.length === 0}
            >
              <option value="">{loadingSlots ? 'Loading slots...' : 'Select a slot'}</option>
              {slots.map((slot) => (
                <option key={slot.dateTime} value={slot.dateTime}>
                  {slot.time || formatDateTime(slot.dateTime)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={styles.fieldLabel}>
          <span>Manual Time (if no slot available)</span>
          <input
            type="time"
            value={customTime}
            onChange={(e) => {
              setCustomTime(e.target.value);
              if (e.target.value) setSlotDateTime('');
            }}
          />
        </label>

        <label className={styles.fieldLabel}>
          <span>Reason for Reschedule</span>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this appointment needs to be rescheduled"
          />
        </label>

        <label className={styles.fieldLabel}>
          <span>Additional Notes (optional)</span>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional context for patient and admin"
          />
        </label>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Rescheduling...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleAppointmentModal;
