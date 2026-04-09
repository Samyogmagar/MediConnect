import mongoose from 'mongoose';

const hospitalSettingsSchema = new mongoose.Schema(
  {
    hospitalName: {
      type: String,
      trim: true,
      default: 'MediConnect Hospital',
    },
    tagline: {
      type: String,
      trim: true,
      default: 'Single hospital care operations',
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      trim: true,
      default: 'Asia/Kathmandu',
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      province: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'Nepal' },
    },
    departments: {
      type: [String],
      default: [],
    },
    testCategories: {
      type: [String],
      default: [],
    },
    defaultConsultationFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    defaultConsultationDurationMinutes: {
      type: Number,
      min: 10,
      max: 180,
      default: 30,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const HospitalSettings = mongoose.model('HospitalSettings', hospitalSettingsSchema);

export default HospitalSettings;
