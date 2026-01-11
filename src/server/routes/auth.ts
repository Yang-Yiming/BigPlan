import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { users } from '../../db/schema/users';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';
import type { DbClient } from '../../db/client';

export const authRoutes = new Hono<{
  Variables: {
    db: DbClient;
    user?: { userId: number; username: string };
  };
}>();

// POST /api/auth/register
authRoutes.post('/register', async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }

    if (username.length < 3) {
      return c.json({ error: 'Username must be at least 3 characters' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    const db = c.get('db');

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return c.json({ error: 'Username already exists' }, 409);
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        username,
        passwordHash,
      })
      .returning({
        id: users.id,
        username: users.username,
        createdAt: users.createdAt,
      });

    const token = signToken({
      userId: newUser.id,
      username: newUser.username,
    });

    return c.json(
      {
        message: 'User registered successfully',
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          createdAt: newUser.createdAt,
        },
      },
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/auth/login
authRoutes.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }

    const db = c.get('db');

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return c.json({ error: 'Invalid username or password' }, 401);
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return c.json({ error: 'Invalid username or password' }, 401);
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
    });

    return c.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/auth/me
authRoutes.get('/me', authMiddleware, async (c) => {
  try {
    const userPayload = c.get('user');

    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const db = c.get('db');

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userPayload.userId))
      .limit(1);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
