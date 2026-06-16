import request from 'supertest';
import app from '../../src/app';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user and create an organization', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Integration Test User',
          email: 'integration@test.com',
          password: 'securePassword123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('integration@test.com');
      expect(response.body.data.org.id).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test',
          email: 'login@test.com',
          password: 'securePassword123'
        });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'securePassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
