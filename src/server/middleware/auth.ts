import type { Context, Next } from 'hono';
import { verifyToken } from '../utils/jwt';
import type { JwtPayload } from '../utils/jwt';

export interface AuthContext {
  user: JwtPayload;
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
}
