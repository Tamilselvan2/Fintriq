import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  transactionDate: z.string().optional().transform(val => val === '' ? undefined : val),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
