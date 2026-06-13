import { TransactionRepository } from './transaction.repository';
import { AppError } from '../../utils/errors';
import { TransactionType } from '@prisma/client';

export class TransactionService {
  private repository = new TransactionRepository();

  async createTransaction(
    orgId: string,
    data: {
      type: TransactionType;
      amount: number;
      category: string;
      description?: string;
      transactionDate?: string;
      createdAt?: string;
    }
  ) {
    return this.repository.create({
      ...data,
      orgId,
      transactionDate: data.transactionDate ? new Date(data.transactionDate) : null,
    });
  }



  async updateTransaction(
    id: string,
    orgId: string,
    data: Partial<{
      type: TransactionType;
      amount: number;
      category: string;
      description: string;
      transactionDate: string;
      createdAt: string;
    }>
  ) {
    const updateData: any = { ...data };
    if (data.transactionDate !== undefined) {
      updateData.transactionDate = data.transactionDate ? new Date(data.transactionDate) : null;
    }
    const transaction = await this.repository.update(id, orgId, updateData);

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    return transaction;
  }

  async deleteTransaction(id: string, orgId: string) {
    const transaction = await this.repository.delete(id, orgId);

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    return transaction;
  }

  async getTransactionById(id: string, orgId: string) {
    const transaction = await this.repository.findById(id, orgId);

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    return transaction;
  }

  async listTransactions(params: {
    orgId: string;
    cursor?: string;
    limit?: number;
    type?: TransactionType;
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'createdAt' | 'amount';
    sortOrder?: 'asc' | 'desc';
  }) {
    const limit = Number(params.limit) || 10;
    const sortBy = params.sortBy === 'amount' ? 'amount' : 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

    const parsedStart = params.startDate ? new Date(params.startDate) : undefined;
    const parsedEnd = params.endDate ? new Date(params.endDate) : undefined;
    
    if (parsedEnd) {
      parsedEnd.setUTCHours(23, 59, 59, 999);
    }

    const result = await this.repository.findMany({
      orgId: params.orgId,
      cursor: params.cursor,
      take: limit,
      type: params.type,
      category: params.category,
      search: params.search,
      startDate: parsedStart,
      endDate: parsedEnd,
      sortBy,
      sortOrder,
    });

    return {
      data: result.items,
      meta: {
        total: result.total,
        limit,
        nextCursor: result.nextCursor,
        hasMore: result.nextCursor !== null,
      },
    };
  }

  async exportTransactionsCsvStream(
    orgId: string,
    userId: string,
    filters: { search?: string; type?: string; category?: string; startDate?: string; endDate?: string },
    writableStream: NodeJS.WritableStream
  ) {
    const writable = writableStream as NodeJS.WritableStream & { destroyed?: boolean; writableEnded?: boolean };
    let aborted = false;
    writable.on('close', () => {
      aborted = true;
    });

    const writeRow = async (row: string) => {
      if (aborted) return;
      if (!writable.write(row)) {
        await new Promise<void>((resolve) => writable.once('drain', () => resolve()));
      }
    };

    const { prisma } = require('../../db/prisma');

    // 1. Fetch user and organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (!user) {
      if (!writable.writableEnded && !writable.destroyed) writable.end();
      return;
    }

    // 2. Build where clause based on filters
    const where: any = { orgId };
    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.search) {
      const trimmedSearch = filters.search.trim();
      if (trimmedSearch) {
        where.description = { contains: trimmedSearch, mode: 'insensitive' };
      }
    }
    if (filters.startDate || filters.endDate) {
      where.OR = [
        {
          transactionDate: {
            ...(filters.startDate && { gte: new Date(filters.startDate) }),
            ...(filters.endDate && { lte: new Date(filters.endDate) }),
          }
        },
        {
          transactionDate: null,
          createdAt: {
            ...(filters.startDate && { gte: new Date(filters.startDate) }),
            ...(filters.endDate && { lte: new Date(filters.endDate) }),
          }
        }
      ];
    }

    // 3. Calculate Financials
    const sums = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true }
    });

    let totalIncome = 0;
    let totalExpense = 0;
    for (const group of sums) {
      if (group.type === 'INCOME') totalIncome = group._sum.amount || 0;
      if (group.type === 'EXPENSE') totalExpense = group._sum.amount || 0;
    }

    const netBalance = totalIncome - totalExpense;

    // Format headers
    const orgNameStr = `"${user.organization.name.replace(/"/g, '""')}"`;
    const userNameStr = `"${(user.name || user.email).replace(/"/g, '""')}"`;
    const exportDate = new Date().toISOString();

    let dateRangeStr = "All Time";
    if (filters.startDate && filters.endDate) {
      dateRangeStr = `${filters.startDate} to ${filters.endDate}`;
    } else if (filters.startDate) {
      dateRangeStr = `Since ${filters.startDate}`;
    } else if (filters.endDate) {
      dateRangeStr = `Until ${filters.endDate}`;
    }

    // Write Report Header
    await writeRow(`Organization Name,${orgNameStr}\n`);
    await writeRow(`Generated By,${userNameStr}\n`);
    await writeRow(`Export Date,${exportDate}\n`);
    await writeRow(`Date Range,${dateRangeStr}\n`);
    await writeRow(`Total Income,${totalIncome}\n`);
    await writeRow(`Total Expense,${totalExpense}\n`);
    await writeRow(`Net Balance,${netBalance}\n`);
    await writeRow(`\n`);
    
    // Write Columns
    await writeRow('Date,Description,Category,Type,Amount\n');

    let cursor: string | undefined = undefined;
    const batchSize = 1000;

    while (!aborted) {
      const batch: any[] = await prisma.transaction.findMany({
        where,
        take: batchSize,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
        orderBy: { createdAt: 'desc' }
      });

      if (batch.length === 0) break;

      for (const t of batch) {
        if (aborted) break;
        const date = (t.transactionDate ?? t.createdAt).toISOString();
        const desc = t.description ? `"${t.description.replace(/"/g, '""')}"` : '""';
        const category = `"${t.category.replace(/"/g, '""')}"`;
        const amount = t.amount;
        await writeRow(`${date},${desc},${category},${t.type},${amount}\n`);
      }

      if (aborted) break;
      cursor = batch[batch.length - 1].id;
    }

    if (!writable.writableEnded && !writable.destroyed) {
      writable.end();
    }
  }
}