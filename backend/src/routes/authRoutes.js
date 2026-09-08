import express from 'express';
import { register, login, getCurrentUser, getDemoUsers } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.get('/demo-users', getDemoUsers);

export default router;
