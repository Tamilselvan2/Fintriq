import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';

export class CategoryController {
  private service = new CategoryService();

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const categories = await this.service.listCategories(orgId);
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const { name } = req.body;
      const category = await this.service.createCategory(orgId, name);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.orgId;
      const { id } = req.params;
      await this.service.deleteCategory(id as string, orgId);
      res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
