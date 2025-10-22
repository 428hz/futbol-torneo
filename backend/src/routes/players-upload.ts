import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/:id/photo', requireAuth, requireRole(['admin']), async (req: any, res) => {
  const upload = req.app.get('upload');
  upload.single('file')(req, res, async (err: any) => {
    if (err) return res.status(400).json({ error: 'Upload failed' });
    const id = Number(req.params.id);
    const url = `/uploads/${req.file.filename}`;
    await prisma.player.update({ where: { id }, data: { photoUrl: url } });
    res.json({ photoUrl: url });
  });
});

export default router;
