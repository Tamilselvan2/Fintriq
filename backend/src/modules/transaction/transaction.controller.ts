import { Request, Response, NextFunction } from 'express';
import { TransactionService } from './transaction.service';

export class TransactionController {
  private service = new TransactionService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const transaction = await this.service.createTransaction(orgId, req.body);
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const { id } = req.params;
      const transaction = await this.service.updateTransaction(id, orgId, req.body);
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const { id } = req.params;
      await this.service.deleteTransaction(id, orgId);
      res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const { id } = req.params;
      const transaction = await this.service.getTransactionById(id, orgId);
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
