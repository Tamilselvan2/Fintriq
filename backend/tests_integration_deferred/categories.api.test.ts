import request from 'supertest';
import app from '../../src/app';

describe('Categories API', () => {
  let token: string;

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Cat User', email: 'cat@test.com', password: 'password123'
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'cat@test.com', password: 'password123'
    });
    token = loginRes.body.data.accessToken;
  });

  describe('Category Lifecycle', () => {
    it('should create, list, and verify category uniqueness per org', async () => {
      // Create
      const createRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Groceries' });
      
      expect(createRes.status).toBe(201);
      expect(createRes.body.data.name).toBe('Groceries');

      // Attempt duplicate
      const dupRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Groceries' });
      
      expect(dupRes.status).toBe(400);

      // List
      const listRes = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${token}`);
      
      expect(listRes.body.data.length).toBeGreaterThan(0);
      expect(listRes.body.data.some((c: any) => c.name === 'Groceries')).toBe(true);
    });
  });
});
