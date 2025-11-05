import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Sube foto de PERFIL del usuario logueado
// - Guarda el archivo y, si el schema tiene user.photoUrl, lo actualiza (si no, ignora y devuelve la URL).
router.post('/photo', requireAuth, async (req: AuthRequest & any, res) => {
  const upload = req.app.get('upload');
  if (!upload) return res.status(500).json({ error: 'Upload not initialized' });

  upload.single('file')(req, res, async (err: any) => {
    if (err) return res.status(400).json({ error: 'Upload failed' });
    const url = `/uploads/${req.file.filename}`;

    // Intentar guardar en user.photoUrl si existe la columna
    try {
      await prisma.user.update({ where: { id: req.user!.id }, data: { photoUrl: url } as any });
    } catch {
      // Si el campo no existe en el schema, lo ignoramos.
    }

    res.json({ photoUrl: url });
  });
});

export default router;