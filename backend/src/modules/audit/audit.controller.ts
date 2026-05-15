import { Request, Response, NextFunction } from 'express';
import { AuditService } from './audit.service';

const auditService = new AuditService();

export class AuditController {
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const { cursor, limit, action, entityType } = req.query as Record<string, string>;

      const result = await auditService.getLogs({
        orgId,
        cursor,
        limit: Number(limit) || 20,
        action,
        entityType,
      });

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}
