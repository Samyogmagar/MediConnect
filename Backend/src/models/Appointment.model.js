import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Appointment date and time is required'],
      validate: {
        validator: function(value) {
          // Only validate future date when dateTime is new or modified
          if (!this.isModified('dateTime')) return true;
          return value > new Date();
        },
        message: 'Appointment date must be in the future',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'approved', 'rejected', 'completed', 'cancelled'],
        message: 'Invalid status',
      },
      default: 'pending',
    },
    reason: {
      type: String,
      trim: true,
      maxLength: [500, 'Reason cannot exceed 500 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxLength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    completionNotes: {
      type: String,
      trim: true,
    },
    payment: {
      method: {
        type: String,
        enum: {
          values: ['khalti', 'cod'],
          message: 'Invalid payment method',
        },
      },
      status: {
        type: String,
        enum: {
          values: ['pending', 'completed', 'failed'],
          message: 'Invalid payment status',
        },
      },
      amount: {
        type: Number,
        min: [0, 'Amount cannot be negative'],
      },
      currency: {
        type: String,
        default: 'NPR',
      },
      provider: {
        type: String,
        enum: {
          values: ['khalti', 'cod'],
          message: 'Invalid payment provider',
        },
      },
      transactionId: {
        type: String,
        trim: true,
      },
      khaltiPidx: {
        type: String,
        trim: true,
      },
      paidAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
appointmentSchema.index({ patientId: 1, dateTime: 1 });
appointmentSchema.index({ doctorId: 1, dateTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ dateTime: 1 });

// Compound index to prevent double booking
appointmentSchema.index({ doctorId: 1, dateTime: 1, status: 1 });

// Transform output
appointmentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
