import express from 'express';
import { getAuditLogs, getAuditLogStats } from '../controllers/auditLogController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../models/User.js';

const router = express.Router();

router.use(authenticate);

// HR_ADMIN and SUPER_ADMIN have access to full enterprise audit trail
router.get('/', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), getAuditLogs);
router.get('/stats', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), getAuditLogStats);

export default router;
