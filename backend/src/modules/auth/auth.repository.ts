import { prisma } from '../../db/prisma';
import { Prisma, Role } from '@prisma/client';

export class AuthRepository {
  async createUserWithOrg(orgName: string, email: string, passwordHash: string) {
    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: orgName },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: Role.ADMIN, // First user is ADMIN
          orgId: org.id,
        },
      });

      return { user, org };
    });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async saveRefreshToken(userId: string, hashedToken: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        userId,
        hashedToken,
        expiresAt,
      },
    });
  }

  async findRefreshToken(hashedToken: string) {
    return prisma.refreshToken.findFirst({
      where: {
        hashedToken,
      },
      include: {
        user: true
      }
    });
  }

  async revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  }

  async revokeAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
}
