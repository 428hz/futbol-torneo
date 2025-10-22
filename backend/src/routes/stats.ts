import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/standings', async (_req, res) => {
  const teams = await prisma.team.findMany({
    include: {
      homeMatches: { where: { status: 'finished' } },
      awayMatches: { where: { status: 'finished' } }
    }
  });
  const standings = teams.map(t => {
    const played = t.homeMatches.length + t.awayMatches.length;
    const gf = t.homeMatches.reduce((s, m) => s + m.homeScore, 0) + t.awayMatches.reduce((s, m) => s + m.awayScore, 0);
    const ga = t.homeMatches.reduce((s, m) => s + m.awayScore, 0) + t.awayMatches.reduce((s, m) => s + m.homeScore, 0);
    const wins = t.homeMatches.filter(m => m.homeScore > m.awayScore).length + t.awayMatches.filter(m => m.awayScore > m.homeScore).length;
    const draws = t.homeMatches.filter(m => m.homeScore === m.awayScore).length + t.awayMatches.filter(m => m.homeScore === m.awayScore).length;
    const losses = played - wins - draws;
    const points = wins * 3 + draws;
    return { teamId: t.id, teamName: t.name, played, wins, draws, losses, gf, ga, gd: gf - ga, points };
  });
  standings.sort((a,b)=> b.points - a.points || b.gd - a.gd);
  res.json(standings);
});

router.get('/top-scorers', async (_req, res) => {
  const events = await prisma.matchEvent.groupBy({
    by: ['playerId'],
    where: { type: 'goal', playerId: { not: null } },
    _count: { playerId: true }
  });
  const players = await prisma.player.findMany({
    where: { id: { in: events.map(e => e.playerId!) } },
    include: { team: true }
  });
  const result = events.map(e => {
    const p = players.find(pl => pl.id === e.playerId);
    return { playerId: e.playerId, name: p ? `${p.firstName} ${p.lastName}` : 'N/A', team: p?.team.name, goals: e._count.playerId };
  }).sort((a,b)=> b.goals - a.goals);
  res.json(result);
});

export default router;
