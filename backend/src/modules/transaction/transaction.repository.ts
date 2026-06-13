import { prisma } from '../../db/prisma';
import { Prisma, TransactionType } from '@prisma/client';

export class TransactionRepository {
  async create(data: Prisma.TransactionUncheckedCreateInput) {
    return prisma.transaction.create({ data });
  }

  async update(id: string, orgId: string, data: Prisma.TransactionUpdateInput) {
    // Verify ownership
    const tx = await prisma.transaction.findFirst({ where: { id, orgId } });
    if (!tx) return null;

    return prisma.transaction.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, orgId: string) {
    const tx = await prisma.transaction.findFirst({ where: { id, orgId } });
    if (!tx) return null;

    return prisma.transaction.delete({ where: { id } });
  }

  async findById(id: string, orgId: string) {
    return prisma.transaction.findFirst({
      where: { id, orgId },
    });
  }

  async findMany(params: {
    orgId: string;
    cursor?: string;
    take: number;
    type?: TransactionType;
    category?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    sortBy: 'createdAt' | 'amount';
    sortOrder: 'asc' | 'desc';
  }) {
    const { orgId, cursor, take, type, category, search, startDate, endDate, sortBy, sortOrder } = params;

    const trimmedSearch = search?.trim();

    const where: Prisma.TransactionWhereInput = {
      orgId,
      ...(type && { type }),
      ...(category && { category }),
      ...(trimmedSearch && { description: { contains: trimmedSearch, mode: 'insensitive' } }),
      ...(startDate || endDate ? {
        OR: [
          {
            transactionDate: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            }
          },
          {
            transactionDate: null,
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            }
          }
        ]
      } : {})
    };

    const items = await prisma.transaction.findMany({
      where,
      take: take + 1, // fetch one extra to determine if there is a next page
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { [sortBy]: sortOrder },
    });

    let nextCursor: string | null = null;
    if (items.length > take) {
      const nextItem = items.pop(); // remove the extra item
      nextCursor = nextItem!.id;
    }

    const total = await prisma.transaction.count({ where });

    return { items, total, nextCursor };
  }
}
