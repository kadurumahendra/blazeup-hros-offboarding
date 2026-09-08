import mongoose from 'mongoose';

export const OFFBOARDING_STATUS = {
  INITIATED: 'INITIATED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED'
};

const offboardingSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required']
    },
    resignationDate: {
      type: Date,
      required: [true, 'Resignation date is required']
    },
    lastWorkingDay: {
      type: Date,
      required: [true, 'Last working day is required']
    },
    reason: {
      type: String,
      required: [true, 'Reason for departure is required'],
      trim: true
    },
    details: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(OFFBOARDING_STATUS),
      default: OFFBOARDING_STATUS.INITIATED
    },
    workflowInstanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkflowInstance',
      default: null
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    cancelReason: {
      type: String,
      default: ''
    },
    exitInterviewNotes: {
      type: String,
      default: ''
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Offboarding = mongoose.model('Offboarding', offboardingSchema);
