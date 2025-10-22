import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  const teams = await prisma.team.findMany({
    include: {
      players: true,
      homeMatches: { where: { status: 'finished' } },
      awayMatches: { where: { status: 'finished' } }
    }
  });
  const mapped = teams.map(t => {
    const played = t.homeMatches.length + t.awayMatches.length;
    const gf = t.homeMatches.reduce((s, m) => s + m.homeScore, 0) + t.awayMatches.reduce((s, m) => s + m.awayScore, 0);
    const ga = t.homeMatches.reduce((s, m) => s + m.awayScore, 0) + t.awayMatches.reduce((s, m) => s + m.homeScore, 0);
    const wins = t.homeMatches.filter(m => m.homeScore > m.awayScore).length + t.awayMatches.filter(m => m.awayScore > m.homeScore).length;
    const draws = t.homeMatches.filter(m => m.homeScore === m.awayScore).length + t.awayMatches.filter(m => m.homeScore === m.awayScore).length;
    const losses = played - wins - draws;
    const points = wins * 3 + draws;
    return {
      id: t.id, name: t.name, crestUrl: t.crestUrl,
      players: t.players,
      stats: { played, wins, draws, losses, gf, ga, gd: gf - ga, points }
    };
  });
  res.json(mapped.sort((a,b)=> b.stats.points - a.stats.points || b.stats.gd - a.stats.gd));
});

router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
  const { name, crestUrl } = req.body;
  const team = await prisma.team.create({ data: { name, crestUrl } });
  res.status(201).json(team);
});

router.put('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  const { name, crestUrl } = req.body;
  const team = await prisma.team.update({ where: { id }, data: { name, crestUrl } });
  res.json(team);
});

router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.team.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    console.error(e); // Opcional: para ver el error en la consola del backend
    res.status(500).json({ error: 'No se pudo borrar el equipo.' });
  }
});

export default router;
