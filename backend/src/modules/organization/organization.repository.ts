import { prisma } from '../../db/prisma';
import { Role } from '@prisma/client';

export class OrganizationRepository {
  async findOrganizationById(id: string) {
    return prisma.organization.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } }
    });
  }

  async updateOrganization(id: string, name: string) {
    return prisma.organization.update({
      where: { id },
      data: { name },
      include: { _count: { select: { users: true } } }
    });
  }

  async getMembers(orgId: string, limit: number = 20, cursor?: string) {
    const take = limit + 1;
    const items = await prisma.user.findMany({
      where: { orgId },
      select: {
        id: true,
        email: true,
        role: true,
        orgId: true,
      },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' } // must order by unique field for cursor pagination
    });

    let nextCursor: string | null = null;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem!.id;
    }

    const total = await prisma.user.count({ where: { orgId } });

    return { items, nextCursor, total };
  }

  async findMemberById(id: string, orgId: string) {
    return prisma.user.findFirst({
      where: { id, orgId }
    });
  }

  async findMemberByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async addMember(email: string, passwordHash: string, role: Role, orgId: string) {
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        orgId
      },
      select: { id: true, email: true, role: true }
    });
  }

  async deleteInvitationByEmailAndOrg(email: string, orgId: string) {
    return prisma.invitationToken.deleteMany({
      where: { email, orgId },
    });
  }

  async createInvitation(email: string, role: Role, orgId: string, invitedById: string, hashedToken: string, expiresAt: Date) {
    return prisma.invitationToken.create({
      data: {
        email,
        role,
        orgId,
        invitedById,
        hashedToken,
        expiresAt,
      },
    });
  }

  async getPendingInvitations(orgId: string) {
    return prisma.invitationToken.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        createdAt: true,
      }
    });
  }

  async findInvitationById(id: string, orgId: string) {
    return prisma.invitationToken.findFirst({
      where: { id, orgId }
    });
  }

  async deleteInvitationById(id: string, orgId: string) {
    return prisma.invitationToken.delete({
      where: { id }
    });
  }

  async updateMemberRole(id: string, role: Role) {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true }
    });
  }

  async countAdmins(orgId: string) {
    return prisma.user.count({
      where: { orgId, role: 'ADMIN' }
    });
  }
  
  async removeMember(id: string) {
    return prisma.$transaction([
      prisma.refreshToken.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } })
    ]);
  }
}
