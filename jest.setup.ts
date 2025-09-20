jest.setTimeout(30000);

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';



