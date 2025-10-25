import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.post('/:id/events', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    if (!Number.isFinite(matchId)) return res.status(400).json({ error: 'matchId inválido' });
    const { teamId, playerId, type, minute } = req.body ?? {};
    const teamIdNum = Number(teamId);
    const playerIdNum = playerId == null ? null : Number(playerId);
    const minuteNum = minute == null ? 0 : Number(minute);

    if (!Number.isFinite(teamIdNum)) return res.status(400).json({ error: 'teamId inválido' });
    if (!['goal','yellow','red'].includes(String(type))) return res.status(400).json({ error: 'type inválido' });
    if (!Number.isFinite(minuteNum) || minuteNum < 0 || minuteNum > 130) return res.status(400).json({ error: 'minute inválido (0-130)' });

    const match = await prisma.match.findUnique({ where: { id: matchId }, include: { homeTeam: true, awayTeam: true } });
    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

    const isHome = match.homeTeamId === teamIdNum;
    const isAway = match.awayTeamId === teamIdNum;
    if (!isHome && !isAway) return res.status(400).json({ error: 'teamId no corresponde al partido' });

    if (playerIdNum) {
      const p = await prisma.player.findUnique({ where: { id: playerIdNum } });
      if (!p) return res.status(404).json({ error: 'Jugador no encontrado' });
      if (p.teamId !== teamIdNum) return res.status(400).json({ error: 'Jugador no pertenece a ese equipo' });
    }

    const event = await prisma.matchEvent.create({
      data: { matchId, teamId: teamIdNum, playerId: playerIdNum ?? undefined, type, minute: minuteNum },
    });

    if (type === 'goal') {
      await prisma.match.update({
        where: { id: matchId },
        data: {
          homeScore: isHome ? match.homeScore + 1 : match.homeScore,
          awayScore: isAway ? match.awayScore + 1 : match.awayScore,
        },
      });
    }

    const updated = await prisma.match.findUnique({
      where: { id: matchId },
      include: { homeTeam: true, awayTeam: true, venue: true, events: { include: { player: true, team: true }, orderBy: { minute: 'asc' } } },
    });

    res.status(201).json({ event, match: updated });
  } catch (err) {
    console.error('CREATE MATCH EVENT ERROR', err);
    res.status(500).json({ error: 'No se pudo crear el evento' });
  }
});

router.delete('/:id/events/:eventId', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    const eventId = Number(req.params.eventId);
    if (!Number.isFinite(matchId) || !Number.isFinite(eventId)) return res.status(400).json({ error: 'id inválido' });

    const event = await prisma.matchEvent.findUnique({ where: { id: eventId } });
    if (!event || event.matchId !== matchId) return res.status(404).json({ error: 'Evento no encontrado' });

    await prisma.$transaction(async (tx) => {
      await tx.matchEvent.delete({ where: { id: eventId } });
      if (event.type === 'goal') {
        const goals = await tx.matchEvent.groupBy({
          by: ['teamId'],
          where: { matchId, type: 'goal' },
          _count: { _all: true },
        });
        const m = await tx.match.findUnique({ where: { id: matchId } });
        if (!m) return;
        const homeGoals = goals.find(g => g.teamId === m.homeTeamId)?._count._all ?? 0;
        const awayGoals = goals.find(g => g.teamId === m.awayTeamId)?._count._all ?? 0;
        await tx.match.update({ where: { id: matchId }, data: { homeScore: homeGoals, awayScore: awayGoals } });
      }
    });

    const updated = await prisma.match.findUnique({
      where: { id: matchId },
      include: { homeTeam: true, awayTeam: true, venue: true, events: { include: { player: true, team: true }, orderBy: { minute: 'asc' } } },
    });

    res.status(200).json({ match: updated });
  } catch (err) {
    console.error('DELETE MATCH EVENT ERROR', err);
    res.status(500).json({ error: 'No se pudo eliminar el evento' });
  }
});

export default router;