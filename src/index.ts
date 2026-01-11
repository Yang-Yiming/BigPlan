import { Hono } from 'hono';
import type { AppContext } from './types';
import { initDB } from './db';
import { corsMiddleware, loggerMiddleware, errorHandler } from './middleware';
import healthRouter from './routes/health';

const app = new Hono<AppContext>();

// Global middleware
app.use('*', errorHandler);
app.use('*', corsMiddleware);
app.use('*', loggerMiddleware);

// Database initialization middleware
app.use('*', async (c, next) => {
  c.set('db', initDB(c.env.DB));
  await next();
});

// Routes
app.route('/health', healthRouter);

// Default route
app.get('/', (c) => {
  return c.json({
    message: 'BigPlans API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
    },
  });
});

export default app;
