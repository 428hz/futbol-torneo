import { Router } from 'express';
import { prisma } from '../lib/prisma';
// Si NO usás auth, podés quitar estas dos líneas y también los middlewares de las rutas POST/DELETE.
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Listar sedes
router.get('/', async (_req, res) => {
  const venues = await prisma.venue.findMany({ orderBy: { id: 'asc' } });
  res.json(venues);
});

// Crear sede (admin)
router.post(
  '/',
  requireAuth,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { name, address, latitude, longitude } = req.body ?? {};

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'name requerido' });
      }

      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({ error: 'lat/long inválidos' });
      }

      const venue = await prisma.venue.create({
        data: {
          name: name.trim(),
          address: String(address || ''),
          latitude: lat,
          longitude: lng,
        },
      });

      res.status(201).json(venue);
    } catch (err) {
      console.error('CREATE VENUE ERROR', err);
      res.status(500).json({ error: 'No se pudo crear la sede' });
    }
  }
);

// Eliminar sede (admin)
router.delete(
  '/:id',
  requireAuth,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ error: 'id inválido' });
      }

      await prisma.venue.delete({
        where: { id }, // IMPORTANTE: acá va el valor, NO "Int"
      });

      res.status(204).send();
    } catch (err: any) {
      // P2025: no encontrada; P2003: restricción de FK (tiene partidos asociados)
      if (err?.code === 'P2025') {
        return res.status(404).json({ error: 'Sede no encontrada' });
      }
      if (err?.code === 'P2003') {
        return res.status(409).json({ error: 'La sede tiene partidos asociados' });
      }
      console.error('DELETE VENUE ERROR', err);
      res.status(500).json({ error: 'No se pudo eliminar la sede' });
    }
  }
);

export default router;