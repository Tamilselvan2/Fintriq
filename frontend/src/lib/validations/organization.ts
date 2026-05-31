import { z } from 'zod';
import { Role } from '@/types/models';

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum([Role.ADMIN, Role.ACCOUNTANT, Role.USER]),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
