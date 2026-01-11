import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createLocalDb } from '../db/client';
import type { DbClient } from '../db/client';
import { authRoutes } from './routes/auth';
import { taskRoutes } from './routes/tasks';
import { reflectionRoutes } from './routes/reflections';
import { kissRoutes } from './routes/kiss';
import { groupRoutes } from './routes/groups';

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
app.route('/api/tasks', taskRoutes);
app.route('/api/reflections', reflectionRoutes);
app.route('/api/kiss', kissRoutes);
app.route('/api/groups', groupRoutes);

export default app;
