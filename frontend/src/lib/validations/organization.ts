import { z } from 'zod';
import { Role } from '@/types/models';

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum([Role.ADMIN, Role.ACCOUNTANT, Role.USER]),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
