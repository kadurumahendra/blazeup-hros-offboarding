import { WorkflowTemplate, PROCESS_TYPES, EXECUTION_TYPES } from '../models/WorkflowTemplate.js';
import { logAudit } from '../services/auditLogService.js';
import { AUDIT_ACTIONS } from '../models/AuditLog.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const getWorkflowTemplates = async (req, res, next) => {
  try {
    const { processType } = req.query;
    const query = {};
    if (processType) query.processType = processType;

    const templates = await WorkflowTemplate.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Workflow templates retrieved', templates);
  } catch (error) {
    next(error);
  }
};

export const getWorkflowTemplateById = async (req, res, next) => {
  try {
    const template = await WorkflowTemplate.findById(req.params.id).populate('createdBy', 'name email role');
    if (!template) {
      return errorResponse(res, 'Workflow template not found', 'NOT_FOUND', 404);
    }
    return successResponse(res, 'Workflow template retrieved', template);
  } catch (error) {
    next(error);
  }
};

export const createWorkflowTemplate = async (req, res, next) => {
  try {
    const { name, processType, description, isActive, stages } = req.body;

    if (!name || !stages || !Array.isArray(stages) || stages.length === 0) {
      return errorResponse(res, 'Name and at least one stage definition are required', 'VALIDATION_ERROR', 400);
    }

    // Validate stages
    for (const [idx, stage] of stages.entries()) {
      if (!stage.stageId || !stage.name || !stage.role) {
        return errorResponse(res, `Stage at index ${idx} is missing required fields (stageId, name, role)`, 'VALIDATION_ERROR', 400);
      }
      stage.order = stage.order || idx + 1;
      stage.executionType = stage.executionType || EXECUTION_TYPES.SEQUENTIAL;
      stage.dependsOn = stage.dependsOn || [];
      stage.checklist = stage.checklist || [];
    }

    // If marked active, deactivate others for same processType
    if (isActive) {
      await WorkflowTemplate.updateMany(
        { processType: processType || PROCESS_TYPES.OFFBOARDING },
        { isActive: false }
      );
    }

    const template = await WorkflowTemplate.create({
      name,
      processType: processType || PROCESS_TYPES.OFFBOARDING,
      description: description || '',
      isActive: isActive !== undefined ? isActive : true,
      stages,
      createdBy: req.user._id
    });

    await logAudit({
      user: req.user,
      action: AUDIT_ACTIONS.WORKFLOW_TEMPLATE_CREATED,
      module: 'WORKFLOW_CONFIG',
      entityId: template._id,
      remarks: `Created workflow template '${template.name}' with ${template.stages.length} stages`
    });

    return successResponse(res, 'Workflow template created successfully', template, 201);
  } catch (error) {
    next(error);
  }
};

export const updateWorkflowTemplate = async (req, res, next) => {
  try {
    const { name, description, isActive, stages } = req.body;
    const template = await WorkflowTemplate.findById(req.params.id);

    if (!template) {
      return errorResponse(res, 'Workflow template not found', 'NOT_FOUND', 404);
    }

    if (isActive && !template.isActive) {
      await WorkflowTemplate.updateMany(
        { processType: template.processType, _id: { $ne: template._id } },
        { isActive: false }
      );
    }

    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (isActive !== undefined) template.isActive = isActive;
    if (stages && Array.isArray(stages) && stages.length > 0) {
      template.stages = stages;
    }

    await template.save();

    await logAudit({
      user: req.user,
      action: AUDIT_ACTIONS.WORKFLOW_TEMPLATE_UPDATED,
      module: 'WORKFLOW_CONFIG',
      entityId: template._id,
      remarks: `Updated workflow template '${template.name}'`
    });

    return successResponse(res, 'Workflow template updated successfully', template);
  } catch (error) {
    next(error);
  }
};

export const duplicateWorkflowTemplate = async (req, res, next) => {
  try {
    const template = await WorkflowTemplate.findById(req.params.id);
    if (!template) {
      return errorResponse(res, 'Workflow template not found', 'NOT_FOUND', 404);
    }

    const newTemplate = await WorkflowTemplate.create({
      name: `${template.name} (Copy)`,
      processType: template.processType,
      description: template.description,
      isActive: false,
      stages: template.stages,
      createdBy: req.user._id
    });

    return successResponse(res, 'Workflow template duplicated successfully', newTemplate, 201);
  } catch (error) {
    next(error);
  }
};
