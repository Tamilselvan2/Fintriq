import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  private service = new DashboardService();

  getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      
      const dashboardData = await this.service.getDashboardData(orgId, startDate, endDate);
      
      res.status(200).json({ 
        success: true, 
        data: dashboardData 
      });
    } catch (error) {
      next(error);
    }
  };
}
