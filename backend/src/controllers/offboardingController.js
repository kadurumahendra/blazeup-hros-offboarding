import { Offboarding, OFFBOARDING_STATUS } from '../models/Offboarding.js';
import { Employee, EMPLOYEE_STATUS } from '../models/Employee.js';
import { WorkflowInstance, WORKFLOW_STATUS } from '../models/WorkflowInstance.js';
import { AccessRevocation } from '../models/AccessRevocation.js';
import { Document } from '../models/Document.js';
import { AuditLog, AUDIT_ACTIONS } from '../models/AuditLog.js';
import { WorkflowService } from '../services/workflowService.js';
import { AccessRevocationService } from '../services/accessRevocationService.js';
import { logAudit } from '../services/auditLogService.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHandler.js';

export const createOffboarding = async (req, res, next) => {
  try {
    const { employeeId, resignationDate, lastWorkingDay, reason, details, templateId } = req.body;

    if (!employeeId || !resignationDate || !lastWorkingDay || !reason) {
      return errorResponse(res, 'Employee, resignation date, last working day, and reason are required', 'VALIDATION_ERROR', 400);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return errorResponse(res, 'Employee not found', 'NOT_FOUND', 404);
    }

    // Check if employee already has an active offboarding
    const existingOffboarding = await Offboarding.findOne({
      employeeId,
      status: { $in: [OFFBOARDING_STATUS.INITIATED, OFFBOARDING_STATUS.IN_PROGRESS] }
    });

    if (existingOffboarding) {
      return errorResponse(
        res,
        `Employee ${employee.firstName} ${employee.lastName} already has an active offboarding case in progress.`,
        'ACTIVE_CASE_EXISTS',
        400
      );
    }

    // 1. Create Offboarding Record
    const offboarding = await Offboarding.create({
      employeeId,
      resignationDate,
      lastWorkingDay,
      reason,
      details: details || '',
      status: OFFBOARDING_STATUS.IN_PROGRESS,
      initiatedBy: req.user._id
    });

    // 2. Initialize Workflow Instance via Reusable Workflow Engine
    const workflowInstance = await WorkflowService.createInstance({
      templateId,
      processType: 'OFFBOARDING',
      offboardingId: offboarding._id,
      employeeId: employee._id,
      initiatedBy: req.user
    });

    // 3. Link workflow instance to offboarding record
    offboarding.workflowInstanceId = workflowInstance._id;
    await offboarding.save();

    // 4. Initialize Access Revocation Record for IT Systems
    await AccessRevocationService.getOrCreateRecord(offboarding._id, employee._id);

    // 5. Update employee status
    employee.status = EMPLOYEE_STATUS.OFFBOARDING_IN_PROGRESS;
    await employee.save();

    // 6. Log Master Audit Event
    await logAudit({
      user: req.user,
      action: AUDIT_ACTIONS.OFFBOARDING_CREATED,
      module: 'OFFBOARDING',
      entityId: offboarding._id,
      offboardingId: offboarding._id,
      employeeId: employee._id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      remarks: `Offboarding initiated for ${employee.firstName} ${employee.lastName} (${employee.employeeCode}). Reason: ${reason}`
    });

    const populatedOffboarding = await Offboarding.findById(offboarding._id)
      .populate('employeeId')
      .populate('workflowInstanceId')
      .populate('initiatedBy', 'name email role');

    return successResponse(
      res,
      'Offboarding process initiated successfully',
      populatedOffboarding,
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getOffboardings = async (req, res, next) => {
  try {
    const { search, status, department, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = {};

    // Strict role scoping: Employees can ONLY view their own offboarding case
    if (req.user.role === 'EMPLOYEE') {
      if (!req.user.employeeId) {
        return paginatedResponse(res, 'No offboarding records found', [], page, limit, 0);
      }
      query.employeeId = req.user.employeeId;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.lastWorkingDay = {};
      if (startDate) query.lastWorkingDay.$gte = new Date(startDate);
      if (endDate) query.lastWorkingDay.$lte = new Date(endDate);
    }

    let employeeMatch = {};
    if (department && req.user.role !== 'EMPLOYEE') {
      employeeMatch.department = department;
    }
    if (search && req.user.role !== 'EMPLOYEE') {
      employeeMatch.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if ((department || search) && req.user.role !== 'EMPLOYEE') {
      const matchingEmployees = await Employee.find(employeeMatch).select('_id');
      query.employeeId = { $in: matchingEmployees.map(e => e._id) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Offboarding.countDocuments(query);

    const offboardings = await Offboarding.find(query)
      .populate('employeeId')
      .populate('workflowInstanceId')
      .populate('initiatedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return paginatedResponse(res, 'Offboarding cases fetched successfully', offboardings, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const getOffboardingById = async (req, res, next) => {
  try {
    const offboarding = await Offboarding.findById(req.params.id)
      .populate('employeeId')
      .populate({
        path: 'workflowInstanceId',
        populate: { path: 'templateId', select: 'name stages' }
      })
      .populate('initiatedBy', 'name email role')
      .populate('cancelledBy', 'name email role');

    if (!offboarding) {
      return errorResponse(res, 'Offboarding case not found', 'NOT_FOUND', 404);
    }

    // Strict role check: If user is EMPLOYEE, they can only access their own case
    if (req.user.role === 'EMPLOYEE') {
      const caseEmpId = offboarding.employeeId?._id?.toString() || offboarding.employeeId?.toString();
      const userEmpId = req.user.employeeId?._id?.toString() || req.user.employeeId?.toString();
      if (!userEmpId || caseEmpId !== userEmpId) {
        return errorResponse(res, 'You are not authorized to view this offboarding case.', 'FORBIDDEN', 403);
      }
    }

    // Fetch related records in parallel
    const [accessRevocation, documents, auditLogs] = await Promise.all([
      AccessRevocation.findOne({ offboardingId: offboarding._id }),
      Document.find({ offboardingId: offboarding._id }).sort({ generatedAt: -1 }),
      req.user.role === 'EMPLOYEE'
        ? [] // Employees do not need full enterprise audit logs
        : AuditLog.find({ offboardingId: offboarding._id }).sort({ timestamp: -1 }).limit(100)
    ]);

    return successResponse(res, 'Offboarding case details retrieved', {
      offboarding,
      accessRevocation,
      documents,
      auditLogs
    });
  } catch (error) {
    next(error);
  }
};

export const updateOffboarding = async (req, res, next) => {
  try {
    const { details, lastWorkingDay, exitInterviewNotes } = req.body;
    const offboarding = await Offboarding.findById(req.params.id);

    if (!offboarding) {
      return errorResponse(res, 'Offboarding case not found', 'NOT_FOUND', 404);
    }

    if (details !== undefined) offboarding.details = details;
    if (lastWorkingDay !== undefined) offboarding.lastWorkingDay = lastWorkingDay;
    if (exitInterviewNotes !== undefined) offboarding.exitInterviewNotes = exitInterviewNotes;

    await offboarding.save();

    return successResponse(res, 'Offboarding details updated successfully', offboarding);
  } catch (error) {
    next(error);
  }
};

export const cancelOffboarding = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const offboarding = await Offboarding.findById(req.params.id).populate('employeeId');

    if (!offboarding) {
      return errorResponse(res, 'Offboarding case not found', 'NOT_FOUND', 404);
    }

    if (offboarding.status === OFFBOARDING_STATUS.COMPLETED) {
      return errorResponse(res, 'Cannot cancel an offboarding case that is already completed', 'INVALID_OPERATION', 400);
    }

    offboarding.status = OFFBOARDING_STATUS.CANCELLED;
    offboarding.cancelledBy = req.user._id;
    offboarding.cancelReason = reason || 'Cancelled by HR Admin';
    await offboarding.save();

    // Cancel workflow instance
    if (offboarding.workflowInstanceId) {
      await WorkflowInstance.findByIdAndUpdate(offboarding.workflowInstanceId, {
        status: WORKFLOW_STATUS.CANCELLED
      });
    }

    // Revert employee status
    if (offboarding.employeeId) {
      await Employee.findByIdAndUpdate(offboarding.employeeId._id, {
        status: EMPLOYEE_STATUS.ACTIVE
      });
    }

    const employeeName = offboarding.employeeId
      ? `${offboarding.employeeId.firstName} ${offboarding.employeeId.lastName}`
      : '';

    // Log audit
    await logAudit({
      user: req.user,
      action: AUDIT_ACTIONS.OFFBOARDING_CANCELLED,
      module: 'OFFBOARDING',
      entityId: offboarding._id,
      offboardingId: offboarding._id,
      employeeId: offboarding.employeeId?._id,
      employeeName,
      remarks: `Offboarding cancelled. Reason: ${offboarding.cancelReason}`
    });

    return successResponse(res, 'Offboarding case cancelled successfully', offboarding);
  } catch (error) {
    next(error);
  }
};
