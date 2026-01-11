import { Hono } from 'hono';
import type { AppContext } from '../types';

const router = new Hono<AppContext>();

router.get('/', (c) => {
  return c.json({ message: 'Health check OK' });
});

export default router;
