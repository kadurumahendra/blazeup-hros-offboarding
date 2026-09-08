import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({
  user = null,
  action,
  module = 'OFFBOARDING',
  entityId = null,
  offboardingId = null,
  employeeId = null,
  employeeName = '',
  stage = '',
  remarks = '',
  metadata = {}
}) => {
  try {
    const auditRecord = await AuditLog.create({
      userId: user?._id || null,
      userName: user?.name || 'System',
      role: user?.role || 'SYSTEM',
      action,
      module,
      entityId,
      offboardingId,
      employeeId,
      employeeName,
      stage,
      remarks,
      metadata,
      timestamp: new Date()
    });
    return auditRecord;
  } catch (error) {
    console.error('[AuditLog] Failed to record audit log:', error.message);
    return null;
  }
};
