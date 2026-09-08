import { AccessRevocation, ACCESS_STATUS } from '../models/AccessRevocation.js';
import { Employee } from '../models/Employee.js';
import { logAudit } from './auditLogService.js';
import { AUDIT_ACTIONS } from '../models/AuditLog.js';
import { sendNotification } from './notificationService.js';

export class AccessRevocationService {
  /**
   * Get or initialize access revocation record for an offboarding case
   */
  static async getOrCreateRecord(offboardingId, employeeId) {
    let record = await AccessRevocation.findOne({ offboardingId });
    if (!record) {
      record = await AccessRevocation.create({
        offboardingId,
        employeeId
      });
    }
    return record;
  }

  /**
   * Revoke a single system access
   */
  static async revokeAccess({ offboardingId, accessKey, user, auditNote = '' }) {
    const record = await AccessRevocation.findOne({ offboardingId });
    if (!record) {
      throw new Error('Access revocation record not found for offboarding case');
    }

    const item = record.items.find(i => i.accessKey === accessKey);
    if (!item) {
      throw new Error(`System access '${accessKey}' not found in record`);
    }

    const now = new Date();
    item.status = ACCESS_STATUS.REVOKED;
    item.revokedBy = user._id;
    item.revokedByName = user.name;
    item.revokedAt = now;
    item.auditNote = auditNote || `Simulated revocation for ${item.systemName} triggered by ${user.name}`;

    // Check if all items are revoked
    record.allRevoked = record.items.every(i => i.status === ACCESS_STATUS.REVOKED);
    record.lastUpdatedBy = user._id;
    await record.save();

    const employee = await Employee.findById(record.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : '';

    // Log audit
    await logAudit({
      user,
      action: AUDIT_ACTIONS.ACCESS_REVOKED,
      module: 'ACCESS_CONTROL',
      entityId: record._id,
      offboardingId,
      employeeId: record.employeeId,
      employeeName,
      stage: 'Admin & Systems Clearance',
      remarks: `Access revoked for ${item.systemName} (${item.accessKey})`,
      metadata: { accessKey, systemName: item.systemName, isSimulated: item.isSimulated }
    });

    return { record, item };
  }

  /**
   * Bulk revoke all pending accesses
   */
  static async revokeAllAccess({ offboardingId, user, auditNote = '' }) {
    const record = await AccessRevocation.findOne({ offboardingId });
    if (!record) {
      throw new Error('Access revocation record not found for offboarding case');
    }

    const now = new Date();
    let count = 0;

    for (const item of record.items) {
      if (item.status !== ACCESS_STATUS.REVOKED) {
        item.status = ACCESS_STATUS.REVOKED;
        item.revokedBy = user._id;
        item.revokedByName = user.name;
        item.revokedAt = now;
        item.auditNote = auditNote || `Simulated bulk revocation executed by ${user.name}`;
        count++;
      }
    }

    record.allRevoked = true;
    record.lastUpdatedBy = user._id;
    await record.save();

    const employee = await Employee.findById(record.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : '';

    // Log audit
    await logAudit({
      user,
      action: AUDIT_ACTIONS.ACCESS_BULK_REVOKED,
      module: 'ACCESS_CONTROL',
      entityId: record._id,
      offboardingId,
      employeeId: record.employeeId,
      employeeName,
      stage: 'Admin & Systems Clearance',
      remarks: `Bulk access revocation completed (${count} systems revoked)`,
      metadata: { totalRevoked: count }
    });

    return { record, count };
  }
}
