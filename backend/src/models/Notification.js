import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // If null, can be targeted by role
    },
    targetRole: {
      type: String,
      default: null
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['INFO', 'TASK_ASSIGNED', 'STAGE_APPROVED', 'STAGE_REJECTED', 'REMINDER', 'COMPLETED', 'REVOCATION'],
      default: 'INFO'
    },
    relatedEntity: {
      type: String,
      enum: ['OFFBOARDING', 'WORKFLOW', 'TASK', 'DOCUMENT', 'ACCESS'],
      default: 'OFFBOARDING'
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
