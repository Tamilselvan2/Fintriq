import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { createCategorySchema } from './category.validation';

const router = Router();
const controller = new CategoryController();

router.use(authenticate);

router.get('/', controller.list);
router.post('/', validateRequest(createCategorySchema), controller.create);
router.delete('/:id', controller.delete);

export default router;
