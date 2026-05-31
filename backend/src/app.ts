import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { prisma } from './db/prisma';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import transactionRoutes from './modules/transaction/transaction.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import organizationRoutes from './modules/organization/organization.routes';
import auditRoutes from './modules/audit/audit.routes';

const app = express();
const API_VERSION = process.env.npm_package_version || '1.0.0';

const createRateLimitHandler = (message: string) => (req: express.Request, res: express.Response) => {
  res.status(429).json({ success: false, message });
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
  handler: createRateLimitHandler('Too many requests, please try again later.'),
});

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // If no origin (e.g., server-to-server or Postman), allow it
    if (!origin) {
      return callback(null, true);
    }

    const configuredOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Remove trailing slash if present for comparison
    const normalizedConfiguredOrigin = configuredOrigin.replace(/\/$/, '');
    const normalizedOrigin = origin.replace(/\/$/, '');

    const allowed = [
      normalizedConfiguredOrigin,
      'http://localhost:3000',
      'http://localhost:3001',
    ];

    if (allowed.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
app.use('/api', apiLimiter);

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'Fintriq API',
      version: API_VERSION,
      status: 'reachable',
      timestamp: new Date().toISOString(),
      health: '/health',
      routeGroups: {
        auth: '/api/auth',
        transactions: '/api/transactions',
        dashboard: '/api/dashboard',
        organizations: '/api/organizations',
        audit: '/api/audit',
      },
    },
  });
});

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      db: 'ok',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      db: 'unavailable',
      message: 'Database connection failed',
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/audit', auditRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
