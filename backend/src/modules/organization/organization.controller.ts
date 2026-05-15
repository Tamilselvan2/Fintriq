import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from './organization.service';

export class OrganizationController {
  private service = new OrganizationService();

  listMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const members = await this.service.getMembers(req.user!.orgId);
      res.json({ success: true, data: members });
    } catch (error) { 
      next(error); 
    }
  };

  inviteMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, role, password } = req.body;
      const member = await this.service.inviteMember(req.user!.orgId, email, role, password);
      res.status(201).json({ success: true, data: member, message: 'Member invited successfully' });
    } catch (error) { 
      next(error); 
    }
  };

  updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const member = await this.service.updateMemberRole(req.params.id, req.user!.orgId, req.body.role);
      res.json({ success: true, data: member, message: 'Role updated successfully' });
    } catch (error) { 
      next(error); 
    }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.removeMember(req.params.id, req.user!.orgId, req.user!.userId);
      res.json({ success: true, message: 'Member removed successfully' });
    } catch (error) { 
      next(error); 
    }
  };
}
