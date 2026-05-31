import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from './organization.service';

export class OrganizationController {
  private service = new OrganizationService();

  getOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = await this.service.getOrganization(req.user!.orgId);
      res.json({ success: true, data: org });
    } catch (error) {
      next(error);
    }
  };

  updateOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const org = await this.service.updateOrganization(req.user!.orgId, name);
      res.json({ success: true, data: org, message: 'Organization updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  listMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getMembers(req.user!.orgId, req.query as any);
      res.json({ success: true, ...result });
    } catch (error) { 
      next(error); 
    }
  };

  inviteMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, role } = req.body;
      const member = await this.service.inviteMember(req.user!.orgId, email, role, req.user!.userId);
      res.status(201).json({ success: true, data: member, message: 'Member invited successfully' });
    } catch (error) { 
      next(error); 
    }
  };

  listPendingInvitations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invitations = await this.service.listPendingInvitations(req.user!.orgId);
      res.json({ success: true, data: invitations });
    } catch (error) {
      next(error);
    }
  };

  resendInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.resendInvitation(req.params.id as string, req.user!.orgId, req.user!.userId);
      res.json({ success: true, message: 'Invitation resent successfully' });
    } catch (error) {
      next(error);
    }
  };

  cancelInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.cancelInvitation(req.params.id as string, req.user!.orgId);
      res.json({ success: true, message: 'Invitation canceled successfully' });
    } catch (error) {
      next(error);
    }
  };

  updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const member = await this.service.updateMemberRole(req.params.id as string, req.user!.orgId, req.body.role);
      res.json({ success: true, data: member, message: 'Role updated successfully' });
    } catch (error) { 
      next(error); 
    }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.removeMember(req.params.id as string, req.user!.orgId, req.user!.userId);
      res.json({ success: true, message: 'Member removed successfully' });
    } catch (error) { 
      next(error); 
    }
  };
}
