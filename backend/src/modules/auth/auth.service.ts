import bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { AppError } from '../../utils/errors';
import { generateAccessToken, generateRefreshToken, hashToken, JwtPayload, verifyRefreshToken } from '../../utils/jwt';

export class AuthService {
  private repository = new AuthRepository();

  async register(orgName: string, email: string, password: string) {
    const existingUser = await this.repository.findUserByEmail(email);
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { user, org } = await this.repository.createUserWithOrg(orgName, email, passwordHash);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, org };
  }

  async login(email: string, password: string) {
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
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

      await this.repository.revokeRefreshToken(dbToken.id);

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

      await this.repository.saveRefreshToken(dbToken.user.id, newHashedToken, expiresAt);

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
}
