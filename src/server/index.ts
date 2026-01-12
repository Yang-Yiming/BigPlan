import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createLocalDb, createD1Db } from '../db/client';
import type { DbClient } from '../db/client';
import { authRoutes } from './routes/auth';
import { taskRoutes } from './routes/tasks';
import { reflectionRoutes } from './routes/reflections';
import { kissRoutes } from './routes/kiss';
import { groupRoutes } from './routes/groups';
import { commentRoutes } from './routes/comments';

// Define D1Database type locally to avoid dependency issues
interface D1Database {
  prepare(query: string): any;
  dump(): Promise<ArrayBuffer>;
  batch(statements: any[]): Promise<any[]>;
  exec(query: string): Promise<any>;
}

type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
};

const app = new Hono<{
  Bindings: Bindings;
  Variables: {
    db: DbClient;
  };
}>();

app.use('*', logger());

app.use('*', async (c, next) => {
  // Use D1 if available (Cloudflare environment), otherwise fallback to local SQLite
  if (c.env.DB) {
    c.set('db', createD1Db(c.env.DB));
  } else {
    c.set('db', await createLocalDb());
  }
  await next();
});

// Parse CORS origins
app.use(
  '/api/*',
  async (c, next) => {
    const originStr = c.env.CORS_ORIGIN || (process.env.CORS_ORIGIN as string);
    const allowedOrigins = originStr
      ? originStr.split(',').map((origin: string) => origin.trim())
      : ['http://localhost:5173', 'http://localhost:3000'];

    const corsMiddleware = cors({
      origin: allowedOrigins,
      credentials: true,
    });
    return corsMiddleware(c, next);
  }
);

// API Routes
app.get('/api', (c) => {
  return c.json({ message: 'BigPlans API Server' });
});

app.route('/api/auth', authRoutes);
app.route('/api/tasks', taskRoutes);
app.route('/api/reflections', reflectionRoutes);
app.route('/api/kiss', kissRoutes);
app.route('/api/groups', groupRoutes);
app.route('/api/comments', commentRoutes);

// Export for Cloudflare Workers
export default app;
