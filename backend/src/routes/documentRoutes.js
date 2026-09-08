import express from 'express';
import {
  generateDocument,
  downloadDocumentPDF,
  getDocumentsByOffboarding,
  getDocumentClauses,
  updateDocumentClauses
} from '../controllers/documentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../models/User.js';

const router = express.Router();

router.use(authenticate);

router.post('/generate', authorize(ROLES.HR_ADMIN, ROLES.HR, ROLES.SUPER_ADMIN), generateDocument);
router.get('/:id/download', downloadDocumentPDF);
router.get('/offboarding/:offboardingId', getDocumentsByOffboarding);
router.get('/settings/clauses', getDocumentClauses);
router.put('/settings/clauses', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), updateDocumentClauses);

export default router;
