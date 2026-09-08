import express from 'express';
import {
  createOffboarding,
  getOffboardings,
  getOffboardingById,
  updateOffboarding,
  cancelOffboarding
} from '../controllers/offboardingController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../models/User.js';

const router = express.Router();

router.use(authenticate);

// HR_ADMIN, HR, and SUPER_ADMIN can create and manage offboardings
router.post('/', authorize(ROLES.HR_ADMIN, ROLES.HR, ROLES.SUPER_ADMIN), createOffboarding);
router.get('/', getOffboardings);
router.get('/:id', getOffboardingById);
router.put('/:id', authorize(ROLES.HR_ADMIN, ROLES.HR, ROLES.SUPER_ADMIN), updateOffboarding);
router.post('/:id/cancel', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), cancelOffboarding);

export default router;
