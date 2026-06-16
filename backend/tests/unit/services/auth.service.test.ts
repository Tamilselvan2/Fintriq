import { AuthService } from '../../../src/modules/auth/auth.service';
import { prismaMock } from '../../__mocks__/prisma';
import bcrypt from 'bcryptjs';
import { AppError } from '../../../src/utils/errors';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('login', () => {
    it('should throw AppError if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(authService.login('test@example.com', 'password')).rejects.toThrow(AppError);
    });

    it('should throw AppError if password does not match', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1', email: 'test@example.com', passwordHash: 'hashed', orgId: 'org1', role: Role.USER, createdAt: new Date(), updatedAt: new Date(), name: null, profileImageUrl: null, profileImagePublicId: null
      });
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow(AppError);
    });

    it('should return tokens and user safely on success', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1', email: 'test@example.com', passwordHash: 'hashed', orgId: 'org1', role: Role.USER, createdAt: new Date(), updatedAt: new Date(), name: null, profileImageUrl: null, profileImagePublicId: null
      });
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      prismaMock.refreshToken.create.mockResolvedValue({} as any);

      const result = await authService.login('test@example.com', 'password');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toBeDefined();
      expect((result.user as any).passwordHash).toBeUndefined(); // ensure password hash is stripped
    });
  });
  
  describe('register', () => {
    it('should throw AppError if email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({} as any);
      await expect(authService.register('John', 'test@example.com', 'password')).rejects.toThrow(AppError);
    });

    it('should create organization and user if valid', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      
      const mockOrg = { id: 'org1', name: 'John', createdAt: new Date(), updatedAt: new Date() };
      const mockUser = { id: '1', email: 'test@example.com', passwordHash: 'hashed', orgId: 'org1', role: Role.ADMIN, createdAt: new Date(), updatedAt: new Date(), name: 'John', profileImageUrl: null, profileImagePublicId: null };
      
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return { user: mockUser, org: mockOrg };
      });

      const result = await authService.register('John', 'test@example.com', 'password');
      expect(result.user).toBeDefined();
      expect(result.org.id).toBe('org1');
    });
  });
});
