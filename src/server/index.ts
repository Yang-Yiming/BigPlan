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
const handler = {
  async fetch(request: Request, env: Bindings, ctx: any) {
    // 处理 API 请求
    if (new URL(request.url).pathname.startsWith('/api/')) {
      return app.fetch(request, env, ctx);
    }

    // 处理静态资源请求 (通过 env.ASSETS)
    try {
      // @ts-ignore - ASSETS binding provided by Cloudflare
      if (env.ASSETS) {
        // @ts-ignore
        const asset = await env.ASSETS.fetch(request);
        if (asset.status !== 404) return asset;
        
        // SPA Fallback: 如果资源没找到且不是 API，则返回 index.html
        // @ts-ignore
        return env.ASSETS.fetch(new URL('/index.html', request.url));
      }
    } catch (e) {
      console.error('Assets fetch error:', e);
    }
    
    return app.fetch(request, env, ctx);
  },
};

export { app };
export default handler;
