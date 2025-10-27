import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/upcoming', async (_req, res) => {
  const now = new Date();
  const matches = await prisma.match.findMany({
    where: { datetime: { gte: now } },
    include: { homeTeam: true, awayTeam: true, venue: true },
    orderBy: { datetime: 'asc' }
  });
  res.json(matches);
});

router.get('/', async (_req, res) => {
  const matches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true, venue: true },
    orderBy: { datetime: 'asc' }
  });
  res.json(matches);
});

// Eventos de un partido (goles/amarillas/rojas)
router.get('/:id/events', async (req, res) => {
  const matchId = Number(req.params.id);
  const events = await prisma.matchEvent.findMany({
    where: { matchId },
    include: { player: true, team: true },
    orderBy: [{ minute: 'asc' }, { createdAt: 'asc' }],
  });
  res.json(events);
});

router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
  const { homeTeamId, awayTeamId, venueId, datetime } = req.body;
  const match = await prisma.match.create({
    data: { homeTeamId, awayTeamId, venueId, datetime: new Date(datetime) }
  });
  res.status(201).json(match);
});

router.post('/:id/events', requireAuth, requireRole(['admin']), async (req, res) => {
  const matchId = Number(req.params.id);
  const { teamId, playerId, minute, type } = req.body; // ← sin "notes" porque no existe en el schema
  const event = await prisma.matchEvent.create({
    data: { matchId, teamId, playerId, minute, type }
  });

  // actualizar marcador si es gol
  if (type === 'goal') {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (match) {
      const homeGoal = teamId === match.homeTeamId ? 1 : 0;
      const awayGoal = teamId === match.awayTeamId ? 1 : 0;
      await prisma.match.update({
        where: { id: matchId },
        data: { homeScore: match.homeScore + homeGoal, awayScore: match.awayScore + awayGoal }
      });
    }
  }
  res.status(201).json(event);
});

// eliminar evento y recalcular marcador si el evento eliminado era un gol
router.delete('/:id/events/:eventId', requireAuth, requireRole(['admin']), async (req, res) => {
  const matchId = Number(req.params.id);
  const eventId = Number(req.params.eventId);

  const ev = await prisma.matchEvent.findUnique({ where: { id: eventId } });
  if (!ev || ev.matchId !== matchId) return res.status(404).json({ error: 'Event not found' });

  await prisma.matchEvent.delete({ where: { id: eventId } });

  if (ev.type === 'goal') {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (match) {
      const goals = await prisma.matchEvent.groupBy({
        by: ['teamId'],
        where: { matchId, type: 'goal' },
        _count: { _all: true },
      });
      const byTeam = new Map(goals.map(g => [g.teamId, g._count._all]));
      const homeScore = byTeam.get(match.homeTeamId) || 0;
      const awayScore = byTeam.get(match.awayTeamId) || 0;
      await prisma.match.update({ where: { id: matchId }, data: { homeScore, awayScore } });
    }
  }
  res.status(204).send();
});

router.post('/:id/finish', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  const match = await prisma.match.update({ where: { id }, data: { status: 'finished' } });
  res.json(match);
});

// borrar un partido (cascada borra sus eventos)
router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  await prisma.match.delete({ where: { id } });
  res.status(204).send();
});

// borrado masivo por status y/o fecha (YYYY-MM-DD)
router.delete('/', requireAuth, requireRole(['admin']), async (req, res) => {
  const { status, before } = req.query as { status?: string; before?: string };
  const where: any = {};
  if (status) where.status = status;
  if (before) where.datetime = { lt: new Date(before) };
  const result = await prisma.match.deleteMany({ where });
  res.json({ deleted: result.count });
});

export default router;