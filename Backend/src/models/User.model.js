import mongoose from 'mongoose';
import { ALL_ROLES, ROLES, VERIFICATION_REQUIRED_ROLES } from '../constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minLength: [2, 'Name must be at least 2 characters'],
      maxLength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ALL_ROLES,
        message: 'Invalid role. Must be one of: patient, doctor, lab, admin',
      },
      default: ROLES.PATIENT,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: function () {
        // Patients are verified immediately, doctors and labs need admin approval
        return !VERIFICATION_REQUIRED_ROLES.includes(this.role);
      },
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
      consultationFee: {
        type: Number,
        min: 0,
        default: 0,
      },
      consultationDurationMinutes: {
        type: Number,
        min: 10,
        max: 180,
        default: 30,
      },
      bio: {
        type: String,
        trim: true,
        maxLength: [500, 'Bio cannot exceed 500 characters'],
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
      documentCount: {
        type: Number,
        min: 0,
        default: 0,
      },
      documents: {
        type: [
          {
            name: {
              type: String,
              trim: true,
            },
            type: {
              type: String,
              trim: true,
            },
            size: {
              type: Number,
              min: 0,
            },
            uploadedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        default: [],
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    bloodGroup: {
      type: String,
      trim: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      province: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
        default: 'Nepal',
      },
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    notificationPreferences: {
      appointments: {
        type: Boolean,
        default: true,
      },
      cancellations: {
        type: Boolean,
        default: true,
      },
      prescriptions: {
        type: Boolean,
        default: true,
      },
      labReports: {
        type: Boolean,
        default: true,
      },
      medicationReminders: {
        type: Boolean,
        default: true,
      },
      followUps: {
        type: Boolean,
        default: true,
      },
      system: {
        type: Boolean,
        default: true,
      },
      channels: {
        inApp: {
          type: Boolean,
          default: true,
        },
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: false,
        },
      },
    },
    pushSubscriptions: {
      type: [
        {
          endpoint: {
            type: String,
            required: true,
            trim: true,
          },
          keys: {
            p256dh: {
              type: String,
              required: true,
            },
            auth: {
              type: String,
              required: true,
            },
          },
          userAgent: {
            type: String,
            trim: true,
          },
          deviceLabel: {
            type: String,
            trim: true,
          },
          lastSeenAt: {
            type: Date,
            default: Date.now,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    appearancePreference: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    socialAuth: {
      lastProvider: {
        type: String,
        enum: ['google', 'github', 'facebook'],
      },
      providers: {
        google: {
          id: { type: String, trim: true },
          linkedAt: { type: Date },
        },
        github: {
          id: { type: String, trim: true },
          linkedAt: { type: Date },
        },
        facebook: {
          id: { type: String, trim: true },
          linkedAt: { type: Date },
        },
      },
    },
    medicalHistory: [
      {
        condition: { type: String, trim: true },
        diagnosedDate: { type: Date },
        status: { type: String, trim: true, default: 'Active' },
      },
    ],
    allergies: [
      {
        type: String,
        trim: true,
      },
    ],
    profileImageUrl: {
      type: String,
    },
    passwordResetOtpHash: {
      type: String,
      select: false,
    },
    passwordResetOtpExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for better query performance
// Note: email index is created automatically by unique: true
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1, role: 1 });

// Virtual for checking if user needs verification
userSchema.virtual('requiresVerification').get(function () {
  return VERIFICATION_REQUIRED_ROLES.includes(this.role) && !this.isVerified;
});

// Transform output
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
