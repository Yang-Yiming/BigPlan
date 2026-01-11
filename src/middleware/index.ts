import { Context, Next } from 'hono';
import { cors } from 'hono/cors';

export const corsMiddleware = cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
});

export const loggerMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  console.log(`${c.req.method} ${c.req.url} - ${c.res.status} (${end - start}ms)`);
};

export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      500
    );
  }
};
