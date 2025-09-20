import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, category, price, quantity } = req.body || {};
  if (!name || !category || typeof price !== 'number') {
    return res.status(400).json({ error: 'name, category, price required' });
  }
  const sweet = await prisma.sweet.create({ data: { name, category, price, quantity: quantity ?? 0 } });
  return res.status(201).json(sweet);
});

router.get('/', requireAuth, async (_req, res) => {
  const sweets = await prisma.sweet.findMany({ orderBy: { id: 'asc' } });
  return res.json(sweets);
});

router.get('/search', requireAuth, async (req, res) => {
  const { q, category, minPrice, maxPrice } = req.query as Record<string, string>;
  const where: any = {};
  if (q) where.name = { contains: q, mode: 'insensitive' };
  if (category) where.category = { equals: category, mode: 'insensitive' };
  if (minPrice || maxPrice) where.price = { gte: minPrice ? Number(minPrice) : undefined, lte: maxPrice ? Number(maxPrice) : undefined };
  const sweets = await prisma.sweet.findMany({ where, orderBy: { id: 'asc' } });
  return res.json(sweets);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const sweet = await prisma.sweet.update({ where: { id }, data: req.body });
    return res.json(sweet);
  } catch {
    return res.status(404).json({ error: 'Not found' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.sweet.delete({ where: { id } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: 'Not found' });
  }
});

router.post('/:id/purchase', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const qty = Number((req.body && req.body.quantity) ?? 1);
  const sweet = await prisma.sweet.findUnique({ where: { id } });
  if (!sweet) return res.status(404).json({ error: 'Not found' });
  if (sweet.quantity < qty) return res.status(400).json({ error: 'Insufficient stock' });
  const updated = await prisma.sweet.update({ where: { id }, data: { quantity: sweet.quantity - qty } });
  return res.json(updated);
});

router.post('/:id/restock', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const qty = Number((req.body && req.body.quantity) ?? 1);
  const sweet = await prisma.sweet.findUnique({ where: { id } });
  if (!sweet) return res.status(404).json({ error: 'Not found' });
  const updated = await prisma.sweet.update({ where: { id }, data: { quantity: sweet.quantity + qty } });
  return res.json(updated);
});

export default router;



