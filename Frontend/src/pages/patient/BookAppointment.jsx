import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, CalendarCheck } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import doctorService from '../../services/doctorService';
import appointmentService from '../../services/appointmentService';
import styles from './BookAppointment.module.css';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const autoFinalizeTriggeredRef = useRef(false);

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [availability, setAvailability] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotMessage, setSlotMessage] = useState('');

  const [formData, setFormData] = useState({
    date: '',
    slot: '',
    reason: '',
    notes: '',
    paymentMethod: 'cod',
    paymentAmount: '',
  });
  const [khaltiPayment, setKhaltiPayment] = useState({ pidx: '', paymentUrl: '' });
  const [formErrors, setFormErrors] = useState({});

  const KHALTI_DRAFT_KEY = 'pendingKhaltiAppointmentDraft';

  const loadSlots = useCallback(async (selectedDate) => {
    if (!selectedDate) {
      setAvailableSlots([]);
      setSlotMessage('');
      return;
    }

    setSlotsLoading(true);
    setSlotMessage('');
    try {
      const response = await doctorService.getDoctorSlots(doctorId, selectedDate);
      const slots = response.data?.slots || response.data?.data?.slots || [];
      setAvailableSlots(slots);
      if (slots.length === 0) {
        setSlotMessage('No available slots for this date.');
      }
    } catch (err) {
      console.error('Error loading slots:', err);
      setAvailableSlots([]);
      setSlotMessage('Unable to load available slots. Please try another date.');
    } finally {
      setSlotsLoading(false);
    }
  }, [doctorId]);

  const fetchDoctor = useCallback(async () => {
    setLoading(true);
    try {
      const [doctorRes, availabilityRes] = await Promise.all([
        doctorService.getDoctorById(doctorId),
        doctorService.getDoctorAvailability(doctorId),
      ]);

      const doctorData = doctorRes.data?.doctor || doctorRes.data?.user || null;
      setDoctor(doctorData);

      const availabilityData = availabilityRes.data?.availability || availabilityRes.data?.data?.availability || null;
      setAvailability(availabilityData);

      if (doctorData) {
        const fee = Number(doctorData?.professionalDetails?.consultationFee) || 500;
        setFormData((prev) => ({ ...prev, paymentAmount: String(fee) }));
      }
    } catch (err) {
      console.error('Error loading doctor:', err);
      setError('Failed to load doctor details.');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const returnedPidx = searchParams.get('pidx');
    const returnedTxn = searchParams.get('transaction_id');

    if (returnedPidx) {
      setFormData((prev) => ({ ...prev, paymentMethod: 'khalti' }));
      setKhaltiPayment((prev) => ({
        ...prev,
        pidx: returnedPidx,
      }));

      const rawDraft = localStorage.getItem(KHALTI_DRAFT_KEY);
      if (!rawDraft) {
        setError('Payment returned, but booking details were not found. Please retry booking.');
        return;
      }

      let draft;
      try {
        draft = JSON.parse(rawDraft);
      } catch {
        setError('Unable to restore pending booking details. Please retry booking.');
        return;
      }

      if (!draft || draft.doctorId !== doctorId) {
        setError('Payment returned for a different booking request. Please retry.');
        return;
      }

      // Restore form for transparency before auto-finalization.
      const draftDate = new Date(draft.dateTime);
      setFormData((prev) => ({
        ...prev,
        date: draftDate.toISOString().split('T')[0],
        slot: draft.dateTime,
        reason: draft.reason,
        notes: draft.notes || '',
        paymentMethod: 'khalti',
        paymentAmount: String(draft.paymentAmount || ''),
      }));

      loadSlots(draftDate.toISOString().split('T')[0]);

      if (autoFinalizeTriggeredRef.current) {
        return;
      }
      autoFinalizeTriggeredRef.current = true;

      const finalizeBooking = async () => {
        try {
          setSubmitting(true);
          setError('');
          setSuccess('Finalizing your appointment booking...');

          await appointmentService.createAppointment({
            doctorId: draft.doctorId,
            dateTime: draft.dateTime,
            reason: draft.reason,
            notes: draft.notes || undefined,
            paymentMethod: 'khalti',
            paymentAmount: Number(draft.paymentAmount),
            khaltiPidx: returnedPidx,
          });

          localStorage.removeItem(KHALTI_DRAFT_KEY);
          setSuccess('Payment successful and appointment request submitted successfully!');

          const nextParams = new URLSearchParams(location.search);
          nextParams.delete('pidx');
          nextParams.delete('transaction_id');
          nextParams.delete('amount');
          nextParams.delete('purchase_order_id');
          nextParams.delete('purchase_order_name');

          setTimeout(() => navigate('/patient/appointments', { replace: true }), 1200);
        } catch (err) {
          const message = err.response?.data?.message || 'Payment succeeded but booking finalization failed. Please click Pay and Book Appointment once.';
          setError(message);
          setSuccess(returnedTxn ? 'Payment detected. You can retry final booking now.' : 'Payment return detected. You can retry final booking now.');
        } finally {
          setSubmitting(false);
        }
      };

      finalizeBooking();
    }
  }, [location.search, doctorId, navigate, loadSlots]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'paymentMethod' && value !== 'khalti') {
      setKhaltiPayment({ pidx: '', paymentUrl: '' });
    }

    if (name === 'date' || name === 'slot' || name === 'reason') {
      setKhaltiPayment({ pidx: '', paymentUrl: '' });
    }

    if (name === 'date') {
      setFormData((prev) => ({ ...prev, slot: '' }));
      loadSlots(value);
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.slot) errors.slot = 'Time slot is required';
    if (!formData.reason.trim()) errors.reason = 'Reason is required';
    if (!formData.paymentMethod) errors.paymentMethod = 'Payment method is required';
    if (formData.slot) {
      const selected = new Date(formData.slot);
      if (selected <= new Date()) {
        errors.slot = 'Selected slot must be in the future';
      }
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const dateTime = formData.slot;

      if (formData.paymentMethod === 'khalti') {
        const bookingDraft = {
          doctorId,
          dateTime,
          reason: formData.reason.trim(),
          notes: formData.notes.trim(),
          paymentAmount: Number(formData.paymentAmount),
          paymentMethod: 'khalti',
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(KHALTI_DRAFT_KEY, JSON.stringify(bookingDraft));

        const response = await appointmentService.initiateKhaltiPayment({
          doctorId,
          dateTime,
          reason: formData.reason.trim(),
          paymentAmount: Number(formData.paymentAmount),
        });

        const payment = response.data?.payment;
        if (!payment?.pidx || !payment?.paymentUrl) {
          throw new Error('Failed to initialize Khalti payment');
        }

        setKhaltiPayment({
          pidx: payment.pidx,
          paymentUrl: payment.paymentUrl,
        });
        window.location.assign(payment.paymentUrl);
        return;
      }

      await appointmentService.createAppointment({
        doctorId,
        dateTime,
        reason: formData.reason.trim(),
        notes: formData.notes.trim() || undefined,
        paymentMethod: 'cod',
        paymentAmount: Number(formData.paymentAmount),
      });

      setSuccess('Booking confirmed successfully!');
      setTimeout(() => navigate('/patient/appointments'), 1200);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to continue booking. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const details = doctor?.professionalDetails || {};
  const hospitalName = details.hospital || 'MediConnect Hospital';
  const paymentLabel = formData.paymentMethod === 'khalti' ? 'Online Payment' : 'Pay at Hospital';
  const displayFee = Number(formData.paymentAmount || details.consultationFee || 0);
  const durationMinutes = availability?.slotDurationMinutes || details.consultationDurationMinutes || 30;

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Book Appointment</h1>
        <p className={styles.pageSubtitle}>Schedule a visit with your doctor</p>

        {loading ? (
          <p className={styles.loadingText}>Loading doctor details...</p>
        ) : !doctor ? (
          <div className={styles.errorBanner}>
            {error || 'Doctor not found.'}
            <Button variant="secondary" size="sm" onClick={() => navigate('/patient/doctors')}>
              Back to Doctors
            </Button>
          </div>
        ) : (
          <div className={styles.layout}>
            {/* Doctor info panel */}
            <div className={styles.doctorPanel}>
              <div className={styles.doctorHeader}>
                <div className={styles.avatar}>
                  {doctor.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h2 className={styles.doctorName}>{doctor.name}</h2>
                  <p className={styles.spec}>{details.specialization || 'General'}</p>
                </div>
                {doctor.isVerified && (
                  <span className={styles.verifiedBadge}>
                    <ShieldCheck size={14} /> Verified
                  </span>
                )}
              </div>

              {details.hospital && (
                <p className={styles.meta}>
                  <MapPin size={14} /> {details.hospital}
                </p>
              )}
              {details.experience > 0 && (
                <p className={styles.meta}>
                  <Star size={14} className={styles.star} /> {details.experience} years experience
                </p>
              )}

              <div className={styles.metaGrid}>
                <span className={styles.metaPill}>Fee: NPR {displayFee || '—'}</span>
                <span className={styles.metaPill}>Duration: {durationMinutes} min</span>
              </div>
            </div>

            {/* Booking form */}
            <div className={styles.formPanel}>
              <h2 className={styles.formTitle}>
                <CalendarCheck size={20} /> Appointment Details
              </h2>

              {success && <div className={styles.successBanner}>{success}</div>}
              {error && <div className={styles.errorBanner}>{error}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`${styles.input} ${formErrors.date ? styles.inputError : ''}`}
                    />
                    {formErrors.date && <p className={styles.fieldError}>{formErrors.date}</p>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Available Slot *</label>
                    <select
                      name="slot"
                      value={formData.slot}
                      onChange={handleChange}
                      className={`${styles.input} ${formErrors.slot ? styles.inputError : ''}`}
                      disabled={!formData.date || slotsLoading}
                    >
                      <option value="">
                        {slotsLoading ? 'Loading slots...' : 'Select a slot'}
                      </option>
                      {availableSlots.map((slot) => (
                        <option key={slot.dateTime} value={slot.dateTime}>
                          {slot.time}
                        </option>
                      ))}
                    </select>
                    {formErrors.slot && <p className={styles.fieldError}>{formErrors.slot}</p>}
                    {slotMessage && <p className={styles.helperText}>{slotMessage}</p>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Reason for Visit *</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Briefly describe your reason for this appointment"
                    rows={3}
                    className={`${styles.textarea} ${formErrors.reason ? styles.inputError : ''}`}
                  />
                  {formErrors.reason && <p className={styles.fieldError}>{formErrors.reason}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional information (optional)"
                    rows={2}
                    className={styles.textarea}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Payment Method *</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className={`${styles.input} ${formErrors.paymentMethod ? styles.inputError : ''}`}
                  >
                    <option value="cod">Pay at Hospital</option>
                    <option value="khalti">Online Payment (Khalti)</option>
                  </select>
                  {formErrors.paymentMethod && (
                    <p className={styles.fieldError}>{formErrors.paymentMethod}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Consultation Amount (NPR) *</label>
                  <input
                    type="number"
                    min="1"
                    name="paymentAmount"
                    value={formData.paymentAmount}
                    onChange={handleChange}
                    className={styles.input}
                    readOnly
                  />
                </div>

                {formData.paymentMethod === 'khalti' && khaltiPayment.pidx && (
                  <div className={styles.formGroup}>
                    <p className={styles.meta}>Payment initialized. pidx: {khaltiPayment.pidx}</p>
                  </div>
                )}

                <div className={styles.formActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/patient/doctors')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={submitting}>
                    {formData.paymentMethod === 'khalti' ? 'Pay Now with Khalti' : 'Confirm Booking'}
                  </Button>
                </div>
              </form>

              <div className={styles.summaryPanel}>
                <div className={styles.summaryHeader}>Booking Summary</div>
                <div className={styles.summaryRow}>
                  <span>Hospital</span>
                  <strong>{hospitalName}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Doctor</span>
                  <strong>{doctor.name}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Specialization</span>
                  <strong>{details.specialization || 'General'}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Date</span>
                  <strong>{formData.date || '—'}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Time</span>
                  <strong>{formData.slot ? new Date(formData.slot).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Consultation Fee</span>
                  <strong>NPR {displayFee || '—'}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Payment Method</span>
                  <strong>{paymentLabel}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Estimated Duration</span>
                  <strong>{durationMinutes} minutes</strong>
                </div>
                <p className={styles.summaryNote}>
                  You can reschedule or cancel up to 2 hours before your slot.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BookAppointment;
