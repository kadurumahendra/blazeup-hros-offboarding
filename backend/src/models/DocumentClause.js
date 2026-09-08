import mongoose from 'mongoose';

const documentClauseSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'BlazeUp Technologies Pvt. Ltd.'
    },
    companyAddress: {
      type: String,
      default: 'Level 8, Tech Park Nexus, Cyber City, Bangalore - 560103'
    },
    signatoryName: {
      type: String,
      default: 'Priya Sharma'
    },
    signatoryTitle: {
      type: String,
      default: 'Head of People & Culture'
    },
    nonCompeteClause: {
      type: String,
      default: 'The employee agrees not to engage directly or indirectly with direct competitors in a similar technical capacity for a period of six (6) months following the last working date.'
    },
    nonSolicitationClause: {
      type: String,
      default: 'The employee undertakes not to solicit, entice, or attempt to hire any existing employees or clients of the Company for a duration of twelve (12) months.'
    },
    confidentialityClause: {
      type: String,
      default: 'The employee remains bound by the proprietary and confidential information obligations signed during onboarding.'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const DocumentClause = mongoose.model('DocumentClause', documentClauseSchema);
