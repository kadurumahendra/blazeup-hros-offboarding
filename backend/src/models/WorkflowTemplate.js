import mongoose from 'mongoose';
import { ROLES } from './User.js';

export const EXECUTION_TYPES = {
  SEQUENTIAL: 'SEQUENTIAL',
  PARALLEL: 'PARALLEL'
};

export const PROCESS_TYPES = {
  OFFBOARDING: 'OFFBOARDING',
  ONBOARDING: 'ONBOARDING',
  LEAVE_APPROVAL: 'LEAVE_APPROVAL',
  EXPENSE_APPROVAL: 'EXPENSE_APPROVAL',
  PURCHASE_APPROVAL: 'PURCHASE_APPROVAL',
  ASSET_APPROVAL: 'ASSET_APPROVAL'
};

const checklistItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    category: {
      type: String,
      default: 'General'
    }
  },
  { _id: false }
);

const stageDefinitionSchema = new mongoose.Schema(
  {
    stageId: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true
    },
    order: {
      type: Number,
      required: true,
      default: 1
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
    checklist: {
      type: [checklistItemSchema],
      default: []
    },
    reminderAfterHours: {
      type: Number,
      default: 24
    },
    deadlineHours: {
      type: Number,
      default: 48
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const workflowTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true
    },
    processType: {
      type: String,
      enum: Object.values(PROCESS_TYPES),
      default: PROCESS_TYPES.OFFBOARDING
    },
    description: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    stages: {
      type: [stageDefinitionSchema],
      required: true,
      validate: [stages => stages && stages.length > 0, 'At least one stage is required']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const WorkflowTemplate = mongoose.model('WorkflowTemplate', workflowTemplateSchema);
