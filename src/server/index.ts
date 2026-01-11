import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createLocalDb } from '../db/client';
import type { DbClient } from '../db/client';
import { authRoutes } from './routes/auth';

const app = new Hono<{
  Variables: {
    db: DbClient;
  };
}>();

app.use('*', logger());

app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

app.use('*', async (c, next) => {
  const db = createLocalDb();
  c.set('db', db);
  await next();
});

app.get('/', (c) => {
  return c.json({ message: 'BigPlans API Server' });
});

app.route('/api/auth', authRoutes);

export default app;
