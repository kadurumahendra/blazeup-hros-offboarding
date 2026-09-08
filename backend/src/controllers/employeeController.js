import { Employee, EMPLOYEE_STATUS } from '../models/Employee.js';
import { User } from '../models/User.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHandler.js';

export const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (department) {
      query.department = department;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return paginatedResponse(res, 'Employees fetched successfully', employees, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('managerId', 'name email');
    if (!employee) {
      return errorResponse(res, 'Employee not found', 'NOT_FOUND', 404);
    }
    return successResponse(res, 'Employee retrieved successfully', employee);
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const {
      employeeCode,
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      managerId,
      joiningDate,
      location,
      employmentType
    } = req.body;

    if (!employeeCode || !firstName || !lastName || !email || !department || !designation || !joiningDate) {
      return errorResponse(res, 'All required employee fields must be filled', 'VALIDATION_ERROR', 400);
    }

    let managerName = '';
    if (managerId) {
      const managerUser = await User.findById(managerId);
      if (managerUser) managerName = managerUser.name;
    }

    const employee = await Employee.create({
      employeeCode: employeeCode.toUpperCase(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      department,
      designation,
      managerId: managerId || null,
      managerName,
      joiningDate,
      location: location || 'Headquarters',
      employmentType: employmentType || 'FULL_TIME',
      status: EMPLOYEE_STATUS.ACTIVE
    });

    return successResponse(res, 'Employee created successfully', employee, 201);
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!employee) {
      return errorResponse(res, 'Employee not found', 'NOT_FOUND', 404);
    }
    return successResponse(res, 'Employee updated successfully', employee);
  } catch (error) {
    next(error);
  }
};

export const getEligibleForOffboarding = async (req, res, next) => {
  try {
    const employees = await Employee.find({
      status: EMPLOYEE_STATUS.ACTIVE
    }).select('firstName lastName email employeeCode department designation joiningDate managerId managerName');
    return successResponse(res, 'Eligible employees for offboarding', employees);
  } catch (error) {
    next(error);
  }
};
