import { prisma } from '../../db/prisma';
import { Prisma, Role } from '@prisma/client';

export class AuthRepository {
  async createUserWithOrg(name: string, email: string, passwordHash: string) {
    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name },
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
      include: { organization: true }
    });
  }



  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash }
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
    return prisma.refreshToken.findUnique({
      where: { hashedToken },
      include: { user: true },
    });
  }

  async replaceRefreshToken(oldTokenId: string, userId: string, newHashedToken: string, expiresAt: Date) {
    return prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: oldTokenId },
        data: { revoked: true },
      }),
      prisma.refreshToken.create({
        data: {
          userId,
          hashedToken: newHashedToken,
          expiresAt,
        },
      }),
    ]);
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

  async savePasswordResetToken(userId: string, hashedToken: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: {
        userId,
        hashedToken,
        expiresAt,
      },
    });
  }

  async findPasswordResetToken(hashedToken: string) {
    return prisma.passwordResetToken.findUnique({
      where: { hashedToken },
      include: { user: true },
    });
  }

  async deletePasswordResetToken(id: string) {
    return prisma.passwordResetToken.delete({
      where: { id },
    });
  }

  async deleteUserPasswordResetTokens(userId: string) {
    return prisma.passwordResetToken.deleteMany({
      where: { userId },
    });
  }
}
