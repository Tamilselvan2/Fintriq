import { Request, Response, NextFunction } from 'express';
import { presetService } from './preset.service';

export const getCategoryPresets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params;
    const orgId = req.user!.orgId;
    
    const items = await presetService.getPresetsByCategory(orgId, categoryId as string);
    
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryPresets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params;
    const orgId = req.user!.orgId;
    const { items } = req.body;
    
    // items should be an array of { id?, name, price, isActive }
    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, message: 'items must be an array' });
      return;
    }
    
    const updatedItems = await presetService.updatePresetsForCategory(orgId, categoryId as string, items);
    
    res.status(200).json({
      success: true,
      data: updatedItems,
    });
  } catch (error) {
    next(error);
  }
};
