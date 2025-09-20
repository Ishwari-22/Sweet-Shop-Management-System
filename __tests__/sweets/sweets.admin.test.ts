import request from 'supertest';
import server from '../../src/server';
import prisma from '../../src/config/prisma';

async function createUserAndToken(role: 'USER' | 'ADMIN') {
  const email = `u+${role}+${Date.now()}@ex.com`;
  const password = 'Password123!';
  const name = 'Tester';
  const reg = await request(server).post('/api/auth/register').send({ email, password, name });
  if (role === 'ADMIN') {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
    // login to get fresh token with role (or just sign again by re-login)
    const login = await request(server).post('/api/auth/login').send({ email, password });
    return login.body.token as string;
  }
  return reg.body.token as string;
}

describe('Sweets - admin protected operations', () => {
  it('prevents non-admin from creating a sweet', async () => {
    const userToken = await createUserAndToken('USER');
    const res = await request(server)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Ladoo', category: 'Indian', price: 2.5, quantity: 10 });
    expect(res.status).toBe(403);
  });

  it('allows admin to create, update, and delete a sweet', async () => {
    const adminToken = await createUserAndToken('ADMIN');
    // create
    const createRes = await request(server)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Barfi', category: 'Indian', price: 3.0, quantity: 5 });
    expect(createRes.status).toBe(201);
    const sweetId = createRes.body.id as number;

    // update
    const updateRes = await request(server)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 3.5 });
    expect(updateRes.status).toBe(200);
    expect(Number(updateRes.body.price)).toBeCloseTo(3.5);

    // delete
    const delRes = await request(server)
      .delete(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(delRes.status).toBe(204);
  });
});



