import jwt from 'jsonwebtoken';
import { User, ROLES } from '../models/User.js';
import { config } from '../config/env.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, designation, employeeId } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 'VALIDATION_ERROR', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 'DUPLICATE_EMAIL', 400);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || ROLES.EMPLOYEE,
      department: department || '',
      designation: designation || '',
      employeeId: employeeId || null
    });

    const token = generateToken(user);

    return successResponse(
      res,
      'User registered successfully',
      {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          designation: user.designation,
          employeeId: user.employeeId
        }
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

import { Employee } from '../models/Employee.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 'VALIDATION_ERROR', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail }).select('+password');
    
    // If not found in User collection, check if this email belongs to an existing Employee
    if (!user) {
      const employee = await Employee.findOne({ email: normalizedEmail });
      if (employee) {
        user = await User.create({
          name: `${employee.firstName} ${employee.lastName}`,
          email: normalizedEmail,
          password: password || 'Password123!',
          role: ROLES.EMPLOYEE,
          department: employee.department || '',
          designation: employee.designation || '',
          employeeId: employee._id
        });
        user = await User.findById(user._id).select('+password');
      }
    }

    if (!user) {
      return errorResponse(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'User account is deactivated. Contact HR Admin.', 'FORBIDDEN', 403);
    }

    const token = generateToken(user);

    return successResponse(res, 'Login successful', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('employeeId');
    return successResponse(res, 'Current user profile retrieved', { user });
  } catch (error) {
    next(error);
  }
};

export const getDemoUsers = async (req, res, next) => {
  try {
    const demoUsers = await User.find({ isActive: true })
      .select('name email role department designation employeeId')
      .sort({ name: 1 });

    const roleOrder = [
      ROLES.SUPER_ADMIN,
      ROLES.HR_ADMIN,
      ROLES.HR,
      ROLES.MANAGER,
      ROLES.ADMIN_SYSTEMS,
      ROLES.ACCOUNTS,
      ROLES.PERSONNEL,
      ROLES.EMPLOYEE
    ];

    const grouped = {};
    roleOrder.forEach(r => (grouped[r] = []));
    demoUsers.forEach(u => {
      if (!grouped[u.role]) grouped[u.role] = [];
      grouped[u.role].push({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        designation: u.designation,
        employeeId: u.employeeId
      });
    });

    return successResponse(res, 'Demo users list retrieved for persona selector', {
      all: demoUsers,
      grouped
    });
  } catch (error) {
    next(error);
  }
};
