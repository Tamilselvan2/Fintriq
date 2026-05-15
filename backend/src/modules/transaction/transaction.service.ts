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
    }
  ) {
    return this.repository.create({
      ...data,
      orgId,
    });
  }

  async seedTransactions(orgId: string) {
    const types = ['INCOME', 'EXPENSE'];
    const categories = ['Software', 'Payroll', 'Consulting', 'Marketing', 'Office Supplies', 'Travel'];
    
    const transactions = [];
    for (let i = 0; i < 25; i++) {
      const type = types[Math.floor(Math.random() * types.length)] as 'INCOME' | 'EXPENSE';
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Random date within last 6 months
      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
      
      transactions.push({
        orgId,
        type,
        amount: Math.floor(Math.random() * 5000) + 100,
        category,
        description: 'Auto-generated test transaction',
        createdAt: date
      });
    }

    // Use prisma client directly for bulk insert
    const { prisma } = require('../../db/prisma');
    await prisma.transaction.createMany({
      data: transactions
    });

    return { count: 25 };
  }

  async updateTransaction(
    id: string,
    orgId: string,
    data: Partial<{
      type: TransactionType;
      amount: number;
      category: string;
      description: string;
    }>
  ) {
    const transaction = await this.repository.update(id, orgId, data);

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
    page?: number;
    limit?: number;
    type?: TransactionType;
    category?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'createdAt' | 'amount';
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Number(params.page) || 1;

    const limit = Number(params.limit) || 10;

    const skip = (page - 1) * limit;

    const sortBy =
      params.sortBy === 'amount'
        ? 'amount'
        : 'createdAt';

    const sortOrder =
      params.sortOrder === 'asc'
        ? 'asc'
        : 'desc';

    const result = await this.repository.findMany({
      orgId: params.orgId,
      skip,
      take: limit,
      type: params.type,
      category: params.category,
      startDate: params.startDate
        ? new Date(params.startDate)
        : undefined,
      endDate: params.endDate
        ? new Date(params.endDate)
        : undefined,
      sortBy,
      sortOrder,
    });

    return {
      data: result.items,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async exportTransactionsCsvStream(orgId: string, writableStream: NodeJS.WritableStream) {
    writableStream.write('ID,Date,Type,Category,Amount,Description\n');
    let cursor: string | undefined = undefined;
    const batchSize = 1000;
    
    const { prisma } = require('../../db/prisma');

    while (true) {
      const batch: any[] = await prisma.transaction.findMany({
        where: { orgId },
        take: batchSize,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
        orderBy: { createdAt: 'desc' }
      });

      if (batch.length === 0) break;

      for (const t of batch) {
        const id = t.id;
        const date = t.createdAt.toISOString();
        const type = t.type;
        const category = `"${t.category.replace(/"/g, '""')}"`;
        const amount = t.amount;
        const desc = t.description ? `"${t.description.replace(/"/g, '""')}"` : '""';
        
        writableStream.write(`${id},${date},${type},${category},${amount},${desc}\n`);
      }

      cursor = batch[batch.length - 1].id;
    }
    
    writableStream.end();
  }
}