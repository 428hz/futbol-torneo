import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole(['admin']), async (_req, res) => {
  const users = await prisma.user.findMany({ include: { team: true } });
  res.json(users);
});

router.put('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.update({ where: { id }, data: req.body });
  res.json(user);
});

router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  await prisma.user.delete({ where: { id } });
  res.status(204).send();
});

export default router;
