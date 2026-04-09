import mongoose from 'mongoose';

/**
 * Medication Schema
 * Manages medication prescriptions from doctors to patients
 */
const medicationSchema = new mongoose.Schema(
  {
    // References
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required'],
      index: true,
    },

    // Medication Details
    medicationName: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
      // e.g., "500mg", "10ml", "2 tablets"
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true,
      enum: {
        values: [
          'once_daily',
          'twice_daily',
          'three_times_daily',
          'four_times_daily',
          'every_6_hours',
          'every_8_hours',
          'every_12_hours',
          'as_needed',
          'before_meals',
          'after_meals',
          'at_bedtime',
        ],
        message: 'Invalid frequency',
      },
    },
    frequencyTimes: {
      type: [String],
      // e.g., ["08:00", "14:00", "20:00"] for three_times_daily
      validate: {
        validator: function (times) {
          if (!times || times.length === 0) return true;
          // Validate HH:MM format
          const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
          return times.every((time) => timeRegex.test(time));
        },
        message: 'Times must be in HH:MM format (24-hour)',
      },
    },
    duration: {
      value: {
        type: Number,
        required: [true, 'Duration value is required'],
        min: [1, 'Duration must be at least 1'],
      },
      unit: {
        type: String,
        required: [true, 'Duration unit is required'],
        enum: {
          values: ['days', 'weeks', 'months'],
          message: 'Invalid duration unit',
        },
      },
    },

    // Dates
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      // Auto-calculated by pre-save hook, not user-provided
    },

    // Additional Information
    instructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Instructions cannot exceed 500 characters'],
      // e.g., "Take with food", "Avoid alcohol"
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [200, 'Reason cannot exceed 200 characters'],
      // e.g., "Infection treatment", "Pain management"
    },

    // Status
    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'discontinued'],
        message: 'Invalid status',
      },
      default: 'active',
      index: true,
    },
    discontinuedReason: {
      type: String,
      trim: true,
    },
    discontinuedAt: {
      type: Date,
    },

    // Metadata
    prescribedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    remindersEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
medicationSchema.index({ patientId: 1, status: 1 });
medicationSchema.index({ doctorId: 1, prescribedAt: -1 });
medicationSchema.index({ status: 1, endDate: 1 });

// Virtual for checking if medication is currently active
medicationSchema.virtual('isActive').get(function () {
  if (this.status !== 'active') return false;
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Virtual for days remaining
medicationSchema.virtual('daysRemaining').get(function () {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const diffTime = this.endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Pre-save middleware to calculate endDate if not provided
medicationSchema.pre('save', function () {
  // Calculate endDate if not provided
  if (!this.endDate && this.startDate && this.duration) {
    const start = new Date(this.startDate);
    const { value, unit } = this.duration;

    switch (unit) {
      case 'days':
        this.endDate = new Date(start.getTime() + (value * 24 * 60 * 60 * 1000));
        break;
      case 'weeks':
        this.endDate = new Date(start.getTime() + (value * 7 * 24 * 60 * 60 * 1000));
        break;
      case 'months':
        this.endDate = new Date(start.setMonth(start.getMonth() + value));
        break;
    }
  }

  // Auto-complete if past end date
  if (this.status === 'active' && this.endDate && new Date() > this.endDate) {
    this.status = 'completed';
  }
});

// Static method to get active medications for patient
medicationSchema.statics.getActiveMedications = function (patientId) {
  return this.find({
    patientId,
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  })
    .populate('doctorId', 'name email professionalDetails')
    .sort({ prescribedAt: -1 });
};

// Static method to auto-complete expired medications
medicationSchema.statics.autoCompleteExpired = async function () {
  const result = await this.updateMany(
    {
      status: 'active',
      endDate: { $lt: new Date() },
    },
    {
      $set: { status: 'completed' },
    }
  );
  return result.modifiedCount;
};

const Medication = mongoose.model('Medication', medicationSchema);

export default Medication;
