import mongoose from 'mongoose';

const roleApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    requestedRole: {
      type: String,
      enum: {
        values: ['doctor', 'lab'],
        message: 'Requested role must be either doctor or lab',
      },
      required: [true, 'Requested role is required'],
    },
    professionalDetails: {
      // For doctors
      licenseNumber: {
        type: String,
        trim: true,
      },
      specialization: {
        type: String,
        trim: true,
      },
      qualifications: {
        type: [String],
        default: [],
      },
      hospital: {
        type: String,
        trim: true,
      },
      experience: {
        type: Number,
        min: 0,
      },
      // For labs
      labName: {
        type: String,
        trim: true,
      },
      labLicenseNumber: {
        type: String,
        trim: true,
      },
      accreditation: {
        type: String,
        trim: true,
      },
      servicesOffered: {
        type: [String],
        default: [],
      },
      // Common fields
      address: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    documents: {
      type: [
        {
          name: String,
          url: String,
          type: String,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Invalid application status',
      },
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
roleApplicationSchema.index({ userId: 1 });
roleApplicationSchema.index({ status: 1 });
roleApplicationSchema.index({ requestedRole: 1, status: 1 });

// Prevent duplicate pending applications for same user
roleApplicationSchema.index({ userId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

// Transform output
roleApplicationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const RoleApplication = mongoose.model('RoleApplication', roleApplicationSchema);

export default RoleApplication;
