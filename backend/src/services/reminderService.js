import { WorkflowInstance, STAGE_STATUS, WORKFLOW_STATUS } from '../models/WorkflowInstance.js';
import { WorkflowService } from './workflowService.js';

export class ReminderService {
  /**
   * Scan active workflows and send reminders for stages past their reminder interval
   */
  static async processOverdueReminders() {
    const activeWorkflows = await WorkflowInstance.find({
      status: WORKFLOW_STATUS.IN_PROGRESS
    });

    const now = new Date();
    const results = { scanned: activeWorkflows.length, remindersSent: 0, errors: [] };

    for (const instance of activeWorkflows) {
      for (const stage of instance.stages) {
        if (stage.status === STAGE_STATUS.ACTIVE) {
          // Check if reminder is due
          const startedAt = stage.startedAt ? new Date(stage.startedAt).getTime() : now.getTime();
          const lastReminder = stage.lastReminderSentAt ? new Date(stage.lastReminderSentAt).getTime() : startedAt;
          
          // Default 24 hours between reminders
          const intervalMs = 24 * 60 * 60 * 1000;
          if (now.getTime() - lastReminder >= intervalMs) {
            try {
              await WorkflowService.sendStageReminder({
                workflowInstanceId: instance._id,
                stageId: stage.stageId,
                senderUser: null
              });
              results.remindersSent++;
            } catch (err) {
              results.errors.push({ stageId: stage.stageId, error: err.message });
            }
          }
        }
      }
    }

    return results;
  }
}
