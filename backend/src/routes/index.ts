import { Router } from 'express';
import { prisma } from '../lib/prisma';

import auth from './auth';
import users from './users';
import teams from './teams';
import players from './players';
import matches from './matches';
import stats from './stats';
import venues from './venues';
import notifications from './notifications';
import playersUpload from './players-upload';
import matchEvents from './match-event'; // archivo singular

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    resources: [
      { path: '/auth/login', method: 'POST' },
      { path: '/users', method: 'GET' },
      { path: '/teams', method: 'GET' },
      { path: '/players', method: 'GET' },
      { path: '/matches', method: 'GET' },
      { path: '/matches/upcoming', method: 'GET' },
      { path: '/venues', method: 'GET' },
    ],
  });
});

router.use('/auth', auth);
router.use('/users', users);
router.use('/teams', teams);
router.use('/players', players);
router.use('/matches', matches);
router.use('/stats', stats);
router.use('/venues', venues);
router.use('/notifications', notifications);
router.use('/upload', playersUpload);

// Eventos bajo /matches/:id/events
router.use('/matches', matchEvents);

export default router;