import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Expo } from 'expo-server-sdk';

const router = Router();
const expo = new Expo();

// Broadcast a todos con pushToken
router.post(
  '/broadcast',
  requireAuth,
  requireRole(['admin']),
  async (req: Request, res: Response) => {
    const { title = 'Aviso', body = 'Notificación' } = (req.body || {}) as {
      title?: string;
      body?: string;
    };

    const users = await prisma.user.findMany({
      where: { pushToken: { not: null } },
      select: { pushToken: true },
    });

    const tokens = users
      .map(u => u.pushToken!)
      .filter(t => Expo.isExpoPushToken(t));

    if (!tokens.length) {
      return res.json({ sent: 0, skipped: users.length });
    }

    const messages = tokens.map(token => ({
      to: token,
      sound: 'default' as const,
      title,
      body,
    }));

    const chunks = expo.chunkPushNotifications(messages);
    let sent = 0;

    for (const chunk of chunks) {
      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        sent += tickets.length;
      } catch (e) {
        console.error('Expo push error', e);
      }
    }

    res.json({ sent, tokens: tokens.length });
  }
);

// NUEVO: notificar solo a seguidores de un equipo
router.post(
  '/team/:id',
  requireAuth,
  requireRole(['admin']),
  async (req: Request, res: Response) => {
    const teamId = Number(req.params.id);
    const { title = 'Aviso', body = 'Notificación' } = (req.body || {}) as {
      title?: string;
      body?: string;
    };

    const followers = await prisma.follower.findMany({
      where: { teamId },
      select: { user: { select: { pushToken: true } } },
    });

    const tokens = followers
      .map(f => f.user.pushToken)
      .filter((t): t is string => !!t && Expo.isExpoPushToken(t));

    if (!tokens.length) {
      return res.json({ sent: 0, tokens: 0 });
    }

    const messages = tokens.map(token => ({
      to: token,
      sound: 'default' as const,
      title,
      body,
    }));

    const chunks = expo.chunkPushNotifications(messages);
    let sent = 0;

    for (const chunk of chunks) {
      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        sent += tickets.length;
      } catch (e) {
        console.error('Expo push error', e);
      }
    }

    res.json({ sent, tokens: tokens.length, teamId });
  }
);

export default router;