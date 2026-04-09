import mongoose from 'mongoose';

/**
 * Reminder Schema
 * Stores time-based reminder records for medication schedules
 */
const reminderSchema = new mongoose.Schema(
  {
    // References
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
      required: [true, 'Medication ID is required'],
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },

    // Reminder Details
    reminderTime: {
      type: Date,
      required: [true, 'Reminder time is required'],
    },
    reminderDate: {
      type: Date,
      required: [true, 'Reminder date is required'],
      index: true,
    },
    timeOfDay: {
      type: String,
      required: [true, 'Time of day is required'],
      // e.g., "08:00", "14:00", "20:00"
    },

    // Status Tracking
    status: {
      type: String,
      enum: {
        values: ['pending', 'sent', 'acknowledged', 'missed', 'cancelled'],
        message: 'Invalid reminder status',
      },
      default: 'pending',
    },
    sentAt: {
      type: Date,
    },
    acknowledgedAt: {
      type: Date,
    },

    // Metadata
    notificationMethod: {
      type: String,
      enum: ['push', 'sms', 'email'],
      default: 'push',
    },
    notificationId: {
      type: String,
      // External notification service ID (if integrated)
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      // Store additional notification-specific data
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
reminderSchema.index({ patientId: 1, status: 1, reminderDate: 1 });
reminderSchema.index({ medicationId: 1, reminderDate: 1 });
reminderSchema.index({ status: 1, reminderTime: 1 });

// Index for finding pending reminders due now
reminderSchema.index({
  status: 1,
  reminderTime: 1,
});

// Static method to get pending reminders for a time range
reminderSchema.statics.getPendingReminders = function (startTime, endTime) {
  return this.find({
    status: 'pending',
    reminderTime: {
      $gte: startTime,
      $lte: endTime,
    },
  })
    .populate('medicationId', 'medicationName dosage instructions')
    .populate('patientId', 'name email contactNumber')
    .sort({ reminderTime: 1 });
};

// Static method to get reminders for a patient on a specific date
reminderSchema.statics.getPatientRemindersForDate = function (patientId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    patientId,
    reminderDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .populate('medicationId', 'medicationName dosage instructions')
    .sort({ reminderTime: 1 });
};

// Static method to mark missed reminders
reminderSchema.statics.markMissedReminders = async function () {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - 1); // 1 hour grace period

  const result = await this.updateMany(
    {
      status: 'pending',
      reminderTime: { $lt: cutoffTime },
    },
    {
      $set: { status: 'missed' },
    }
  );
  return result.modifiedCount;
};

// Method to acknowledge reminder
reminderSchema.methods.acknowledge = async function () {
  this.status = 'acknowledged';
  this.acknowledgedAt = new Date();
  await this.save();
  return this;
};

// Method to mark as sent
reminderSchema.methods.markAsSent = async function (notificationId = null) {
  this.status = 'sent';
  this.sentAt = new Date();
  if (notificationId) {
    this.notificationId = notificationId;
  }
  await this.save();
  return this;
};

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;
