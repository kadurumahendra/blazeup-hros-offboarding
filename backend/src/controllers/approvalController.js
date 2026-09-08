import { WorkflowInstance, STAGE_STATUS, WORKFLOW_STATUS } from '../models/WorkflowInstance.js';
import { Offboarding } from '../models/Offboarding.js';
import { Employee } from '../models/Employee.js';
import { AccessRevocation } from '../models/AccessRevocation.js';
import { ROLES } from '../models/User.js';
import { WorkflowService } from '../services/workflowService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getMyTasks = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    // Find active workflow instances
    const activeInstances = await WorkflowInstance.find({
      status: WORKFLOW_STATUS.IN_PROGRESS
    })
      .populate('employeeId')
      .populate('offboardingId');

    const tasks = [];

    for (const instance of activeInstances) {
      for (const stage of instance.stages) {
        // Condition: Stage is ACTIVE, and strictly belongs to user's role
        const isAssigned =
          stage.role === userRole ||
          (stage.assignedTo && stage.assignedTo.toString() === userId.toString() && stage.role === userRole);

        if (stage.status === STAGE_STATUS.ACTIVE && isAssigned) {
          tasks.push({
            taskId: `${instance._id}_${stage.stageId}`,
            workflowInstanceId: instance._id,
            offboardingId: instance.offboardingId?._id || instance.offboardingId,
            employee: instance.employeeId,
            stageId: stage.stageId,
            stageName: stage.stageName,
            role: stage.role,
            order: stage.order,
            executionType: stage.executionType,
            status: stage.status,
            checklist: stage.checklist,
            remarks: stage.remarks,
            dueDate: stage.dueDate,
            startedAt: stage.startedAt,
            lastReminderSentAt: stage.lastReminderSentAt,
            resignationDate: instance.offboardingId?.resignationDate,
            lastWorkingDay: instance.offboardingId?.lastWorkingDay,
            reason: instance.offboardingId?.reason
          });
        }
      }
    }

    return successResponse(res, 'Assigned clearance tasks retrieved', tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params; // format: workflowInstanceId_stageId or workflowInstanceId
    let workflowInstanceId = id;
    let targetStageId = null;

    if (id.includes('_')) {
      const parts = id.split('_');
      workflowInstanceId = parts[0];
      targetStageId = parts.slice(1).join('_');
    }

    const instance = await WorkflowInstance.findById(workflowInstanceId)
      .populate('employeeId')
      .populate('offboardingId');

    if (!instance) {
      return errorResponse(res, 'Workflow instance not found', 'NOT_FOUND', 404);
    }

    let stage = null;
    if (targetStageId) {
      stage = instance.stages.find(s => s.stageId === targetStageId);
    } else {
      // Return first active stage matching role
      stage = instance.stages.find(s => s.status === STAGE_STATUS.ACTIVE && (s.role === req.user.role || req.user.role === ROLES.SUPER_ADMIN));
    }

    if (!stage) {
      return errorResponse(res, 'Stage not found in workflow', 'NOT_FOUND', 404);
    }

    // If stage is IT Admin, fetch Access Revocation data
    let accessRevocation = null;
    if (stage.role === ROLES.ADMIN_SYSTEMS && instance.offboardingId) {
      accessRevocation = await AccessRevocation.findOne({
        offboardingId: instance.offboardingId._id || instance.offboardingId
      });
    }

    return successResponse(res, 'Clearance task details retrieved', {
      workflowInstanceId: instance._id,
      offboarding: instance.offboardingId,
      employee: instance.employeeId,
      stage,
      allStages: instance.stages.map(s => ({
        stageId: s.stageId,
        stageName: s.stageName,
        role: s.role,
        status: s.status,
        approvedByName: s.approvedByName,
        approvedAt: s.approvedAt
      })),
      accessRevocation
    });
  } catch (error) {
    next(error);
  }
};

export const approveTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stageId, remarks, checklistUpdates } = req.body;

    let workflowInstanceId = id;
    let actualStageId = stageId;

    if (id.includes('_')) {
      const parts = id.split('_');
      workflowInstanceId = parts[0];
      actualStageId = parts.slice(1).join('_');
    }

    if (!actualStageId) {
      return errorResponse(res, 'stageId is required for approval', 'VALIDATION_ERROR', 400);
    }

    const updatedInstance = await WorkflowService.approveStage({
      workflowInstanceId,
      stageId: actualStageId,
      user: req.user,
      remarks: remarks || '',
      checklistUpdates: checklistUpdates || []
    });

    return successResponse(res, 'Clearance approved successfully', updatedInstance);
  } catch (error) {
    next(error);
  }
};

export const rejectTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stageId, rejectionReason, remarks } = req.body;

    let workflowInstanceId = id;
    let actualStageId = stageId;

    if (id.includes('_')) {
      const parts = id.split('_');
      workflowInstanceId = parts[0];
      actualStageId = parts.slice(1).join('_');
    }

    if (!actualStageId) {
      return errorResponse(res, 'stageId is required for rejection', 'VALIDATION_ERROR', 400);
    }

    const updatedInstance = await WorkflowService.rejectStage({
      workflowInstanceId,
      stageId: actualStageId,
      user: req.user,
      rejectionReason: rejectionReason || remarks,
      remarks: remarks || rejectionReason
    });

    return successResponse(res, 'Clearance rejected and workflow halted', updatedInstance);
  } catch (error) {
    next(error);
  }
};

export const sendTaskReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stageId } = req.body;

    let workflowInstanceId = id;
    let actualStageId = stageId;

    if (id.includes('_')) {
      const parts = id.split('_');
      workflowInstanceId = parts[0];
      actualStageId = parts.slice(1).join('_');
    }

    const result = await WorkflowService.sendStageReminder({
      workflowInstanceId,
      stageId: actualStageId,
      senderUser: req.user
    });

    return successResponse(res, 'Reminder notification sent successfully', result);
  } catch (error) {
    next(error);
  }
};
