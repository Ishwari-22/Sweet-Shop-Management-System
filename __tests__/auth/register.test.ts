import request from 'supertest';
import server from '../../src/server';

describe('Auth - Register', () => {
  it('returns 400 when missing required fields', async () => {
    const res = await request(server).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });

  it('creates a new user and returns JWT', async () => {
    const res = await request(server).post('/api/auth/register').send({
      email: `user+${Date.now()}@example.com`,
      password: 'Password123!@#',
      name: 'Test User'
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });
});



