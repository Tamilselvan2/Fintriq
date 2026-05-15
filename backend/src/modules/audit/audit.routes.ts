import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { authorize } from '../../middlewares/roleMiddleware';

const router = Router();
const controller = new AuditController();

// Admin-only: only ADMINs can view the audit log
router.get('/', authenticate, authorize(['ADMIN']), controller.list);


export default router;
