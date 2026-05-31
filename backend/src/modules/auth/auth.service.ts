import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import cloudinary from '../../config/cloudinary';
import { AuthRepository } from './auth.repository';
import { AppError } from '../../utils/errors';
import { generateAccessToken, generateRefreshToken, hashToken, JwtPayload, verifyRefreshToken } from '../../utils/jwt';
import { sendResetPasswordEmail } from '../../utils/email';
import { AuditService, AuditActions } from '../audit/audit.service';

const auditService = new AuditService();

export class AuthService {
  private repository = new AuthRepository();

  async register(name: string, email: string, password: string) {
    const existingUser = await this.repository.findUserByEmail(email);
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { user, org } = await this.repository.createUserWithOrg(name, email, passwordHash);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, org };
  }

  async login(email: string, password: string) {
    const user = await this.repository.findUserByEmail(email);
    if (!user || !user.passwordHash) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      orgId: user.orgId,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshTokenString = generateRefreshToken(payload);

    const hashedRefreshToken = hashToken(refreshTokenString);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.repository.saveRefreshToken(user.id, hashedRefreshToken, expiresAt);

    const { passwordHash: _, ...safeUser } = user;
    return { accessToken, refreshToken: refreshTokenString, user: safeUser };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const hashedToken = hashToken(refreshToken);

      const dbToken = await this.repository.findRefreshToken(hashedToken);
      if (!dbToken) {
        throw new AppError(401, 'Invalid or expired refresh token');
      }

      if (dbToken.revoked) {
        await this.repository.revokeAllUserRefreshTokens(dbToken.user.id);
        throw new AppError(401, 'Token reuse detected. All sessions revoked');
      }

      if (dbToken.expiresAt < new Date()) {
        throw new AppError(401, 'Refresh token expired');
      }

      const payload: JwtPayload = {
        userId: dbToken.user.id,
        email: dbToken.user.email,
        orgId: dbToken.user.orgId,
        role: dbToken.user.role,
      };

      const newAccessToken = generateAccessToken(payload);
      const newRefreshTokenString = generateRefreshToken(payload);
      const newHashedToken = hashToken(newRefreshTokenString);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.repository.replaceRefreshToken(dbToken.id, dbToken.user.id, newHashedToken, expiresAt);

      return { accessToken: newAccessToken, refreshToken: newRefreshTokenString };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(401, 'Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    const hashedToken = hashToken(refreshToken);
    const dbToken = await this.repository.findRefreshToken(hashedToken);
    if (dbToken) {
      await this.repository.revokeRefreshToken(dbToken.id);
    }
  }

  async getMe(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    const user = await this.repository.findUserById(userId);
    if (!user) throw new AppError(404, 'User not found');

    // If the user already has a profile image, delete it from Cloudinary
    if (user.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      } catch (error) {
        console.error('Failed to delete old profile picture:', error);
      }
    }

    // Upload new image to Cloudinary via stream
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'fintriq/profile-pictures',
          transformation: [{ width: 300, height: 300, crop: 'fill' }],
          format: 'webp',
        },
        async (error, result) => {
          if (error) {
            return reject(new AppError(500, 'Failed to upload image to Cloudinary'));
          }

          if (!result) {
            return reject(new AppError(500, 'No result from Cloudinary'));
          }

          try {
            const updatedUser = await this.repository.updateProfileImage(
              userId,
              result.secure_url,
              result.public_id
            );
            const { passwordHash: _, ...safeUser } = updatedUser;
            resolve(safeUser);
          } catch (dbError) {
            reject(new AppError(500, 'Failed to update user profile in database'));
          }
        }
      );

      // Pass the file buffer to the stream
      uploadStream.end(file.buffer);
    });
  }

  // Restricted to name only per recent auth stabilization changes
  async updateProfile(userId: string, name: string) {
    const updatedUser = await this.repository.updateProfileName(userId, name);
    const { passwordHash: _, ...safeUser } = updatedUser;
    return safeUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) throw new AppError(404, 'User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError(401, 'Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.repository.updatePassword(userId, hashedPassword);
  }

  async forgotPassword(email: string) {
    const user = await this.repository.findUserByEmail(email);
    if (!user) return; // Do not reveal if email exists

    await this.repository.deleteUserPasswordResetTokens(user.id);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await this.repository.savePasswordResetToken(user.id, hashedToken, expiresAt);

    await sendResetPasswordEmail(user.email, rawToken);

    auditService.log({
      orgId: user.orgId,
      userId: user.id,
      userEmail: user.email,
      action: AuditActions.PASSWORD_RESET_REQUESTED,
      entityType: 'USER',
      entityId: user.id,
    });
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const hashedToken = hashToken(rawToken);
    const resetToken = await this.repository.findPasswordResetToken(hashedToken);

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new AppError(400, 'Invalid or expired password reset token');
    }

    const userId = resetToken.userId;
    const user = resetToken.user;

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.repository.updatePassword(userId, hashedPassword);

    await this.repository.revokeAllUserRefreshTokens(userId);
    await this.repository.deletePasswordResetToken(resetToken.id);

    auditService.log({
      orgId: user.orgId,
      userId: user.id,
      userEmail: user.email,
      action: AuditActions.PASSWORD_RESET_COMPLETED,
      entityType: 'USER',
      entityId: user.id,
    });
  }

  async acceptInvitation(rawToken: string, name: string, password: string) {
    const hashedToken = hashToken(rawToken);
    const invitation = await this.repository.findInvitationByHashedToken(hashedToken);

    if (!invitation) {
      throw new AppError(400, 'Invalid or deleted invitation token');
    }

    if (invitation.expiresAt < new Date()) {
      throw new AppError(400, 'Invitation token has expired');
    }

    const { OrganizationRepository } = require('../organization/organization.repository');
    const orgRepo = new OrganizationRepository();
    const existing = await orgRepo.findMemberByEmail(invitation.email);
    if (existing) {
      throw new AppError(409, 'User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user
    const newUser = await orgRepo.addMember(invitation.email, passwordHash, invitation.role as any, invitation.orgId);
    
    // Update name
    await this.repository.updateProfileName(newUser.id, name);

    // Delete token
    await this.repository.deleteInvitation(invitation.id);

    // Audit log
    auditService.log({
      orgId: invitation.orgId,
      userId: newUser.id,
      userEmail: invitation.email,
      action: AuditActions.INVITATION_ACCEPTED,
      entityType: 'USER',
      entityId: newUser.id,
    });
  }
}
