import { Employee } from '../models/Employee.js';
import { Offboarding, OFFBOARDING_STATUS } from '../models/Offboarding.js';
import { WorkflowInstance, STAGE_STATUS, WORKFLOW_STATUS } from '../models/WorkflowInstance.js';
import { Document } from '../models/Document.js';
import { AuditLog } from '../models/AuditLog.js';
import { successResponse } from '../utils/responseHandler.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Core Counts
    const [
      totalEmployees,
      activeOffboardings,
      completedOffboardings,
      cancelledOffboardings,
      completedThisMonth,
      totalDocumentsGenerated
    ] = await Promise.all([
      Employee.countDocuments(),
      Offboarding.countDocuments({
        status: { $in: [OFFBOARDING_STATUS.INITIATED, OFFBOARDING_STATUS.IN_PROGRESS] }
      }),
      Offboarding.countDocuments({ status: OFFBOARDING_STATUS.COMPLETED }),
      Offboarding.countDocuments({ status: OFFBOARDING_STATUS.CANCELLED }),
      Offboarding.countDocuments({
        status: OFFBOARDING_STATUS.COMPLETED,
        completedAt: { $gte: startOfMonth }
      }),
      Document.countDocuments()
    ]);

    // 2. Active Stage Clearances (Pending vs Overdue)
    const inProgressWorkflows = await WorkflowInstance.find({
      status: WORKFLOW_STATUS.IN_PROGRESS
    });

    let pendingApprovals = 0;
    let overdueApprovals = 0;
    const rolePendingMap = {};

    for (const wf of inProgressWorkflows) {
      for (const stage of wf.stages) {
        if (stage.status === STAGE_STATUS.ACTIVE) {
          pendingApprovals++;
          rolePendingMap[stage.role] = (rolePendingMap[stage.role] || 0) + 1;

          if (stage.dueDate && new Date(stage.dueDate) < now) {
            overdueApprovals++;
          }
        }
      }
    }

    // 3. Department-wise Breakdown
    const departmentBreakdown = await Offboarding.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$employee.department',
          totalCases: { $sum: 1 },
          activeCases: {
            $sum: {
              $cond: [
                { $in: ['$status', [OFFBOARDING_STATUS.INITIATED, OFFBOARDING_STATUS.IN_PROGRESS]] },
                1,
                0
              ]
            }
          },
          completedCases: {
            $sum: { $cond: [{ $eq: ['$status', OFFBOARDING_STATUS.COMPLETED] }, 1, 0] }
          }
        }
      },
      { $sort: { totalCases: -1 } }
    ]);

    // 4. Average Offboarding Completion Time (in days)
    const completedCases = await Offboarding.find({
      status: OFFBOARDING_STATUS.COMPLETED,
      completedAt: { $exists: true, $ne: null }
    }).select('createdAt completedAt');

    let avgCompletionDays = 0;
    if (completedCases.length > 0) {
      const totalDays = completedCases.reduce((acc, curr) => {
        const diffMs = new Date(curr.completedAt) - new Date(curr.createdAt);
        return acc + diffMs / (1000 * 60 * 60 * 24);
      }, 0);
      avgCompletionDays = Number((totalDays / completedCases.length).toFixed(1));
    }

    // 5. Recent Active Offboardings
    const recentOffboardings = await Offboarding.find()
      .populate('employeeId', 'firstName lastName employeeCode department designation')
      .populate('workflowInstanceId')
      .sort({ createdAt: -1 })
      .limit(6);

    // 6. Recent Audit Activities
    const recentAudits = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(8);

    return successResponse(res, 'Dashboard metrics calculated', {
      metrics: {
        totalEmployees,
        activeOffboardings,
        completedOffboardings,
        cancelledOffboardings,
        pendingApprovals,
        overdueApprovals,
        completedThisMonth,
        avgCompletionDays,
        totalDocumentsGenerated
      },
      rolePendingMap,
      departmentBreakdown,
      recentOffboardings,
      recentAudits
    });
  } catch (error) {
    next(error);
  }
};
