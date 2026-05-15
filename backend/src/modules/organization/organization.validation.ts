import { z } from 'zod';
import { Role } from '@prisma/client';

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(Role),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const memberIdParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});
