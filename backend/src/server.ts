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
import venuesRouter from './routes/venues.js';
import notificationsRouter from './routes/notifications.js';

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
app.use('/venues', venuesRouter);
app.use('/notifications', notificationsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

export default app;