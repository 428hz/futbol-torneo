import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const venues = await prisma.venue.findMany({ orderBy: { name: 'asc' } });
  res.json(venues);
});

router.post(
  '/',
  requireAuth,
  requireRole(['admin']),
  async (req: Request, res: Response) => {
    const { name, address, latitude, longitude } = req.body as {
      name: string;
      address?: string;
      latitude: number;
      longitude: number;
    };
    const v = await prisma.venue.create({
      data: { name, address, latitude, longitude },
    });
    res.status(201).json(v);
  }
);

router.put(
  '/:id',
  requireAuth,
  requireRole(['admin']),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const v = await prisma.venue.update({ where: { id }, data: req.body });
    res.json(v);
  }
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(['admin']),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await prisma.venue.delete({ where: { id } });
    res.status(204).send();
  }
);

export default router;