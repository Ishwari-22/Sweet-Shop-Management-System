import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma';

async function main() {
  const adminEmail = 'admin@sweetshop.local';
  const adminPassword = 'Admin123!';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({ data: { email: adminEmail, password: hashed, name: 'Admin', role: 'ADMIN' } });
    // eslint-disable-next-line no-console
    console.log(`Seeded admin user: ${adminEmail} / ${adminPassword}`);
  }

  const sweets = [
    { name: 'Gulab Jamun', category: 'Indian', price: 4.0, quantity: 20 },
    { name: 'Jalebi', category: 'Indian', price: 2.0, quantity: 15 },
    { name: 'Chocolate Truffle', category: 'Western', price: 6.5, quantity: 10 }
  ];

  for (const s of sweets) {
    await prisma.sweet.upsert({
      where: { name: s.name },
      update: s,
      create: s
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });



