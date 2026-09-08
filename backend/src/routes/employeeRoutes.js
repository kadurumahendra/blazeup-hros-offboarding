import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  getEligibleForOffboarding
} from '../controllers/employeeController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../models/User.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(ROLES.HR_ADMIN, ROLES.HR, ROLES.SUPER_ADMIN), getEmployees);
router.get('/eligible-offboarding', authorize(ROLES.HR_ADMIN, ROLES.HR, ROLES.SUPER_ADMIN), getEligibleForOffboarding);
router.get('/:id', getEmployeeById);
router.post('/', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), createEmployee);
router.put('/:id', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), updateEmployee);

export default router;
