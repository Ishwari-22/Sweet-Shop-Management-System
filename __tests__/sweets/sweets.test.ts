import request from 'supertest';
import server from '../../src/server';

async function registerAndLogin(role: 'USER' | 'ADMIN' = 'USER') {
  const email = `user+${role}+${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = 'Tester';
  // Register
  const reg = await request(server).post('/api/auth/register').send({ email, password, name });
  expect(reg.status).toBe(201);
  if (role === 'ADMIN') {
    // naive: we don't have an admin creation route yet; skip role change for now
  }
  return reg.body.token as string;
}

describe('Sweets API (basic)', () => {
  it('requires auth', async () => {
    const res = await request(server).get('/api/sweets');
    expect(res.status).toBe(401);
  });

  it('lists sweets (empty initially)', async () => {
    const token = await registerAndLogin('USER');
    const res = await request(server).get('/api/sweets').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});



