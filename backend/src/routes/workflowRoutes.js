import express from 'express';
import {
  getWorkflowTemplates,
  getWorkflowTemplateById,
  createWorkflowTemplate,
  updateWorkflowTemplate,
  duplicateWorkflowTemplate
} from '../controllers/workflowController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../models/User.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getWorkflowTemplates);
router.get('/:id', getWorkflowTemplateById);
router.post('/', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), createWorkflowTemplate);
router.put('/:id', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), updateWorkflowTemplate);
router.post('/:id/duplicate', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), duplicateWorkflowTemplate);

export default router;
