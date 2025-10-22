import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  const players = await prisma.player.findMany({ include: { team: true } });
  res.json(players);
});

router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
  const { firstName, lastName, age, position, jerseyNumber, teamId, photoUrl } = req.body;
  const player = await prisma.player.create({
    data: { firstName, lastName, age, position, jerseyNumber, teamId, photoUrl }
  });
  res.status(201).json(player);
});

router.put('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  const player = await prisma.player.update({ where: { id }, data: req.body });
  res.json(player);
});

router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  await prisma.player.delete({ where: { id } });
  res.status(204).send();
});

export default router;
