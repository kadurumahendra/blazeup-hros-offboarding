import mongoose from 'mongoose';

export const ACCESS_STATUS = {
  ACTIVE: 'ACTIVE',
  REVOKING: 'REVOKING',
  REVOKED: 'REVOKED',
  FAILED: 'FAILED'
};

const accessItemSchema = new mongoose.Schema(
  {
    accessKey: {
      type: String,
      required: true
    },
    systemName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'IT & Infrastructure'
    },
    status: {
      type: String,
      enum: Object.values(ACCESS_STATUS),
      default: ACCESS_STATUS.ACTIVE
    },
    isSimulated: {
      type: Boolean,
      default: true
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    revokedByName: {
      type: String,
      default: ''
    },
    revokedAt: {
      type: Date,
      default: null
    },
    auditNote: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const accessRevocationSchema = new mongoose.Schema(
  {
    offboardingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offboarding',
      required: true,
      unique: true
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    items: {
      type: [accessItemSchema],
      default: [
        {
          accessKey: 'EMAIL',
          systemName: 'Google Workspace / M365 Email',
          category: 'Communication',
          status: ACCESS_STATUS.ACTIVE,
          isSimulated: true
        },
        {
          accessKey: 'SYSTEM_AD',
          systemName: 'Active Directory / Okta Single Sign-On',
          category: 'Identity & Access',
          status: ACCESS_STATUS.ACTIVE,
          isSimulated: true
        },
        {
          accessKey: 'VPN',
          systemName: 'Corporate WireGuard / OpenVPN Gateways',
          category: 'Network Access',
          status: ACCESS_STATUS.ACTIVE,
          isSimulated: true
        },
        {
          accessKey: 'SLACK',
          systemName: 'Slack Enterprise Grid & Teams Channels',
          category: 'Communication',
          status: ACCESS_STATUS.ACTIVE,
          isSimulated: true
        },
        {
          accessKey: 'CLOUD_DEV',
          systemName: 'AWS / GitHub Organization & Repositories',
          category: 'Development & Cloud',
          status: ACCESS_STATUS.ACTIVE,
          isSimulated: true
        },
        {
          accessKey: 'FINANCE_HRMS',
          systemName: 'Internal ERP & HRMS Self-Service Portal',
          category: 'Internal Systems',
          status: ACCESS_STATUS.ACTIVE,
          isSimulated: true
        }
      ]
    },
    allRevoked: {
      type: Boolean,
      default: false
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const AccessRevocation = mongoose.model('AccessRevocation', accessRevocationSchema);
