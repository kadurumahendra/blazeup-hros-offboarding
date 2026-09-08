import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import offboardingRoutes from './routes/offboardingRoutes.js';
import approvalRoutes from './routes/approvalRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import accessRevocationRoutes from './routes/accessRevocationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date(),
    service: 'BlazeUp HROS Engine',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/offboarding', offboardingRoutes);
app.use('/api/offboardings', offboardingRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/access-revocation', accessRevocationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Middleware
app.use(errorHandler);

export default app;
