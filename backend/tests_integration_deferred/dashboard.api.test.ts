import request from 'supertest';
import app from '../../src/app';

describe('Dashboard API', () => {
  let token: string;

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Dash User', email: 'dash@test.com', password: 'password123'
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'dash@test.com', password: 'password123'
    });
    token = loginRes.body.data.accessToken;
  });

  it('should calculate accurate metrics and recent transactions', async () => {
    // Add Income
    await request(app).post('/api/transactions').set('Authorization', `Bearer ${token}`).send({
      type: 'INCOME', amount: 3000, category: 'Salary'
    });
    // Add Expense
    await request(app).post('/api/transactions').set('Authorization', `Bearer ${token}`).send({
      type: 'EXPENSE', amount: 500, category: 'Food'
    });

    const res = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    
    expect(res.body.data.overview.totalIncome).toBe(3000);
    expect(res.body.data.overview.totalExpense).toBe(500);
    expect(res.body.data.overview.balance).toBe(2500);
    expect(res.body.data.recentTransactions.length).toBe(2);
  });
});
