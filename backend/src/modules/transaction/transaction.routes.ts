import { Router } from 'express';
import { TransactionController } from './transaction.controller';
import { validateRequest, validateParams, validateQuery } from '../../middlewares/validateRequest';
import { authenticate } from '../../middlewares/authMiddleware';
import { authorize } from '../../middlewares/roleMiddleware';
import { 
  createTransactionSchema, 
  updateTransactionSchema, 
  getTransactionParamsSchema, 
  listTransactionsQuerySchema 
} from './transaction.validation';

const router = Router();
const controller = new TransactionController();

router.use(authenticate);

router.post(
  '/', 
  authorize(['ADMIN', 'ACCOUNTANT']), 
  validateRequest(createTransactionSchema), 
  controller.create
);

router.post(
  '/seed',
  authorize(['ADMIN']),
  controller.seed
);

router.get(
  '/export',
  authorize(['ADMIN', 'ACCOUNTANT']),
  controller.exportCsv
);

router.get(
  '/', 
  validateQuery(listTransactionsQuerySchema), 
  controller.list
);

router.get(
  '/:id', 
  validateParams(getTransactionParamsSchema), 
  controller.getById
);

router.patch(
  '/:id', 
  authorize(['ADMIN', 'ACCOUNTANT']), 
  validateParams(getTransactionParamsSchema), 
  validateRequest(updateTransactionSchema), 
  controller.update
);

router.delete(
  '/:id', 
  authorize(['ADMIN']), 
  validateParams(getTransactionParamsSchema), 
  controller.delete
);

export default router;
