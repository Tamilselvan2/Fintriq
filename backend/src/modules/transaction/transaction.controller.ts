import { Request, Response, NextFunction } from 'express';
import { TransactionService } from './transaction.service';
import { AuditService, AuditActions } from '../audit/audit.service';

const auditService = new AuditService();

export class TransactionController {
  private service = new TransactionService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const transaction = await this.service.createTransaction(orgId, req.body);

      // Fire-and-forget audit log
      auditService.log({
        orgId,
        userId: req.user!.userId,
        userEmail: req.user!.email,
        action: AuditActions.CREATE_TRANSACTION,
        entityType: 'TRANSACTION',
        entityId: transaction.id,
        details: {
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
        },
        ipAddress: req.ip,
      });

      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const { id } = req.params;
      const transaction = await this.service.updateTransaction(id as string, orgId, req.body);

      auditService.log({
        orgId,
        userId: req.user!.userId,
        userEmail: req.user!.email,
        action: AuditActions.UPDATE_TRANSACTION,
        entityType: 'TRANSACTION',
        entityId: id as string,
        details: req.body,
        ipAddress: req.ip,
      });

      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const { id } = req.params;
      await this.service.deleteTransaction(id as string, orgId);

      auditService.log({
        orgId,
        userId: req.user!.userId,
        userEmail: req.user!.email,
        action: AuditActions.DELETE_TRANSACTION,
        entityType: 'TRANSACTION',
        entityId: id as string,
        details: {},
        ipAddress: req.ip,
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

  seed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const result = await this.service.seedTransactions(orgId);
      res.status(200).json({ success: true, message: 'Seeded successfully', data: result });
    } catch (error) {
      next(error);
    }
  };

  exportCsv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
      await this.service.exportTransactionsCsvStream(orgId, res);
    } catch (error) {
      next(error);
    }
  };
}
