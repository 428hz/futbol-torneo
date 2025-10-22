#!/usr/bin/env bash
set -euo pipefail

# .env (edítalo luego con tus IDs de Google)
cat > backend/.env <<'EOF'
DATABASE_URL="mysql://app:app123@localhost:3306/futbol_torneo"
JWT_SECRET="supersecret"
PORT=4000
GOOGLE_CLIENT_IDS="YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com,YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com,YOUR_IOS_CLIENT_ID.apps.googleusercontent.com,YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"
EXPO_ACCESS_TOKEN=""
EOF

# package.json
cat > backend/package.json <<'EOF'
{
  "name": "futbol-torneo-backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.19.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "google-auth-library": "^9.14.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0"
  },
  "devDependencies": {
    "prisma": "^5.19.0",
    "ts-node": "^10.9.2",
    "tslib": "^2.6.2",
    "tsx": "^4.19.0",
    "typescript": "^5.6.3"
  }
}
EOF

# tsconfig.json
cat > backend/tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "Node",
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src", "prisma/seed.ts"]
}
EOF

# prisma/schema.prisma
cat > backend/prisma/schema.prisma <<'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum Role {
  admin
  player
  fan
}

enum MatchStatus {
  scheduled
  finished
}

enum EventType {
  goal
  yellow
  red
}

model User {
  id          Int      @id @default(autoincrement())
  name        String
  email       String   @unique
  password    String?
  role        Role     @default(fan)
  team        Team?    @relation(fields: [teamId], references: [id])
  teamId      Int?
  pushToken   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  followers   Follower[]
}

model Team {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  crestUrl  String?
  players   Player[]
  homeMatches Match[] @relation("HomeTeam")
  awayMatches Match[] @relation("AwayTeam")
  followers Follower[]
}

model Player {
  id           Int      @id @default(autoincrement())
  firstName    String
  lastName     String
  age          Int
  position     String
  jerseyNumber Int
  photoUrl     String?
  team         Team     @relation(fields: [teamId], references: [id])
  teamId       Int
  events       MatchEvent[]
}

model Venue {
  id        Int      @id @default(autoincrement())
  name      String
  address   String?
  latitude  Float
  longitude Float
  matches   Match[]
}

model Match {
  id           Int          @id @default(autoincrement())
  homeTeam     Team         @relation("HomeTeam", fields: [homeTeamId], references: [id])
  homeTeamId   Int
  awayTeam     Team         @relation("AwayTeam", fields: [awayTeamId], references: [id])
  awayTeamId   Int
  venue        Venue        @relation(fields: [venueId], references: [id])
  venueId      Int
  datetime     DateTime
  status       MatchStatus  @default(scheduled)
  homeScore    Int          @default(0)
  awayScore    Int          @default(0)
  events       MatchEvent[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

model MatchEvent {
  id        Int       @id @default(autoincrement())
  match     Match     @relation(fields: [matchId], references: [id])
  matchId   Int
  team      Team      @relation(fields: [teamId], references: [id])
  teamId    Int
  player    Player?   @relation(fields: [playerId], references: [id])
  playerId  Int?
  minute    Int
  type      EventType
  notes     String?
  createdAt DateTime  @default(now())
}

model Follower {
  id      Int  @id @default(autoincrement())
  user    User @relation(fields: [userId], references: [id])
  userId  Int
  team    Team @relation(fields: [teamId], references: [id])
  teamId  Int

  @@unique([userId, teamId])
}
EOF

# prisma/seed.ts
cat > backend/prisma/seed.ts <<'EOF'
import { prisma } from '../src/lib/prisma.js';

async function main() {
  const a = await prisma.team.upsert({
    where: { name: 'Leones FC' },
    update: {},
    create: { name: 'Leones FC', crestUrl: '' }
  });
  const b = await prisma.team.upsert({
    where: { name: 'Tigres United' },
    update: {},
    create: { name: 'Tigres United', crestUrl: '' }
  });

  await prisma.player.createMany({
    data: [
      { firstName: 'Juan', lastName: 'Pérez', age: 24, position: 'Delantero', jerseyNumber: 9, teamId: a.id },
      { firstName: 'Luis', lastName: 'Gómez', age: 27, position: 'Mediocampista', jerseyNumber: 8, teamId: a.id },
      { firstName: 'Carlos', lastName: 'Díaz', age: 22, position: 'Defensor', jerseyNumber: 4, teamId: b.id }
    ],
    skipDuplicates: true
  });

  const v = await prisma.venue.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Estadio Central', address: 'Av. Siempre Viva 123', latitude: -34.6037, longitude: -58.3816 }
  });

  await prisma.match.create({
    data: {
      homeTeamId: a.id,
      awayTeamId: b.id,
      venueId: v.id,
      datetime: new Date(Date.now() + 1000 * 60 * 60 * 24)
    }
  });
}

main().then(() => {
  console.log('Seed done');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
EOF

# src/index.ts
cat > backend/src/index.ts <<'EOF'
import 'dotenv/config';
import app from './server.js';

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
EOF

# src/server.ts
cat > backend/src/server.ts <<'EOF'
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import authRouter from './routes/auth.js';
import teamsRouter from './routes/teams.js';
import playersRouter from './routes/players.js';
import playersUploadRouter from './routes/players-upload.js';
import matchesRouter from './routes/matches.js';
import usersRouter from './routes/users.js';
import statsRouter from './routes/stats.js';

const app = express();
app.use(cors());
app.use(express.json());

const uploadDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));
const upload = multer({ dest: uploadDir });
app.set('upload', upload);

app.get('/', (_req, res) => res.json({ ok: true, name: 'Futbol Torneo API' }));

app.use('/auth', authRouter);
app.use('/teams', teamsRouter);
app.use('/players', playersRouter);
app.use('/players', playersUploadRouter);
app.use('/matches', matchesRouter);
app.use('/users', usersRouter);
app.use('/stats', statsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

export default app;
EOF

# src/lib/prisma.ts
cat > backend/src/lib/prisma.ts <<'EOF'
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
EOF

# src/middleware/auth.ts
cat > backend/src/middleware/auth.ts <<'EOF'
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: number; role: string; teamId?: number | null };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = hdr.substring(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = { id: payload.id, role: payload.role, teamId: payload.teamId ?? null };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
EOF

# src/routes/auth.ts
cat > backend/src/routes/auth.ts <<'EOF'
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

export default router;
EOF

# src/routes/teams.ts
cat > backend/src/routes/teams.ts <<'EOF'
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
  const id = Number(req.params.id);
  await prisma.team.delete({ where: { id } });
  res.status(204).send();
});

export default router;
EOF

# src/routes/players.ts
cat > backend/src/routes/players.ts <<'EOF'
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  const players = await prisma.player.findMany({ include: { team: true } });
  res.json(players);
});

router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
  const { firstName, lastName, age, position, jerseyNumber, teamId, photoUrl } = req.body;
  const player = await prisma.player.create({
    data: { firstName, lastName, age, position, jerseyNumber, teamId, photoUrl }
  });
  res.status(201).json(player);
});

router.put('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  const player = await prisma.player.update({ where: { id }, data: req.body });
  res.json(player);
});

router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  await prisma.player.delete({ where: { id } });
  res.status(204).send();
});

export default router;
EOF

# src/routes/matches.ts
cat > backend/src/routes/matches.ts <<'EOF'
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/upcoming', async (_req, res) => {
  const now = new Date();
  const matches = await prisma.match.findMany({
    where: { datetime: { gte: now } },
    include: { homeTeam: true, awayTeam: true, venue: true },
    orderBy: { datetime: 'asc' }
  });
  res.json(matches);
});

router.get('/', async (_req, res) => {
  const matches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true, venue: true },
    orderBy: { datetime: 'asc' }
  });
  res.json(matches);
});

router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
  const { homeTeamId, awayTeamId, venueId, datetime } = req.body;
  const match = await prisma.match.create({
    data: { homeTeamId, awayTeamId, venueId, datetime: new Date(datetime) }
  });
  res.status(201).json(match);
});

router.post('/:id/events', requireAuth, requireRole(['admin']), async (req, res) => {
  const matchId = Number(req.params.id);
  const { teamId, playerId, minute, type, notes } = req.body;
  const event = await prisma.matchEvent.create({
    data: { matchId, teamId, playerId, minute, type, notes }
  });

  if (type === 'goal') {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (match) {
      const homeGoal = teamId === match.homeTeamId ? 1 : 0;
      const awayGoal = teamId === match.awayTeamId ? 1 : 0;
      await prisma.match.update({
        where: { id: matchId },
        data: { homeScore: match.homeScore + homeGoal, awayScore: match.awayScore + awayGoal }
      });
    }
  }
  res.status(201).json(event);
});

router.post('/:id/finish', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  const match = await prisma.match.update({ where: { id }, data: { status: 'finished' } });
  res.json(match);
});

export default router;
EOF

# src/routes/users.ts
cat > backend/src/routes/users.ts <<'EOF'
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole(['admin']), async (_req, res) => {
  const users = await prisma.user.findMany({ include: { team: true } });
  res.json(users);
});

router.put('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.update({ where: { id }, data: req.body });
  res.json(user);
});

router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  await prisma.user.delete({ where: { id } });
  res.status(204).send();
});

export default router;
EOF

# src/routes/stats.ts
cat > backend/src/routes/stats.ts <<'EOF'
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

export default router;
EOF

# src/routes/players-upload.ts
cat > backend/src/routes/players-upload.ts <<'EOF'
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
EOF

echo "Backend files written."