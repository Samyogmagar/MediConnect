import mongoose from 'mongoose';

/**
 * Schema for storing vital signs
 */
const vitalSignsSchema = new mongoose.Schema({
  bloodPressure: {
    systolic: { type: Number },
    diastolic: { type: Number },
  },
  heartRate: { type: Number }, // bpm
  temperature: { type: Number }, // Celsius
  oxygenSaturation: { type: Number }, // percentage
  weight: { type: Number }, // kg
  height: { type: Number }, // cm
  bmi: { type: Number },
  respiratoryRate: { type: Number }, // breaths per minute
  recordedAt: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
});

/**
 * Schema for allergies
 */
const allergySchema = new mongoose.Schema({
  allergen: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe'], 
    default: 'moderate' 
  },
  reaction: { type: String },
  diagnosedDate: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'resolved', 'inactive'], 
    default: 'active' 
  },
  notes: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

/**
 * Schema for medical conditions/diagnoses
 */
const conditionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icdCode: { type: String }, // ICD-10 code
  diagnosedDate: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'resolved', 'chronic', 'remission'], 
    default: 'active' 
  },
  severity: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe'] 
  },
  notes: { type: String },
  treatment: { type: String },
  diagnosedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/**
 * Schema for immunizations
 */
const immunizationSchema = new mongoose.Schema({
  vaccineName: { type: String, required: true },
  vaccineCode: { type: String }, // CVX code
  administeredDate: { type: Date, required: true },
  doseNumber: { type: String },
  route: { type: String }, // e.g., intramuscular, oral
  site: { type: String }, // e.g., left arm
  manufacturer: { type: String },
  lotNumber: { type: String },
  expirationDate: { type: Date },
  providedBy: { type: String },
  administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nextDueDate: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

/**
 * Schema for lab test results
 */
const labResultSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  testCode: { type: String }, // LOINC code
  category: { type: String }, // e.g., Hematology, Chemistry, Microbiology
  orderedDate: { type: Date },
  collectedDate: { type: Date },
  reportedDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'partial', 'final', 'corrected', 'cancelled'], 
    default: 'final' 
  },
  urgency: { 
    type: String, 
    enum: ['routine', 'urgent', 'stat'] 
  },
  results: [{
    parameter: { type: String, required: true },
    value: { type: String, required: true },
    unit: { type: String },
    referenceRange: { type: String },
    flag: { 
      type: String, 
      enum: ['normal', 'low', 'high', 'critical', 'abnormal'] 
    },
  }],
  interpretation: { type: String },
  notes: { type: String },
  orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedBy: { type: String }, // Lab name or technician
  createdAt: { type: Date, default: Date.now },
});

/**
 * Main Medical Record schema
 */
const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Current/Latest vitals
    currentVitals: vitalSignsSchema,
    
    // Historical vital signs
    vitalHistory: [vitalSignsSchema],
    
    // Allergies
    allergies: [allergySchema],
    
    // Medical conditions/diagnoses
    conditions: [conditionSchema],
    
    // Immunization records
    immunizations: [immunizationSchema],
    
    // Lab results
    labResults: [labResultSchema],
    
    // Blood type
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    
    // Emergency contact
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
    },
    
    // Family history
    familyHistory: [{
      condition: { type: String },
      relationship: { type: String },
      notes: { type: String },
    }],
    
    // Social history
    socialHistory: {
      smokingStatus: { 
        type: String, 
        enum: ['never', 'former', 'current', 'unknown'] 
      },
      alcoholUse: { 
        type: String, 
        enum: ['none', 'occasional', 'moderate', 'heavy'] 
      },
      exerciseFrequency: { type: String },
      occupation: { type: String },
      notes: { type: String },
    },
    
    // Notes and general information
    generalNotes: { type: String },
    
    // Metadata
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
medicalRecordSchema.index({ 'allergies.status': 1 });
medicalRecordSchema.index({ 'conditions.status': 1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;
