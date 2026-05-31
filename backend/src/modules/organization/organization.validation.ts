import { z } from 'zod';
import { Role } from '@prisma/client';

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(Role),
});

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const memberIdParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters'),
});
