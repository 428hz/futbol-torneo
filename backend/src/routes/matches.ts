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

router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
  const { homeTeamId, awayTeamId, venueId, datetime } = req.body;
  const match = await prisma.match.create({
    data: { homeTeamId, awayTeamId, venueId, datetime: new Date(datetime) }
  });
  res.status(201).json(match);
});

router.post('/:id/events', requireAuth, requireRole(['admin']), async (req, res) => {
  const matchId = Number(req.params.id);
  const { teamId, playerId, minute, type, notes } = req.body;
  const event = await prisma.matchEvent.create({
    data: { matchId, teamId, playerId, minute, type, notes }
  });

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

router.post('/:id/finish', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  const match = await prisma.match.update({ where: { id }, data: { status: 'finished' } });
  res.json(match);
});

export default router;
