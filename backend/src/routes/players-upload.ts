import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// admin: puede cualquiera
// player: solo si el jugador pertenece a su mismo equipo
// fan: 403
router.post('/:id/photo', requireAuth, async (req: AuthRequest & any, res) => {
  const upload = req.app.get('upload');
  if (!upload) return res.status(500).json({ error: 'Upload not initialized' });

  const userId = req.user!.id;
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, teamId: true } });

  const playerId = Number(req.params.id);
  if (!Number.isFinite(playerId)) return res.status(400).json({ error: 'Invalid player id' });

  const player = await prisma.player.findUnique({ where: { id: playerId }, select: { teamId: true } });
  if (!player) return res.status(404).json({ error: 'Player not found' });

  if (me?.role === 'fan') {
    return res.status(403).json({ error: 'Solo administradores o jugadores del mismo equipo pueden subir fotos' });
  }
  if (me?.role === 'player' && (!me.teamId || me.teamId !== player.teamId)) {
    return res.status(403).json({ error: 'Jugadores solo pueden subir fotos de su propio equipo' });
  }

  upload.single('file')(req, res, async (err: any) => {
    if (err) return res.status(400).json({ error: 'Upload failed' });
    const url = `/uploads/${req.file.filename}`;
    await prisma.player.update({ where: { id: playerId }, data: { photoUrl: url } });
    res.json({ photoUrl: url });
  });
});

export default router;