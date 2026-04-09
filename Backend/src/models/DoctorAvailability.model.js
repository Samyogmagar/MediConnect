import mongoose from 'mongoose';

const workingDaySchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    isWorking: {
      type: Boolean,
      default: true,
    },
    startTime: {
      type: String,
      default: '09:00',
      trim: true,
    },
    endTime: {
      type: String,
      default: '17:00',
      trim: true,
    },
  },
  { _id: false }
);

const exceptionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
      min: 10,
      max: 180,
    },
    workingDays: {
      type: [workingDaySchema],
      default: [],
    },
    exceptions: {
      type: [exceptionSchema],
      default: [],
    },
    timezone: {
      type: String,
      default: 'Asia/Kathmandu',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const DoctorAvailability = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);

export default DoctorAvailability;
