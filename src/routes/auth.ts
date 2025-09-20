import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { signJwt } from '../utils/jwt';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password and name are required' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Email already in use' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed, name } });
  const token = signJwt({ sub: user.id, role: user.role, email: user.email });
  return res.status(201).json({ token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signJwt({ sub: user.id, role: user.role, email: user.email });
  return res.status(200).json({ token });
});

export default router;


