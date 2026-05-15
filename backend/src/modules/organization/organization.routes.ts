import { Router } from 'express';
import { OrganizationController } from './organization.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { authorize } from '../../middlewares/roleMiddleware';
import { validateRequest, validateParams } from '../../middlewares/validateRequest';
import { inviteMemberSchema, updateRoleSchema, memberIdParamsSchema } from './organization.validation';

const router = Router();
const controller = new OrganizationController();

// All organization routes require authentication
router.use(authenticate);

// View members is accessible to anyone in the organization
router.get(
  '/members', 
  controller.listMembers
);

// Manage members requires ADMIN role
router.post(
  '/members', 
  authorize(['ADMIN']), 
  validateRequest(inviteMemberSchema), 
  controller.inviteMember
);

router.patch(
  '/members/:id/role', 
  authorize(['ADMIN']), 
  validateParams(memberIdParamsSchema), 
  validateRequest(updateRoleSchema), 
  controller.updateRole
);

router.delete(
  '/members/:id', 
  authorize(['ADMIN']), 
  validateParams(memberIdParamsSchema), 
  controller.removeMember
);

export default router;
