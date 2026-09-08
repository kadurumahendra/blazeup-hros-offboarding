import mongoose from 'mongoose';

export const AUDIT_ACTIONS = {
  OFFBOARDING_CREATED: 'OFFBOARDING_CREATED',
  OFFBOARDING_CANCELLED: 'OFFBOARDING_CANCELLED',
  WORKFLOW_INSTANTIATED: 'WORKFLOW_INSTANTIATED',
  STAGE_ACTIVATED: 'STAGE_ACTIVATED',
  APPROVAL_SUBMITTED: 'APPROVAL_SUBMITTED',
  STAGE_APPROVED: 'STAGE_APPROVED',
  STAGE_REJECTED: 'STAGE_REJECTED',
  REMINDER_SENT: 'REMINDER_SENT',
  DOCUMENT_GENERATED: 'DOCUMENT_GENERATED',
  ACCESS_REVOKED: 'ACCESS_REVOKED',
  ACCESS_BULK_REVOKED: 'ACCESS_BULK_REVOKED',
  WORKFLOW_COMPLETED: 'WORKFLOW_COMPLETED',
  WORKFLOW_TEMPLATE_CREATED: 'WORKFLOW_TEMPLATE_CREATED',
  WORKFLOW_TEMPLATE_UPDATED: 'WORKFLOW_TEMPLATE_UPDATED',
  CLAUSE_SETTINGS_UPDATED: 'CLAUSE_SETTINGS_UPDATED'
};

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userName: {
      type: String,
      default: 'System'
    },
    role: {
      type: String,
      default: 'SYSTEM'
    },
    action: {
      type: String,
      required: true,
      enum: Object.values(AUDIT_ACTIONS)
    },
    module: {
      type: String,
      default: 'OFFBOARDING'
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    offboardingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offboarding',
      default: null
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    employeeName: {
      type: String,
      default: ''
    },
    stage: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexed for fast filtering
auditLogSchema.index({ offboardingId: 1, timestamp: -1 });
auditLogSchema.index({ employeeId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ role: 1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
