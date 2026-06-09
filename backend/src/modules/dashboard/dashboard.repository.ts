import { prisma } from '../../db/prisma';
import { Prisma } from '@prisma/client';

export class DashboardRepository {
  async getAggregates(orgId: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.TransactionWhereInput = {
      orgId,
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

    return prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });
  }

  async getCategorySummaries(orgId: string, type: 'INCOME' | 'EXPENSE', startDate?: Date, endDate?: Date) {
    const where: Prisma.TransactionWhereInput = {
      orgId,
      type,
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

    return prisma.transaction.groupBy({
      by: ['category'],
      where,
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      }
    });
  }

  async getMonthlyAnalytics(orgId: string, startDate?: Date, endDate?: Date) {
    // We use Prisma $queryRaw for DATE_TRUNC as native grouping by month isn't fully supported via Prisma Client API yet.
    // It's strictly typed and parameter interpolation ensures security against SQL injection.
    
    let rawQuery = Prisma.sql`
      SELECT 
        DATE_TRUNC('month', COALESCE("transactionDate", "createdAt")) as "month",
        "type"::text as "type",
        SUM("amount") as "total"
      FROM "Transaction"
      WHERE "orgId" = ${orgId}
    `;

    if (startDate && endDate) {
      rawQuery = Prisma.sql`${rawQuery} AND COALESCE("transactionDate", "createdAt") >= ${startDate} AND COALESCE("transactionDate", "createdAt") <= ${endDate}`;
    } else if (startDate) {
      rawQuery = Prisma.sql`${rawQuery} AND COALESCE("transactionDate", "createdAt") >= ${startDate}`;
    } else if (endDate) {
      rawQuery = Prisma.sql`${rawQuery} AND COALESCE("transactionDate", "createdAt") <= ${endDate}`;
    }

    rawQuery = Prisma.sql`${rawQuery} GROUP BY DATE_TRUNC('month', COALESCE("transactionDate", "createdAt")), "type" ORDER BY "month" ASC`;

    const result = await prisma.$queryRaw<{month: Date, type: string, total: number}[]>(rawQuery);
    return result;
  }

  async getRecentTransactions(orgId: string, limit: number = 5) {
    return prisma.transaction.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
