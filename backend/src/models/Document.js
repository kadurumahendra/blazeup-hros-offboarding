import mongoose from 'mongoose';

export const DOCUMENT_TYPES = {
  RESIGNATION_ACCEPTANCE: 'RESIGNATION_ACCEPTANCE',
  NOC: 'NOC',
  RELIEVING_LETTER: 'RELIEVING_LETTER',
  EXPERIENCE_LETTER: 'EXPERIENCE_LETTER'
};

const documentSchema = new mongoose.Schema(
  {
    offboardingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offboarding',
      required: true
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    type: {
      type: String,
      enum: Object.values(DOCUMENT_TYPES),
      required: true
    },
    title: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      default: ''
    },
    fileSize: {
      type: Number,
      default: 0
    },
    mimeType: {
      type: String,
      default: 'application/pdf'
    },
    contentSummary: {
      type: String,
      default: ''
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    generatedByName: {
      type: String,
      default: ''
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    customClauses: {
      nonCompete: { type: Boolean, default: true },
      nonSolicitation: { type: Boolean, default: true },
      confidentiality: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

export const Document = mongoose.model('Document', documentSchema);
