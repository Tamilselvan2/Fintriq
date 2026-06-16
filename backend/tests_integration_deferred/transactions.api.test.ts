import request from 'supertest';
import app from '../../src/app';

describe('Transactions API', () => {
  let token: string;
  let orgId: string;
  let otherToken: string;

  beforeEach(async () => {
    // Setup Primary User
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'User 1', email: 'user1@test.com', password: 'password123'
    });
    expect(regRes.status).toBe(201);
    orgId = regRes.body.data.org.id;
    
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'user1@test.com', password: 'password123'
    });
    token = loginRes.body.data.accessToken;

    const regRes2 = await request(app).post('/api/auth/register').send({
      name: 'User 2', email: 'user2@test.com', password: 'password123'
    });
    expect(regRes2.status).toBe(201);
    
    const loginRes2 = await request(app).post('/api/auth/login').send({
      email: 'user2@test.com', password: 'password123'
    });
    otherToken = loginRes2.body.data.accessToken;
  });

  describe('Historical Transactions & Date Fallbacks', () => {
    it('should fall back to createdAt when transactionDate is missing', async () => {
      // Create transaction without transactionDate
      await request(app).post('/api/transactions').set('Authorization', `Bearer ${token}`).send({
        type: 'INCOME', amount: 500, category: 'Sales', description: 'No Date'
      });

      const res = await request(app).get('/api/transactions').set('Authorization', `Bearer ${token}`);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].transactionDate).toBeNull();
      expect(res.body.data[0].createdAt).toBeDefined();
    });
  });

  describe('Date Filtering', () => {
    it('should filter transactions by startDate and endDate', async () => {
      await request(app).post('/api/transactions').set('Authorization', `Bearer ${token}`).send({
        type: 'EXPENSE', amount: 100, category: 'Food', transactionDate: '2026-05-15'
      });
      await request(app).post('/api/transactions').set('Authorization', `Bearer ${token}`).send({
        type: 'EXPENSE', amount: 200, category: 'Travel', transactionDate: '2026-06-20'
      });

      const res = await request(app).get('/api/transactions?startDate=2026-05-01&endDate=2026-05-31').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].category).toBe('Food');
    });
  });

  describe('Search + Filter Composition', () => {
    it('should compose search, type, and date filters correctly', async () => {
      await request(app).post('/api/transactions').set('Authorization', `Bearer ${token}`).send({
        type: 'INCOME', amount: 1000, category: 'Salary', description: 'June Salary', transactionDate: '2026-06-01'
      });
      await request(app).post('/api/transactions').set('Authorization', `Bearer ${token}`).send({
        type: 'EXPENSE', amount: 50, category: 'Food', description: 'June Groceries', transactionDate: '2026-06-02'
      });
      
      const res = await request(app).get('/api/transactions?search=June&type=INCOME&startDate=2026-06-01').set('Authorization', `Bearer ${token}`);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].amount).toBe(1000);
    });
  });

  describe('Multi-Tenant Security Suite', () => {
    it('should not allow Org A to access Org B data', async () => {
      // User 1 creates transaction
      const createRes = await request(app).post('/api/transactions').set('Authorization', `Bearer ${token}`).send({
        type: 'EXPENSE', amount: 500, category: 'Hardware'
      });
      const txId = createRes.body.data.id;

      // User 2 tries to GET
      const getRes = await request(app).get(`/api/transactions/${txId}`).set('Authorization', `Bearer ${otherToken}`);
      expect(getRes.status).toBe(404);

      // User 2 tries to PATCH
      const patchRes = await request(app).patch(`/api/transactions/${txId}`).set('Authorization', `Bearer ${otherToken}`).send({ amount: 100 });
      expect(patchRes.status).toBe(404);

      // User 2 tries to DELETE
      const deleteRes = await request(app).delete(`/api/transactions/${txId}`).set('Authorization', `Bearer ${otherToken}`);
      expect(deleteRes.status).toBe(404);
    });
  });
});
