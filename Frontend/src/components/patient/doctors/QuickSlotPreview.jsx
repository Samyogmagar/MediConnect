import { useEffect, useMemo, useRef, useState } from 'react';
import doctorService from '../../../services/doctorService';
import styles from './QuickSlotPreview.module.css';

const SLOT_LOOKAHEAD_DAYS = 7;
const SLOT_SHOW_LIMIT = 4;

const toLocalDateString = (date) => {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().split('T')[0];
};

const getRelativeDayLabel = (offset, date) => {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

const normalizeSlot = (slot, dayLabel, dateIso) => {
  const timeLabel =
    slot.time ||
    new Date(slot.dateTime).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

  return {
    dateTime: slot.dateTime,
    time: timeLabel,
    dayLabel,
    date: dateIso,
  };
};

const QuickSlotPreview = ({ doctorId, onStatusChange, onSlotClick }) => {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    let isMounted = true;

    const loadQuickSlots = async () => {
      setLoading(true);
      const collectedSlots = [];
      let status = 'unavailable';
      let label = 'On Leave / Unavailable';

      for (let offset = 0; offset < SLOT_LOOKAHEAD_DAYS; offset += 1) {
        const date = new Date();
        date.setDate(date.getDate() + offset);

        const dateIso = toLocalDateString(date);
        const dayLabel = getRelativeDayLabel(offset, date);

        try {
          const response = await doctorService.getDoctorSlots(doctorId, dateIso);
          const daySlots = response.data?.slots || response.data?.data?.slots || [];

          if (daySlots.length > 0) {
            if (collectedSlots.length === 0) {
              if (offset === 0) {
                status = 'available_today';
                label = 'Available Today';
              } else if (offset === 1) {
                status = 'next_tomorrow';
                label = 'Next Available Tomorrow';
              } else {
                status = 'upcoming';
                label = `Next Available ${dayLabel}`;
              }
            }

            daySlots.forEach((slot) => {
              if (collectedSlots.length < SLOT_SHOW_LIMIT + 1) {
                collectedSlots.push(normalizeSlot(slot, dayLabel, dateIso));
              }
            });
          }

          if (collectedSlots.length >= SLOT_SHOW_LIMIT + 1) {
            break;
          }
        } catch {
          // ignore individual day failures and continue scanning next days
        }
      }

      if (!isMounted) return;

      setSlots(collectedSlots);
      setLoading(false);
      onStatusChangeRef.current?.(doctorId, {
        status,
        label,
        slotCount: collectedSlots.length,
      });
    };

    loadQuickSlots();

    return () => {
      isMounted = false;
    };
  }, [doctorId]);

  const visibleSlots = useMemo(() => slots.slice(0, SLOT_SHOW_LIMIT), [slots]);
  const overflowCount = Math.max(slots.length - SLOT_SHOW_LIMIT, 0);

  if (loading) {
    return (
      <div className={styles.loadingRow}>
        <span className={styles.loadingPill} />
        <span className={styles.loadingPill} />
        <span className={styles.loadingPill} />
      </div>
    );
  }

  if (visibleSlots.length === 0) {
    return <p className={styles.emptyText}>No quick slots in the next 7 days.</p>;
  }

  return (
    <div className={styles.slotWrap}>
      {visibleSlots.map((slot) => (
        <button
          key={slot.dateTime}
          type="button"
          className={styles.slotBtn}
          onClick={() => onSlotClick(slot)}
        >
          <span>{slot.dayLabel}</span>
          <strong>{slot.time}</strong>
        </button>
      ))}
      {overflowCount > 0 && <span className={styles.moreTag}>+{overflowCount} more</span>}
    </div>
  );
};

export default QuickSlotPreview;
