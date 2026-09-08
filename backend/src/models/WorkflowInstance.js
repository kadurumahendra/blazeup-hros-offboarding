import mongoose from 'mongoose';
import { ROLES } from './User.js';
import { EXECUTION_TYPES, PROCESS_TYPES } from './WorkflowTemplate.js';

export const STAGE_STATUS = {
  WAITING: 'WAITING',
  ACTIVE: 'ACTIVE',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SKIPPED: 'SKIPPED'
};

export const WORKFLOW_STATUS = {
  INITIATED: 'INITIATED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

const instanceChecklistItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      default: 'General'
    },
    completedAt: {
      type: Date,
      default: null
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const stageInstanceSchema = new mongoose.Schema(
  {
    stageId: {
      type: String,
      required: true
    },
    stageName: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    executionType: {
      type: String,
      enum: Object.values(EXECUTION_TYPES),
      default: EXECUTION_TYPES.SEQUENTIAL
    },
    dependsOn: {
      type: [String],
      default: []
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedToName: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(STAGE_STATUS),
      default: STAGE_STATUS.WAITING
    },
    checklist: {
      type: [instanceChecklistItemSchema],
      default: []
    },
    remarks: {
      type: String,
      default: ''
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    dueDate: {
      type: Date,
      default: null
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedByName: {
      type: String,
      default: ''
    },
    approvedAt: {
      type: Date,
      default: null
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    rejectedByName: {
      type: String,
      default: ''
    },
    rejectedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    lastReminderSentAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const workflowInstanceSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkflowTemplate',
      required: true
    },
    processType: {
      type: String,
      enum: Object.values(PROCESS_TYPES),
      default: PROCESS_TYPES.OFFBOARDING
    },
    offboardingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offboarding',
      default: null
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(WORKFLOW_STATUS),
      default: WORKFLOW_STATUS.INITIATED
    },
    stages: {
      type: [stageInstanceSchema],
      required: true
    },
    startedAt: {
      type: Date,
      default: Date.now
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

export const WorkflowInstance = mongoose.model('WorkflowInstance', workflowInstanceSchema);
