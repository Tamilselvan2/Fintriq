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
    skip: number;
    take: number;
    type?: TransactionType;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    sortBy: 'createdAt' | 'amount';
    sortOrder: 'asc' | 'desc';
  }) {
    const { orgId, skip, take, type, category, startDate, endDate, sortBy, sortOrder } = params;

    const where: Prisma.TransactionWhereInput = {
      orgId,
      ...(type && { type }),
      ...(category && { category }),
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        }
      } : {})
    };

    const [items, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.transaction.count({ where })
    ]);

    return { items, total };
  }
}
