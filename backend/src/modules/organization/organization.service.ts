import { OrganizationRepository } from './organization.repository';
import { AppError } from '../../utils/errors';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';

export class OrganizationService {
  private repository = new OrganizationRepository();

  async getOrganization(orgId: string) {
    const org = await this.repository.findOrganizationById(orgId);
    if (!org) throw new AppError(404, 'Organization not found');
    return org;
  }

  async updateOrganization(orgId: string, name: string) {
    const org = await this.repository.updateOrganization(orgId, name);
    if (!org) throw new AppError(404, 'Organization not found');
    return org;
  }

  async getMembers(orgId: string, query: { limit?: number, cursor?: string } = {}) {
    const limit = Number(query.limit) || 20;
    const result = await this.repository.getMembers(orgId, limit, query.cursor);
    
    return {
      data: result.items,
      meta: {
        total: result.total,
        limit,
        nextCursor: result.nextCursor,
        hasMore: result.nextCursor !== null
      }
    };
  }

  async inviteMember(orgId: string, email: string, role: Role, invitedById: string) {
    const existingUser = await this.repository.findMemberByEmail(email);
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    const org = await this.repository.findOrganizationById(orgId);
    if (!org) {
      throw new AppError(404, 'Organization not found');
    }

    // Delete any existing invitations for this email + org combination
    await this.repository.deleteInvitationByEmailAndOrg(email, orgId);

    console.log("[TRACE] Before token generation");
    // Generate token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    console.log("[TRACE] After token generation");

    console.log("[TRACE] Before DB insert");
    await this.repository.createInvitation(
      email,
      role,
      orgId,
      invitedById,
      hashedToken,
      expiresAt
    );
    console.log("[TRACE] After DB insert");

    // Audit log
    const { AuditService, AuditActions } = require('../audit/audit.service');
    const auditService = new AuditService();
    const inviter = await this.repository.findMemberById(invitedById, orgId);
    if (inviter) {
      await auditService.log({
        orgId,
        userId: inviter.id,
        userEmail: inviter.email,
        action: AuditActions.MEMBER_INVITED,
        entityType: 'INVITATION',
        details: { invitedEmail: email, role },
      });
    }

    console.log("[TRACE] Before sendMail()");
    // Send email
    const { sendInvitationEmail } = require('../../utils/email');
    await sendInvitationEmail(email, org.name, role, token);
    console.log("[TRACE] After sendMail()");

    console.log("[TRACE] Before response return");
    return { email, role, status: 'invited' };
  }

  async listPendingInvitations(orgId: string) {
    return this.repository.getPendingInvitations(orgId);
  }

  async cancelInvitation(invitationId: string, orgId: string) {
    const invitation = await this.repository.findInvitationById(invitationId, orgId);
    if (!invitation) throw new AppError(404, 'Invitation not found');
    await this.repository.deleteInvitationById(invitationId, orgId);
    return { success: true };
  }

  async resendInvitation(invitationId: string, orgId: string, inviterId: string) {
    const invitation = await this.repository.findInvitationById(invitationId, orgId);
    if (!invitation) throw new AppError(404, 'Invitation not found');

    const org = await this.repository.findOrganizationById(orgId);
    if (!org) throw new AppError(404, 'Organization not found');

    // Create new token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Delete old invitation
    await this.repository.deleteInvitationById(invitationId, orgId);

    // Create new invitation
    await this.repository.createInvitation(
      invitation.email,
      invitation.role as Role,
      orgId,
      inviterId,
      hashedToken,
      expiresAt
    );

    // Send email
    const { sendInvitationEmail } = require('../../utils/email');
    await sendInvitationEmail(invitation.email, org.name, invitation.role, token);

    return { success: true };
  }

  async updateMemberRole(targetUserId: string, orgId: string, newRole: Role) {
    const member = await this.repository.findMemberById(targetUserId, orgId);
    if (!member) throw new AppError(404, 'Member not found in your organization');

    // Prevent downgrading the last admin
    if (member.role === 'ADMIN' && newRole !== 'ADMIN') {
      const adminCount = await this.repository.countAdmins(orgId);
      if (adminCount <= 1) {
        throw new AppError(400, 'Cannot downgrade the last admin of the organization');
      }
    }

    return this.repository.updateMemberRole(targetUserId, newRole);
  }

  async removeMember(targetUserId: string, orgId: string, currentUserId: string) {
    if (targetUserId === currentUserId) {
      throw new AppError(400, 'You cannot remove yourself');
    }

    const member = await this.repository.findMemberById(targetUserId, orgId);
    if (!member) throw new AppError(404, 'Member not found in your organization');

    // Prevent removing the last admin
    if (member.role === 'ADMIN') {
      const adminCount = await this.repository.countAdmins(orgId);
      if (adminCount <= 1) {
        throw new AppError(400, 'Cannot remove the last admin of the organization');
      }
    }

    await this.repository.removeMember(targetUserId);
    return { success: true };
  }
}
