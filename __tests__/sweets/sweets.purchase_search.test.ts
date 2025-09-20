import request from 'supertest';
import server from '../../src/server';
import prisma from '../../src/config/prisma';

async function token(role: 'USER' | 'ADMIN' = 'USER') {
  const email = `buyer+${role}+${Date.now()}@ex.com`;
  const password = 'Password123!';
  const name = 'Buyer';
  const reg = await request(server).post('/api/auth/register').send({ email, password, name });
  if (role === 'ADMIN') {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
    const login = await request(server).post('/api/auth/login').send({ email, password });
    return login.body.token as string;
  }
  return reg.body.token as string;
}

describe('Sweets - purchase, restock, and search', () => {
  it('handles purchase and prevents over-purchase', async () => {
    const admin = await token('ADMIN');
    const user = await token('USER');
    const created = await request(server)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${admin}`)
      .send({ name: 'Jalebi', category: 'Indian', price: 1.5, quantity: 2 });
    const id = created.body.id as number;

    const okPurchase = await request(server)
      .post(`/api/sweets/${id}/purchase`)
      .set('Authorization', `Bearer ${user}`)
      .send({ quantity: 1 });
    expect(okPurchase.status).toBe(200);
    expect(okPurchase.body.quantity).toBe(1);

    const badPurchase = await request(server)
      .post(`/api/sweets/${id}/purchase`)
      .set('Authorization', `Bearer ${user}`)
      .send({ quantity: 5 });
    expect(badPurchase.status).toBe(400);

    const restock = await request(server)
      .post(`/api/sweets/${id}/restock`)
      .set('Authorization', `Bearer ${admin}`)
      .send({ quantity: 10 });
    expect(restock.status).toBe(200);
    expect(restock.body.quantity).toBe(11);
  });

  it('searches by name, category, and price range', async () => {
    const admin = await token('ADMIN');
    const user = await token('USER');
    await request(server)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${admin}`)
      .send({ name: 'Gulab Jamun', category: 'Indian', price: 4, quantity: 3 });
    await request(server)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${admin}`)
      .send({ name: 'Chocolate Truffle', category: 'Western', price: 6, quantity: 2 });

    const byName = await request(server)
      .get('/api/sweets/search?q=chocolate')
      .set('Authorization', `Bearer ${user}`);
    expect(byName.status).toBe(200);
    expect(byName.body.some((s: any) => /chocolate/i.test(s.name))).toBe(true);

    const byCat = await request(server)
      .get('/api/sweets/search?category=indian')
      .set('Authorization', `Bearer ${user}`);
    expect(byCat.status).toBe(200);
    expect(byCat.body.every((s: any) => /indian/i.test(s.category))).toBe(true);

    const byPrice = await request(server)
      .get('/api/sweets/search?minPrice=5&maxPrice=7')
      .set('Authorization', `Bearer ${user}`);
    expect(byPrice.status).toBe(200);
    expect(byPrice.body.every((s: any) => Number(s.price) >= 5 && Number(s.price) <= 7)).toBe(true);
  });
});



