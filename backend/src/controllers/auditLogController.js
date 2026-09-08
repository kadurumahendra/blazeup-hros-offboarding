import { AuditLog } from '../models/AuditLog.js';
import { paginatedResponse, successResponse } from '../utils/responseHandler.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const {
      search,
      action,
      role,
      offboardingId,
      employeeId,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (action) query.action = action;
    if (role) query.role = role;
    if (offboardingId) query.offboardingId = offboardingId;
    if (employeeId) query.employeeId = employeeId;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { employeeName: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } },
        { stage: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

    return paginatedResponse(res, 'Audit logs retrieved successfully', logs, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const getAuditLogStats = async (req, res, next) => {
  try {
    const actionCounts = await AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentActivity = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(10);

    return successResponse(res, 'Audit statistics retrieved', {
      actionCounts,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};
