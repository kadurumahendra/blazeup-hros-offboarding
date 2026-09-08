import mongoose from 'mongoose';

export const EMPLOYEE_STATUS = {
  ACTIVE: 'ACTIVE',
  OFFBOARDING_INITIATED: 'OFFBOARDING_INITIATED',
  OFFBOARDING_IN_PROGRESS: 'OFFBOARDING_IN_PROGRESS',
  RELIEVED: 'RELIEVED',
  TERMINATED: 'TERMINATED'
};

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: [true, 'Employee code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    managerName: {
      type: String,
      default: ''
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required']
    },
    location: {
      type: String,
      default: 'Headquarters'
    },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACTOR'],
      default: 'FULL_TIME'
    },
    status: {
      type: String,
      enum: Object.values(EMPLOYEE_STATUS),
      default: EMPLOYEE_STATUS.ACTIVE
    }
  },
  {
    timestamps: true
  }
);

employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

export const Employee = mongoose.model('Employee', employeeSchema);
