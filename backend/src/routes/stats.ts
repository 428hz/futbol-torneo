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

// NUEVO: tarjetas por jugador
router.get('/cards-by-player', async (_req, res) => {
  const yellows = await prisma.matchEvent.groupBy({
    by: ['playerId'],
    where: { type: 'yellow', playerId: { not: null } },
    _count: { _all: true },
  });
  const reds = await prisma.matchEvent.groupBy({
    by: ['playerId'],
    where: { type: 'red', playerId: { not: null } },
    _count: { _all: true },
  });
  const ids = Array.from(new Set([...yellows.map(y=>y.playerId!), ...reds.map(r=>r.playerId!)]));
  const players = await prisma.player.findMany({ where: { id: { in: ids } }, include: { team: true } });

  const yellowMap = new Map(yellows.map(y => [y.playerId!, y._count._all]));
  const redMap = new Map(reds.map(r => [r.playerId!, r._count._all]));

  const result = ids.map(id => {
    const p = players.find(pl => pl.id === id)!;
    const y = yellowMap.get(id) || 0;
    const r = redMap.get(id) || 0;
    return { playerId: id, name: `${p.firstName} ${p.lastName}`, team: p.team.name, yellow: y, red: r, total: y + r };
  }).sort((a,b)=> b.total - a.total || b.red - a.red || b.yellow - a.yellow);

  res.json(result);
});

// NUEVO: tarjetas por equipo
router.get('/cards-by-team', async (_req, res) => {
  const yellows = await prisma.matchEvent.groupBy({
    by: ['teamId'],
    where: { type: 'yellow' },
    _count: { _all: true },
  });
  const reds = await prisma.matchEvent.groupBy({
    by: ['teamId'],
    where: { type: 'red' },
    _count: { _all: true },
  });
  const ids = Array.from(new Set([...yellows.map(y=>y.teamId), ...reds.map(r=>r.teamId)]));
  const teams = await prisma.team.findMany({ where: { id: { in: ids } } });

  const yellowMap = new Map(yellows.map(y => [y.teamId, y._count._all]));
  const redMap = new Map(reds.map(r => [r.teamId, r._count._all]));

  const result = ids.map(id => {
    const t = teams.find(tt => tt.id === id)!;
    const y = yellowMap.get(id) || 0;
    const r = redMap.get(id) || 0;
    return { teamId: id, teamName: t.name, yellow: y, red: r, total: y + r };
  }).sort((a,b)=> b.total - a.total || b.red - a.red || b.yellow - a.yellow);

  res.json(result);
});

export default router;