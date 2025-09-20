import request from 'supertest';
import server from '../../src/server';

describe('Auth - Login', () => {
  it('returns 400 for missing credentials', async () => {
    const res = await request(server).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});



