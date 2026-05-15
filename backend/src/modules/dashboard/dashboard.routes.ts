import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { validateQuery } from '../../middlewares/validateRequest';
import { getDashboardQuerySchema } from './dashboard.validation';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();
const controller = new DashboardController();

// Dashboard is read-only and accessible by authenticated users in their organization
router.use(authenticate);

router.get(
  '/', 
  validateQuery(getDashboardQuerySchema), 
  controller.getAnalytics
);

export default router;
