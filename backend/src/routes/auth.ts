import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const router = Router();

// Registro email/password
router.post('/register', async (req, res) => {
  const { name, email, password, role, teamId, pushToken } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Email already used' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hash, role: role ?? 'fan', teamId: teamId ?? null, pushToken: pushToken ?? null }
  });
  const token = jwt.sign({ id: user.id, role: user.role, teamId: user.teamId }, process.env.JWT_SECRET!);
  res.json({ token, user });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password, pushToken } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  if (pushToken && pushToken !== user.pushToken) {
    await prisma.user.update({ where: { id: user.id }, data: { pushToken } });
  }
  const token = jwt.sign({ id: user.id, role: user.role, teamId: user.teamId }, process.env.JWT_SECRET!);
  res.json({ token, user });
});

// Google OAuth (idToken)
const googleAudience = (process.env.GOOGLE_CLIENT_IDS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const googleClient = new OAuth2Client();

router.post('/google/token', async (req, res) => {
  const { idToken, pushToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'Missing idToken' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleAudience.length ? googleAudience : undefined
    });
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(400).json({ error: 'No email in token' });

    const email = payload.email;
    const name = payload.name || email;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name, role: 'fan' }
      });
    }
    if ((pushToken && pushToken !== user.pushToken) || (name && name !== user.name)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { pushToken: pushToken ?? user.pushToken, name: name ?? user.name }
      });
    }
    const token = jwt.sign({ id: user.id, role: user.role, teamId: user.teamId }, process.env.JWT_SECRET!);
    res.json({ token, user });
  } catch (e) {
    console.error('Google token verify error', e);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});
import { requireAuth, AuthRequest } from '../middleware/auth.js';

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  res.json({ user });
});



export default router;
