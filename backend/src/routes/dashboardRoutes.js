import express from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/metrics', getDashboardMetrics);
router.get('/stats', getDashboardMetrics);

export default router;
