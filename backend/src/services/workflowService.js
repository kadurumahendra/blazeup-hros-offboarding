import { WorkflowTemplate, EXECUTION_TYPES, PROCESS_TYPES } from '../models/WorkflowTemplate.js';
import { WorkflowInstance, STAGE_STATUS, WORKFLOW_STATUS } from '../models/WorkflowInstance.js';
import { Offboarding, OFFBOARDING_STATUS } from '../models/Offboarding.js';
import { Employee, EMPLOYEE_STATUS } from '../models/Employee.js';
import { User, ROLES } from '../models/User.js';
import { logAudit } from './auditLogService.js';
import { sendNotification } from './notificationService.js';
import { AUDIT_ACTIONS } from '../models/AuditLog.js';

export class WorkflowService {
  /**
   * Fetch active template by process type
   */
  static async getActiveTemplate(processType = PROCESS_TYPES.OFFBOARDING) {
    const template = await WorkflowTemplate.findOne({ processType, isActive: true });
    if (!template) {
      throw new Error(`No active workflow template found for process type '${processType}'`);
    }
    return template;
  }

  /**
   * Instantiate a new workflow from template for an entity (e.g. employee offboarding)
   */
  static async createInstance({
    templateId = null,
    processType = PROCESS_TYPES.OFFBOARDING,
    offboardingId,
    employeeId,
    initiatedBy
  }) {
    let template;
    if (templateId) {
      template = await WorkflowTemplate.findById(templateId);
    } else {
      template = await this.getActiveTemplate(processType);
    }

    if (!template) {
      throw new Error('Workflow template not found');
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found for workflow instantiation');
    }

    // Build stage instances from template definitions
    const now = new Date();
    const stageInstances = [];

    for (const stageDef of template.stages) {
      let assignedUser = null;

      // Role specific assignment logic (e.g., manager assignment)
      if (stageDef.role === ROLES.MANAGER && employee.managerId) {
        assignedUser = await User.findById(employee.managerId);
      }
      if (!assignedUser) {
        // Find default active user for this role
        assignedUser = await User.findOne({ role: stageDef.role, isActive: true });
      }

      const checklistItems = (stageDef.checklist || []).map(item => ({
        itemId: item.itemId || `chk_${Math.random().toString(36).substring(2, 9)}`,
        label: item.label,
        isRequired: item.isRequired !== false,
        isCompleted: false,
        category: item.category || 'General',
        completedAt: null,
        completedBy: null,
        notes: ''
      }));

      const deadlineHours = stageDef.deadlineHours || 48;
      const dueDate = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000);

      stageInstances.push({
        stageId: stageDef.stageId,
        stageName: stageDef.name,
        role: stageDef.role,
        order: stageDef.order,
        executionType: stageDef.executionType,
        dependsOn: stageDef.dependsOn || [],
        assignedTo: assignedUser ? assignedUser._id : null,
        assignedToName: assignedUser ? assignedUser.name : '',
        status: STAGE_STATUS.WAITING,
        checklist: checklistItems,
        remarks: '',
        startedAt: null,
        completedAt: null,
        dueDate,
        approvedBy: null,
        approvedByName: '',
        approvedAt: null,
        rejectedBy: null,
        rejectedByName: '',
        rejectedAt: null,
        rejectionReason: '',
        lastReminderSentAt: null
      });
    }

    // Create workflow instance in DB
    const instance = await WorkflowInstance.create({
      templateId: template._id,
      processType,
      offboardingId,
      employeeId,
      status: WORKFLOW_STATUS.IN_PROGRESS,
      stages: stageInstances,
      startedAt: now
    });

    // Activate initial eligible stages
    await this.activateEligibleStages(instance, initiatedBy, employee);

    // Audit log
    await logAudit({
      user: initiatedBy,
      action: AUDIT_ACTIONS.WORKFLOW_INSTANTIATED,
      module: 'WORKFLOW',
      entityId: instance._id,
      offboardingId,
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      remarks: `Workflow initiated using template '${template.name}'`
    });

    return instance;
  }

  /**
   * Determine and activate all eligible stages based on dependsOn and execution rules
   */
  static async activateEligibleStages(instance, actor = null, employee = null) {
    let updated = false;
    const now = new Date();

    if (!employee) {
      employee = await Employee.findById(instance.employeeId);
    }

    const approvedStageIds = new Set(
      instance.stages
        .filter(s => s.status === STAGE_STATUS.APPROVED || s.status === STAGE_STATUS.SKIPPED)
        .map(s => s.stageId)
    );

    for (const stage of instance.stages) {
      if (stage.status === STAGE_STATUS.WAITING) {
        const dependenciesMet =
          !stage.dependsOn ||
          stage.dependsOn.length === 0 ||
          stage.dependsOn.every(depId => approvedStageIds.has(depId));

        if (dependenciesMet) {
          stage.status = STAGE_STATUS.ACTIVE;
          stage.startedAt = now;
          updated = true;

          // Notify assigned role/user
          await sendNotification({
            userId: stage.assignedTo,
            targetRole: stage.role,
            title: `Clearance Required: ${stage.stageName}`,
            message: `A clearance task '${stage.stageName}' for ${employee ? employee.firstName + ' ' + employee.lastName : 'employee'} is now active and requires your review.`,
            type: 'TASK_ASSIGNED',
            relatedEntity: 'OFFBOARDING',
            relatedEntityId: instance.offboardingId,
            sendEmail: true
          });

          // Log audit
          await logAudit({
            user: actor,
            action: AUDIT_ACTIONS.STAGE_ACTIVATED,
            module: 'WORKFLOW',
            entityId: instance._id,
            offboardingId: instance.offboardingId,
            employeeId: instance.employeeId,
            employeeName: employee ? `${employee.firstName} ${employee.lastName}` : '',
            stage: stage.stageName,
            remarks: `Stage '${stage.stageName}' activated for role ${stage.role}`
          });
        }
      }
    }

    if (updated) {
      await instance.save();
    }

    return instance;
  }

  /**
   * Approve a stage within a workflow instance
   */
  static async approveStage({
    workflowInstanceId,
    stageId,
    user,
    remarks = '',
    checklistUpdates = []
  }) {
    const instance = await WorkflowInstance.findById(workflowInstanceId);
    if (!instance) {
      throw new Error('Workflow instance not found');
    }

    if (instance.status !== WORKFLOW_STATUS.IN_PROGRESS && instance.status !== WORKFLOW_STATUS.INITIATED) {
      throw new Error(`Cannot approve stage. Workflow is currently in '${instance.status}' status.`);
    }

    const stage = instance.stages.find(s => s.stageId === stageId);
    if (!stage) {
      throw new Error(`Stage '${stageId}' not found in workflow`);
    }

    if (stage.status !== STAGE_STATUS.ACTIVE) {
      throw new Error(`Cannot approve stage '${stage.stageName}'. Current stage status is '${stage.status}', must be 'ACTIVE'.`);
    }

    // Strict Role check: Authenticated user must have the exact matching role for this stage
    if (user.role !== stage.role) {
      const err = new Error('You are not authorized to approve this workflow stage.');
      err.statusCode = 403;
      throw err;
    }

    // Update checklist items
    if (checklistUpdates && checklistUpdates.length > 0) {
      const updateMap = new Map(checklistUpdates.map(u => [u.itemId, u]));
      for (const item of stage.checklist) {
        if (updateMap.has(item.itemId)) {
          const update = updateMap.get(item.itemId);
          item.isCompleted = Boolean(update.isCompleted);
          item.notes = update.notes || item.notes;
          item.completedAt = update.isCompleted ? new Date() : null;
          item.completedBy = update.isCompleted ? user._id : null;
        }
      }
    }

    // Validate that all required checklist items are completed
    const pendingRequired = stage.checklist.filter(item => item.isRequired && !item.isCompleted);
    if (pendingRequired.length > 0) {
      const missingLabels = pendingRequired.map(i => i.label).join(', ');
      throw new Error(`Please complete all mandatory checklist items before approving: [${missingLabels}]`);
    }

    // Mark stage as APPROVED
    const now = new Date();
    stage.status = STAGE_STATUS.APPROVED;
    stage.remarks = remarks || stage.remarks;
    stage.approvedBy = user._id;
    stage.approvedByName = user.name;
    stage.approvedAt = now;
    stage.completedAt = now;

    const employee = await Employee.findById(instance.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : '';

    // Log audit for stage approval
    await logAudit({
      user,
      action: AUDIT_ACTIONS.STAGE_APPROVED,
      module: 'WORKFLOW',
      entityId: instance._id,
      offboardingId: instance.offboardingId,
      employeeId: instance.employeeId,
      employeeName,
      stage: stage.stageName,
      remarks: remarks || `Stage '${stage.stageName}' approved by ${user.name}`
    });

    // Notify HR
    await sendNotification({
      targetRole: ROLES.HR_ADMIN,
      title: `Clearance Approved: ${stage.stageName}`,
      message: `${stage.stageName} clearance for ${employeeName} has been approved by ${user.name} (${user.role}).`,
      type: 'STAGE_APPROVED',
      relatedEntity: 'OFFBOARDING',
      relatedEntityId: instance.offboardingId,
      sendEmail: false
    });

    // Check & activate next eligible stages
    await this.activateEligibleStages(instance, user, employee);

    // Check if ALL stages in the workflow are approved
    const allStagesApproved = instance.stages.every(
      s => s.status === STAGE_STATUS.APPROVED || s.status === STAGE_STATUS.SKIPPED
    );

    if (allStagesApproved) {
      instance.status = WORKFLOW_STATUS.COMPLETED;
      instance.completedAt = now;
      await instance.save();

      // Update parent Offboarding status
      if (instance.offboardingId) {
        await Offboarding.findByIdAndUpdate(instance.offboardingId, {
          status: OFFBOARDING_STATUS.COMPLETED,
          completedAt: now
        });
      }

      // Update employee status to RELIEVED
      if (instance.employeeId) {
        await Employee.findByIdAndUpdate(instance.employeeId, {
          status: EMPLOYEE_STATUS.RELIEVED
        });
      }

      // Log audit
      await logAudit({
        user,
        action: AUDIT_ACTIONS.WORKFLOW_COMPLETED,
        module: 'WORKFLOW',
        entityId: instance._id,
        offboardingId: instance.offboardingId,
        employeeId: instance.employeeId,
        employeeName,
        remarks: 'All clearance stages approved. Offboarding workflow successfully completed.'
      });

      // Send completion notifications
      await sendNotification({
        targetRole: ROLES.HR_ADMIN,
        title: `Offboarding Completed: ${employeeName}`,
        message: `All clearances have been completed for ${employeeName}. Offboarding documents are now available for generation.`,
        type: 'COMPLETED',
        relatedEntity: 'OFFBOARDING',
        relatedEntityId: instance.offboardingId,
        sendEmail: true
      });
    } else {
      await instance.save();
    }

    return instance;
  }

  /**
   * Reject a stage and fail the workflow
   */
  static async rejectStage({
    workflowInstanceId,
    stageId,
    user,
    rejectionReason = '',
    remarks = ''
  }) {
    const instance = await WorkflowInstance.findById(workflowInstanceId);
    if (!instance) {
      throw new Error('Workflow instance not found');
    }

    const stage = instance.stages.find(s => s.stageId === stageId);
    if (!stage) {
      throw new Error(`Stage '${stageId}' not found in workflow`);
    }

    if (stage.status !== STAGE_STATUS.ACTIVE) {
      throw new Error(`Cannot reject stage '${stage.stageName}'. Current stage status is '${stage.status}', must be 'ACTIVE'.`);
    }

    if (user.role !== stage.role) {
      const err = new Error('You are not authorized to reject this workflow stage.');
      err.statusCode = 403;
      throw err;
    }

    if (!rejectionReason && !remarks) {
      throw new Error('Rejection reason or remarks must be provided');
    }

    const reason = rejectionReason || remarks;
    const now = new Date();

    stage.status = STAGE_STATUS.REJECTED;
    stage.rejectedBy = user._id;
    stage.rejectedByName = user.name;
    stage.rejectedAt = now;
    stage.rejectionReason = reason;
    stage.remarks = remarks || reason;
    stage.completedAt = now;

    instance.status = WORKFLOW_STATUS.REJECTED;
    await instance.save();

    const employee = await Employee.findById(instance.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : '';

    if (instance.offboardingId) {
      await Offboarding.findByIdAndUpdate(instance.offboardingId, {
        status: OFFBOARDING_STATUS.REJECTED
      });
    }

    // Log audit
    await logAudit({
      user,
      action: AUDIT_ACTIONS.STAGE_REJECTED,
      module: 'WORKFLOW',
      entityId: instance._id,
      offboardingId: instance.offboardingId,
      employeeId: instance.employeeId,
      employeeName,
      stage: stage.stageName,
      remarks: `Stage '${stage.stageName}' rejected: ${reason}`
    });

    // Notify HR
    await sendNotification({
      targetRole: ROLES.HR_ADMIN,
      title: `Clearance REJECTED: ${stage.stageName} for ${employeeName}`,
      message: `${stage.stageName} clearance was rejected by ${user.name} (${user.role}). Reason: ${reason}`,
      type: 'STAGE_REJECTED',
      relatedEntity: 'OFFBOARDING',
      relatedEntityId: instance.offboardingId,
      sendEmail: true
    });

    return instance;
  }

  /**
   * Send a reminder for an active stage
   */
  static async sendStageReminder({ workflowInstanceId, stageId, senderUser }) {
    const instance = await WorkflowInstance.findById(workflowInstanceId);
    if (!instance) {
      throw new Error('Workflow instance not found');
    }

    const stage = instance.stages.find(s => s.stageId === stageId);
    if (!stage) {
      throw new Error('Stage not found');
    }

    if (stage.status !== STAGE_STATUS.ACTIVE) {
      throw new Error(`Cannot send reminder. Stage is '${stage.status}', not ACTIVE.`);
    }

    const employee = await Employee.findById(instance.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : '';

    stage.lastReminderSentAt = new Date();
    await instance.save();

    // Send notification
    await sendNotification({
      userId: stage.assignedTo,
      targetRole: stage.role,
      title: `Reminder: Pending Clearance for ${employeeName}`,
      message: `Friendly reminder: The '${stage.stageName}' clearance task for ${employeeName} is pending your approval.`,
      type: 'REMINDER',
      relatedEntity: 'OFFBOARDING',
      relatedEntityId: instance.offboardingId,
      sendEmail: true
    });

    // Audit log
    await logAudit({
      user: senderUser,
      action: AUDIT_ACTIONS.REMINDER_SENT,
      module: 'WORKFLOW',
      entityId: instance._id,
      offboardingId: instance.offboardingId,
      employeeId: instance.employeeId,
      employeeName,
      stage: stage.stageName,
      remarks: `Reminder dispatched to role ${stage.role}`
    });

    return { success: true, stageName: stage.stageName, sentAt: stage.lastReminderSentAt };
  }
}
