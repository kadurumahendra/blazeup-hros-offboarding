import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HR_ADMIN: 'HR_ADMIN',
  HR: 'HR',
  MANAGER: 'MANAGER',
  ADMIN_SYSTEMS: 'ADMIN_SYSTEMS',
  ACCOUNTS: 'ACCOUNTS',
  PERSONNEL: 'PERSONNEL',
  EMPLOYEE: 'EMPLOYEE'
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.EMPLOYEE
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    department: {
      type: String,
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
