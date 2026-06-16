import { TransactionService } from '../../../src/modules/transaction/transaction.service';
import { prismaMock } from '../../__mocks__/prisma';
import { TransactionType } from '@prisma/client';
import { AppError } from '../../../src/utils/errors';

describe('TransactionService', () => {
  let transactionService: TransactionService;

  beforeEach(() => {
    transactionService = new TransactionService();
  });

  describe('listTransactions', () => {
    it('should enforce orgId isolation (Multi-Tenant Security)', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([]);
      prismaMock.transaction.count.mockResolvedValue(0);

      await transactionService.listTransactions({ orgId: 'org1' });

      // Ensure the repository passes orgId to prisma
      expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ orgId: 'org1' })
        })
      );
    });

    it('should construct correct date boundaries and fallback logic for OR queries', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([]);
      prismaMock.transaction.count.mockResolvedValue(0);

      await transactionService.listTransactions({ orgId: 'org1', startDate: '2026-06-01', endDate: '2026-06-10' });

      // Verify the OR clause containing transactionDate fallback to createdAt exists
      const callArgs = prismaMock.transaction.findMany.mock.calls[0][0];
      const whereClause = callArgs?.where as any;

      expect(whereClause.OR).toBeDefined();
      expect(whereClause.OR.length).toBe(2);
      expect(whereClause.OR[0].transactionDate).toBeDefined();
      expect(whereClause.OR[1].createdAt).toBeDefined();
    });
  });
});
