import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware';
import { authorize } from '../../middlewares/roleMiddleware';
import { getCategoryPresets, updateCategoryPresets } from './preset.controller';

const router = Router();

router.use(authenticate);

router.get('/categories/:categoryId', getCategoryPresets);

// Only admins can update the preset items for a category
router.patch('/categories/:categoryId', authorize(['ADMIN']), updateCategoryPresets);

export default router;
