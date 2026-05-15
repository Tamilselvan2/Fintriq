import { prisma } from '../../db/prisma';
import { Role } from '@prisma/client';

export class OrganizationRepository {
  async getMembers(orgId: string) {
    return prisma.user.findMany({
      where: { orgId },
      select: {
        id: true,
        email: true,
        role: true,
        orgId: true,
      },
      orderBy: { role: 'asc' }
    });
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
