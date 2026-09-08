import { Document, DOCUMENT_TYPES } from '../models/Document.js';
import { Offboarding, OFFBOARDING_STATUS } from '../models/Offboarding.js';
import { Employee } from '../models/Employee.js';
import { WorkflowInstance, WORKFLOW_STATUS } from '../models/WorkflowInstance.js';
import { DocumentClause } from '../models/DocumentClause.js';
import { PDFService } from '../services/pdfService.js';
import { logAudit } from '../services/auditLogService.js';
import { AUDIT_ACTIONS } from '../models/AuditLog.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const generateDocument = async (req, res, next) => {
  try {
    const { offboardingId, type, customOptions = {} } = req.body;

    if (!offboardingId || !type) {
      return errorResponse(res, 'offboardingId and document type are required', 'VALIDATION_ERROR', 400);
    }

    if (!Object.values(DOCUMENT_TYPES).includes(type)) {
      return errorResponse(res, `Invalid document type. Allowed: [${Object.values(DOCUMENT_TYPES).join(', ')}]`, 'VALIDATION_ERROR', 400);
    }

    const offboarding = await Offboarding.findById(offboardingId).populate('employeeId');
    if (!offboarding) {
      return errorResponse(res, 'Offboarding case not found', 'NOT_FOUND', 404);
    }

    const employee = offboarding.employeeId;
    const workflow = await WorkflowInstance.findById(offboarding.workflowInstanceId);

    // Business Rules Verification:
    // 1. NOC requires all departmental stages or completed workflow
    if (type === DOCUMENT_TYPES.NOC) {
      if (offboarding.status !== OFFBOARDING_STATUS.COMPLETED && workflow && workflow.status !== WORKFLOW_STATUS.COMPLETED) {
        // Check if departmental stages are completed
        const isReady = workflow?.stages.filter(s => s.role !== 'HR').every(s => s.status === 'APPROVED');
        if (!isReady && offboarding.status !== OFFBOARDING_STATUS.COMPLETED) {
          return errorResponse(
            res,
            'Cannot generate NOC until all departmental clearance stages (Manager, IT, Accounts, Personnel) are approved.',
            'RULE_VIOLATION',
            400
          );
        }
      }
    }

    // 2. Relieving Letter and Experience Letter require completed offboarding workflow
    if (type === DOCUMENT_TYPES.RELIEVING_LETTER || type === DOCUMENT_TYPES.EXPERIENCE_LETTER) {
      if (offboarding.status !== OFFBOARDING_STATUS.COMPLETED) {
        return errorResponse(
          res,
          `Cannot generate ${type.replace('_', ' ')} until offboarding workflow is fully completed and all approvals are finalized.`,
          'RULE_VIOLATION',
          400
        );
      }
    }

    const fileName = `${type}_${employee.employeeCode}_${Date.now()}.pdf`;
    let title = '';
    switch (type) {
      case DOCUMENT_TYPES.RESIGNATION_ACCEPTANCE:
        title = 'Resignation Acceptance Letter';
        break;
      case DOCUMENT_TYPES.NOC:
        title = 'Clearance Certificate (NOC)';
        break;
      case DOCUMENT_TYPES.RELIEVING_LETTER:
        title = 'Relieving Letter';
        break;
      case DOCUMENT_TYPES.EXPERIENCE_LETTER:
        title = 'Experience & Service Certificate';
        break;
    }

    // Save document record in DB
    const documentRecord = await Document.create({
      offboardingId: offboarding._id,
      employeeId: employee._id,
      type,
      title,
      fileName,
      mimeType: 'application/pdf',
      generatedBy: req.user._id,
      generatedByName: req.user.name,
      customClauses: {
        nonCompete: customOptions.nonCompete !== false,
        nonSolicitation: customOptions.nonSolicitation !== false,
        confidentiality: customOptions.confidentiality !== false
      }
    });

    // Log Audit
    await logAudit({
      user: req.user,
      action: AUDIT_ACTIONS.DOCUMENT_GENERATED,
      module: 'DOCUMENTS',
      entityId: documentRecord._id,
      offboardingId: offboarding._id,
      employeeId: employee._id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      remarks: `Generated ${title} for ${employee.firstName} ${employee.lastName}`
    });

    return successResponse(res, `${title} generated successfully`, documentRecord, 201);
  } catch (error) {
    next(error);
  }
};

export const downloadDocumentPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const documentRecord = await Document.findById(id).populate('employeeId');

    if (!documentRecord) {
      return errorResponse(res, 'Document record not found', 'NOT_FOUND', 404);
    }

    // Role check: Employee can only download their own documents
    if (req.user.role === 'EMPLOYEE') {
      const docEmpId = documentRecord.employeeId?._id?.toString() || documentRecord.employeeId?.toString();
      const userEmpId = req.user.employeeId?._id?.toString() || req.user.employeeId?.toString();
      if (!userEmpId || docEmpId !== userEmpId) {
        return errorResponse(res, 'You are not authorized to access this document.', 'FORBIDDEN', 403);
      }
    }

    const offboarding = await Offboarding.findById(documentRecord.offboardingId);
    const employee = documentRecord.employeeId;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${documentRecord.fileName}"`);

    const pdfDoc = await PDFService.generateDocumentPDF({
      docType: documentRecord.type,
      employee,
      offboarding,
      user: req.user,
      customOptions: documentRecord.customClauses
    });

    pdfDoc.pipe(res);
  } catch (error) {
    next(error);
  }
};

export const getDocumentsByOffboarding = async (req, res, next) => {
  try {
    const { offboardingId } = req.params;
    const documents = await Document.find({ offboardingId }).sort({ generatedAt: -1 });
    return successResponse(res, 'Documents retrieved', documents);
  } catch (error) {
    next(error);
  }
};

export const getDocumentClauses = async (req, res, next) => {
  try {
    let clauses = await DocumentClause.findOne();
    if (!clauses) {
      clauses = await DocumentClause.create({});
    }
    return successResponse(res, 'Document clauses retrieved', clauses);
  } catch (error) {
    next(error);
  }
};

export const updateDocumentClauses = async (req, res, next) => {
  try {
    let clauses = await DocumentClause.findOne();
    if (!clauses) {
      clauses = new DocumentClause(req.body);
    } else {
      Object.assign(clauses, req.body);
    }
    clauses.updatedBy = req.user._id;
    await clauses.save();

    await logAudit({
      user: req.user,
      action: AUDIT_ACTIONS.CLAUSE_SETTINGS_UPDATED,
      module: 'SETTINGS',
      remarks: 'Updated legal document templates and company clauses'
    });

    return successResponse(res, 'Document clauses updated successfully', clauses);
  } catch (error) {
    next(error);
  }
};
