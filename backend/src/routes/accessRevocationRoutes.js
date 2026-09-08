import express from 'express';
import {
  getAllAccessRevocations,
  getAccessRevocationByCase,
  revokeSingleAccess,
  revokeAllCaseAccess
} from '../controllers/accessRevocationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../models/User.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN_SYSTEMS, ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), getAllAccessRevocations);
router.get('/:offboardingId', getAccessRevocationByCase);
router.post(
  '/:offboardingId/revoke',
  authorize(ROLES.ADMIN_SYSTEMS, ROLES.HR_ADMIN, ROLES.SUPER_ADMIN),
  revokeSingleAccess
);
router.post(
  '/:offboardingId/revoke-all',
  authorize(ROLES.ADMIN_SYSTEMS, ROLES.HR_ADMIN, ROLES.SUPER_ADMIN),
  revokeAllCaseAccess
);

export default router;
