import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { TransactionService } from './transaction.service';
import { AuditService, AuditActions } from '../audit/audit.service';

const auditService = new AuditService();

export class TransactionController {
  private service = new TransactionService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as { userId: string; orgId: string; role: Role; email: string };
      const orgId = user.orgId;
      const transaction = await this.service.createTransaction(orgId, req.body);

      // Fire-and-forget audit log
      auditService.log({
        orgId,
        userId: user.userId,
        userEmail: user.email,
        action: AuditActions.CREATE_TRANSACTION,
        entityType: 'TRANSACTION',
        entityId: transaction.id,
        details: {
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          transactionDate: transaction.transactionDate,
        },
      });

      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as { userId: string; orgId: string; role: Role; email: string };
      const orgId = user.orgId;
      const { id } = req.params;
      const transaction = await this.service.updateTransaction(id as string, orgId, req.body);

      auditService.log({
        orgId,
        userId: user.userId,
        userEmail: user.email,
        action: AuditActions.UPDATE_TRANSACTION,
        entityType: 'TRANSACTION',
        entityId: id as string,
        details: req.body,
      });

      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as { userId: string; orgId: string; role: Role; email: string };
      const orgId = user.orgId;
      const { id } = req.params;
      await this.service.deleteTransaction(id as string, orgId);

      auditService.log({
        orgId,
        userId: user.userId,
        userEmail: user.email,
        action: AuditActions.DELETE_TRANSACTION,
        entityType: 'TRANSACTION',
        entityId: id as string,
        details: {},
      });

      res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const { id } = req.params;
      const transaction = await this.service.getTransactionById(id as string, orgId);
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const result = await this.service.listTransactions({
        orgId,
        ...req.query as any
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };



  exportCsv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as { userId: string; orgId: string; role: Role; email: string };
      const orgId = user.orgId;
      
      const { search, type, category, startDate, endDate } = req.query as any;

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `fintriq-transactions-${dateStr}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.flushHeaders();

      await this.service.exportTransactionsCsvStream(
        orgId,
        user.userId,
        { search, type, category, startDate, endDate },
        res
      );
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Unable to export transactions' });
      } else {
        res.end();
      }
      next(error);
    }
  };
}
