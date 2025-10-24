import { Router } from 'express';
import { prisma } from '../lib/prisma';
// Si tenés middlewares de auth, dejalos. Si no, podés quitar requireAuth/requireRole.
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Listado (por si no está)
router.get('/', async (_req, res) => {
  const players = await prisma.player.findMany({
    include: { team: true },
    orderBy: { id: 'asc' },
  });
  res.json(players);
});

// Crear jugador
router.post(
  '/',
  requireAuth,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { firstName, lastName, age, position, jerseyNumber, teamId, photoUrl } = req.body ?? {};

      // Convertir a número lo que debe ser número
      const teamIdNum = Number(teamId);
      const ageNum = Number(age);
      const jerseyNumberNum = Number(jerseyNumber);

      // Validaciones
      if (!firstName || !lastName || !position) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }
      if (!Number.isFinite(teamIdNum)) {
        return res.status(400).json({ error: 'teamId inválido' });
      }
      if (!Number.isFinite(ageNum)) {
        return res.status(400).json({ error: 'age inválida' });
      }
      if (!Number.isFinite(jerseyNumberNum)) {
        return res.status(400).json({ error: 'jerseyNumber inválido' });
      }

      const player = await prisma.player.create({
        data: {
          firstName,
          lastName,
          age: ageNum,
          position,
          jerseyNumber: jerseyNumberNum,
          teamId: teamIdNum,
          photoUrl: photoUrl || null,
        },
        include: { team: true },
      });

      res.status(201).json(player);
    } catch (err) {
      console.error('CREATE PLAYER ERROR', err);
      res.status(500).json({ error: 'No se pudo crear el jugador' });
    }
  }
);

// Actualizar jugador (ejemplo: si permitís cambiar números, también convertí)
router.put(
  '/:id',
  requireAuth,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

      const data: any = {};
      const { firstName, lastName, age, position, jerseyNumber, teamId, photoUrl } = req.body ?? {};

      if (firstName !== undefined) data.firstName = firstName;
      if (lastName !== undefined) data.lastName = lastName;
      if (position !== undefined) data.position = position;
      if (photoUrl !== undefined) data.photoUrl = photoUrl || null;

      if (age !== undefined) {
        const n = Number(age);
        if (!Number.isFinite(n)) return res.status(400).json({ error: 'age inválida' });
        data.age = n;
      }
      if (jerseyNumber !== undefined) {
        const n = Number(jerseyNumber);
        if (!Number.isFinite(n)) return res.status(400).json({ error: 'jerseyNumber inválido' });
        data.jerseyNumber = n;
      }
      if (teamId !== undefined) {
        const n = Number(teamId);
        if (!Number.isFinite(n)) return res.status(400).json({ error: 'teamId inválido' });
        data.teamId = n;
      }

      const player = await prisma.player.update({
        where: { id },
        data,
        include: { team: true },
      });

      res.json(player);
    } catch (err) {
      console.error('UPDATE PLAYER ERROR', err);
      res.status(500).json({ error: 'No se pudo actualizar el jugador' });
    }
  }
);

// Eliminar jugador
router.delete(
  '/:id',
  requireAuth,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

      await prisma.player.delete({ where: { id } });
      res.status(204).send();
    } catch (err) {
      console.error('DELETE PLAYER ERROR', err);
      res.status(500).json({ error: 'No se pudo eliminar el jugador' });
    }
  }
);

export default router;