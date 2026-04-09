import mongoose from 'mongoose';

/**
 * Diagnostic Test Schema
 * Manages the workflow of diagnostic tests from assignment to completion
 */
const diagnosticTestSchema = new mongoose.Schema(
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
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lab ID is required'],
      index: true,
    },

    // Test Details
    testName: {
      type: String,
      required: [true, 'Test name is required'],
      trim: true,
    },
    testType: {
      type: String,
      required: [true, 'Test type is required'],
      trim: true,
      enum: {
        values: [
          'Blood Test',
          'Urine Test',
          'X-Ray',
          'CT Scan',
          'MRI',
          'Ultrasound',
          'ECG',
          'EEG',
          'Biopsy',
          'Endoscopy',
          'Other',
        ],
        message: 'Invalid test type',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    urgency: {
      type: String,
      enum: {
        values: ['routine', 'urgent', 'emergency'],
        message: 'Invalid urgency level',
      },
      default: 'routine',
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Instructions cannot exceed 500 characters'],
    },

    // Status Tracking
    status: {
      type: String,
      enum: {
        values: ['assigned', 'sample_collected', 'processing', 'report_uploaded', 'cancelled'],
        message: 'Invalid status',
      },
      default: 'assigned',
      index: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['assigned', 'sample_collected', 'processing', 'report_uploaded', 'cancelled'],
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],

    // Report Metadata
    report: {
      filename: {
        type: String,
        trim: true,
      },
      url: {
        type: String,
        trim: true,
      },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      uploadedAt: {
        type: Date,
      },
      fileSize: {
        type: Number, // in bytes
      },
      mimeType: {
        type: String,
        trim: true,
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Report notes cannot exceed 1000 characters'],
      },
    },

    // Additional Information
    estimatedCompletionDate: {
      type: Date,
    },
    actualCompletionDate: {
      type: Date,
    },
    findings: {
      type: String,
      trim: true,
      maxlength: [2000, 'Findings cannot exceed 2000 characters'],
    },
    recommendations: {
      type: String,
      trim: true,
      maxlength: [1000, 'Recommendations cannot exceed 1000 characters'],
    },

    // Metadata
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
diagnosticTestSchema.index({ patientId: 1, status: 1 });
diagnosticTestSchema.index({ doctorId: 1, status: 1 });
diagnosticTestSchema.index({ labId: 1, status: 1 });
diagnosticTestSchema.index({ status: 1, assignedAt: -1 });

// Virtual for checking if report is uploaded
diagnosticTestSchema.virtual('hasReport').get(function () {
  return !!(this.report && this.report.url);
});

// Virtual for checking if test is overdue
diagnosticTestSchema.virtual('isOverdue').get(function () {
  if (!this.estimatedCompletionDate || this.status === 'report_uploaded' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.estimatedCompletionDate;
});

// Method to add status history entry
diagnosticTestSchema.methods.addStatusHistory = function (status, updatedBy, notes = '') {
  this.statusHistory.push({
    status,
    updatedBy,
    updatedAt: new Date(),
    notes,
  });
};

// Pre-save middleware to track status changes
diagnosticTestSchema.pre('save', function () {
  // If status changed, add to history
  if (this.isModified('status')) {
    const lastHistory = this.statusHistory[this.statusHistory.length - 1];
    const currentStatus = this.status;
    
    // Only add to history if status actually changed
    if (!lastHistory || lastHistory.status !== currentStatus) {
      this.statusHistory.push({
        status: currentStatus,
        updatedAt: new Date(),
      });
    }

    // Set actualCompletionDate when report is uploaded
    if (currentStatus === 'report_uploaded' && !this.actualCompletionDate) {
      this.actualCompletionDate = new Date();
    }

    // Set cancelledAt when status becomes cancelled
    if (currentStatus === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }
});

// Static method to get tests by status
diagnosticTestSchema.statics.findByStatus = function (status) {
  return this.find({ status }).populate('patientId doctorId labId', 'name email contactNumber');
};

// Static method to get tests for a specific user role
diagnosticTestSchema.statics.findByUserRole = function (userId, role) {
  const query = { status: { $ne: 'cancelled' } };

  switch (role) {
    case 'patient':
      query.patientId = userId;
      break;
    case 'doctor':
      query.doctorId = userId;
      break;
    case 'lab':
      query.labId = userId;
      break;
    default:
      return this.find(query); // Admin can see all
  }

  return this.find(query)
    .populate('patientId', 'name email contactNumber')
    .populate('doctorId', 'name email professionalDetails')
    .populate('labId', 'name email professionalDetails')
    .sort({ assignedAt: -1 });
};

const DiagnosticTest = mongoose.model('DiagnosticTest', diagnosticTestSchema);

export default DiagnosticTest;
