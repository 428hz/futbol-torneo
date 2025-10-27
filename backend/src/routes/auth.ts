import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

const googleClientIds = (process.env.GOOGLE_CLIENT_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const googleClient = new OAuth2Client();

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, pushToken } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { team: true },
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    if (pushToken) {
      await prisma.user.update({ where: { id: user.id }, data: { pushToken } });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId ?? null,
      },
    });
  } catch (err) {
    console.error('LOGIN ERROR', err);
    res.status(500).json({ error: 'Login error' });
  }
});

// POST /auth/register
// - Público: crea FAN con name/email/password (role forzado a fan).
// - Admin autenticado: puede especificar role ('admin'|'player'|'fan') y teamId.
router.post('/register', async (req: AuthRequest, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    // valores base para todos
    let role: 'admin'|'player'|'fan' = 'fan';
    let teamId: number | null | undefined = undefined;

    // si viene admin autenticado, puede especificar role/teamId
    if (req.headers.authorization?.startsWith('Bearer ')) {
      try {
        const hdrToken = req.headers.authorization.substring(7);
        const payload = jwt.verify(hdrToken, process.env.JWT_SECRET as string) as any;
        if (payload?.role === 'admin') {
          const r = (req.body?.role || '').trim();
          if (['admin','player','fan'].includes(r)) role = r as any;
          if (req.body?.teamId !== undefined && req.body?.teamId !== null && req.body?.teamId !== '') {
            teamId = Number(req.body.teamId);
            if (Number.isNaN(teamId)) teamId = undefined;
          }
        }
      } catch {
        // si el token es inválido, se ignora y se registra como fan
      }
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        password: hash,
        role,
        teamId: teamId ?? undefined,
      }
    });

    const token = jwt.sign(
      { sub: created.id, role: created.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        teamId: created.teamId ?? null,
      }
    });
  } catch (err) {
    console.error('REGISTER ERROR', err);
    res.status(500).json({ error: 'Register error' });
  }
});

// POST /auth/google/token
router.post('/google/token', async (req, res) => {
  try {
    const { idToken, pushToken } = req.body ?? {};
    if (!idToken) return res.status(400).json({ error: 'idToken is required' });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleClientIds.length ? googleClientIds : undefined,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(401).json({ error: 'Invalid Google token (no email)' });

    const email = payload.email;
    const name = payload.name || email.split('@')[0];

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: null,
          role: 'fan',
          pushToken: pushToken || null,
        },
      });
    } else if (pushToken && user.pushToken !== pushToken) {
      await prisma.user.update({ where: { id: user.id }, data: { pushToken } });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId ?? null,
      },
    });
  } catch (err: any) {
    console.error('GOOGLE LOGIN ERROR', err?.message || err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

export default router;