import { z } from 'zod';
import { TransactionType } from '@prisma/client';

export const createTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  transactionDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  createdAt: z.string().datetime().optional(),
});

export const updateTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  description: z.string().optional(),
  transactionDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  createdAt: z.string().datetime().optional(),
});

export const getTransactionParamsSchema = z.object({
  id: z.string().uuid('Invalid transaction ID'),
});

export const listTransactionsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional().transform(val => val ? Number(val) : 1),
  limit: z.string().regex(/^\d+$/).optional().transform(val => val ? Number(val) : 10),
  type: z.nativeEnum(TransactionType).optional(),
  category: z.string().optional(),
  sortBy: z.enum(['createdAt', 'amount']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
});
