import request from 'supertest';
import app from '../../src/app';

describe('Audit Log API', () => {
  let token: string;

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Audit User', email: 'audit@test.com', password: 'password123'
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'audit@test.com', password: 'password123'
    });
    token = loginRes.body.data.accessToken;
  });

  it('should capture audit logs for transaction creation', async () => {
    // 1. Create Transaction
    const txRes = await request(app).post('/api/transactions').set('Authorization', `Bearer ${token}`).send({
      type: 'EXPENSE', amount: 100, category: 'Misc'
    });
    expect(txRes.status).toBe(201);

    // 2. Fetch Audit Logs
    const auditRes = await request(app).get('/api/audit?limit=10').set('Authorization', `Bearer ${token}`);
    expect(auditRes.status).toBe(200);
    
    // 3. Verify Log Exists
    const logs = auditRes.body.data;
    const creationLog = logs.find((l: any) => l.action === 'CREATE_TRANSACTION');
    expect(creationLog).toBeDefined();
    expect(creationLog.entityType).toBe('TRANSACTION');
  });
});
