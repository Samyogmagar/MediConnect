import DoctorAvailability from '../models/DoctorAvailability.model.js';
import Appointment from '../models/Appointment.model.js';

const DEFAULT_WORKING_DAYS = [
  { dayOfWeek: 1, isWorking: true, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 2, isWorking: true, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 3, isWorking: true, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 4, isWorking: true, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 5, isWorking: true, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 6, isWorking: false, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 0, isWorking: false, startTime: '09:00', endTime: '17:00' },
];

const toMinutes = (timeStr) => {
  if (!timeStr || !/^[0-2]\d:[0-5]\d$/.test(timeStr)) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const toTimeString = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const normalizeDateOnly = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseDateOnly = (dateString) => {
  if (!/\d{4}-\d{2}-\d{2}/.test(dateString)) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

class AvailabilityService {
  async _ensureAvailability(doctorId) {
    let availability = await DoctorAvailability.findOne({ doctorId });
    if (!availability) {
      availability = await DoctorAvailability.create({
        doctorId,
        slotDurationMinutes: 30,
        workingDays: DEFAULT_WORKING_DAYS,
      });
    }
    return availability;
  }

  async getAvailability(doctorId) {
    return this._ensureAvailability(doctorId);
  }

  async updateAvailability(doctorId, payload) {
    const availability = await this._ensureAvailability(doctorId);

    if (payload.slotDurationMinutes !== undefined) {
      availability.slotDurationMinutes = Number(payload.slotDurationMinutes);
    }

    if (Array.isArray(payload.workingDays)) {
      availability.workingDays = payload.workingDays.map((day) => ({
        dayOfWeek: Number(day.dayOfWeek),
        isWorking: Boolean(day.isWorking),
        startTime: day.startTime || '09:00',
        endTime: day.endTime || '17:00',
      }));
    }

    if (Array.isArray(payload.exceptions)) {
      availability.exceptions = payload.exceptions.map((exception) => ({
        date: exception.date ? new Date(exception.date) : undefined,
        isAvailable: Boolean(exception.isAvailable),
        startTime: exception.startTime,
        endTime: exception.endTime,
        reason: exception.reason,
      }));
    }

    await availability.save();
    return availability;
  }

  _resolveDaySchedule(availability, date) {
    const exception = (availability.exceptions || []).find((ex) =>
      ex.date && isSameDay(new Date(ex.date), date)
    );

    if (exception) {
      if (!exception.isAvailable) {
        return null;
      }
      if (exception.startTime && exception.endTime) {
        return {
          isWorking: true,
          startTime: exception.startTime,
          endTime: exception.endTime,
        };
      }
    }

    const dayOfWeek = date.getDay();
    return (availability.workingDays || []).find((day) => day.dayOfWeek === dayOfWeek) || null;
  }

  _buildSlots(date, schedule, slotDurationMinutes, bookedTimesSet) {
    if (!schedule || !schedule.isWorking) return [];

    const startMinutes = toMinutes(schedule.startTime);
    const endMinutes = toMinutes(schedule.endTime);

    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) return [];

    const slots = [];
    for (let minutes = startMinutes; minutes + slotDurationMinutes <= endMinutes; minutes += slotDurationMinutes) {
      const time = toTimeString(minutes);
      const slotDate = new Date(date);
      const [h, m] = time.split(':').map(Number);
      slotDate.setHours(h, m, 0, 0);

      const iso = slotDate.toISOString();
      if (bookedTimesSet.has(iso)) continue;

      slots.push({
        time,
        dateTime: iso,
      });
    }

    return slots;
  }

  async getSlotsForDate(doctorId, dateString) {
    const date = parseDateOnly(dateString);
    if (!date) {
      throw { statusCode: 400, message: 'Invalid date format. Use YYYY-MM-DD.' };
    }

    const availability = await this._ensureAvailability(doctorId);
    const schedule = this._resolveDaySchedule(availability, date);

    if (!schedule || !schedule.isWorking) {
      return { availability, slots: [] };
    }

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctorId,
      dateTime: { $gte: start, $lte: end },
      status: { $in: ['pending', 'confirmed', 'approved'] },
    }).select('dateTime');

    const bookedTimesSet = new Set(appointments.map((apt) => apt.dateTime.toISOString()));
    let slots = this._buildSlots(date, schedule, availability.slotDurationMinutes, bookedTimesSet);

    const now = new Date();
    if (isSameDay(date, now)) {
      slots = slots.filter((slot) => new Date(slot.dateTime) > now);
    }

    return { availability, slots };
  }

  async ensureSlotIsAvailable(doctorId, dateTime) {
    const target = new Date(dateTime);
    if (Number.isNaN(target.getTime())) {
      throw { statusCode: 400, message: 'Invalid appointment date/time' };
    }

    const dateString = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(
      target.getDate()
    ).padStart(2, '0')}`;
    const { slots } = await this.getSlotsForDate(doctorId, dateString);
    const match = slots.find((slot) => slot.dateTime === target.toISOString());

    if (!match) {
      throw { statusCode: 409, message: 'Selected time slot is no longer available' };
    }

    return true;
  }
}

export default new AvailabilityService();
