import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';

// Ensure a fresh SQLite DB before tests
beforeAll(() => {
  const dbPath = path.join(process.cwd(), 'dev.db');
  if (existsSync(dbPath)) {
    rmSync(dbPath);
  }
  execSync('npm run prisma:migrate -- --name init --skip-seed', { stdio: 'inherit' });
});


