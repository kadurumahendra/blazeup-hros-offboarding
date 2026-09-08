import express from 'express';
import {
  getMyTasks,
  getTaskById,
  approveTask,
  rejectTask,
  sendTaskReminder
} from '../controllers/approvalController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/my-tasks', getMyTasks);
router.get('/:id', getTaskById);
router.post('/:id/approve', approveTask);
router.post('/:id/reject', rejectTask);
router.post('/:id/reminder', sendTaskReminder);

export default router;
