import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { kissReflections } from '../../db/schema/kiss-reflections';
import { tasks } from '../../db/schema/tasks';
import { authMiddleware } from '../middleware/auth';
import type { DbClient } from '../../db/client';

export const kissRoutes = new Hono<{
  Variables: {
    db: DbClient;
    user?: { userId: number; username: string };
  };
}>();

// 所有 KISS 相关接口都需要认证
kissRoutes.use('*', authMiddleware);

// GET /api/kiss?date=YYYY-MM-DD - 获取指定日期的 KISS 复盘
kissRoutes.get('/', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const date = c.req.query('date');
    if (!date) {
      return c.json({ error: 'Date parameter is required' }, 400);
    }

    // 验证日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
    }

    const db = c.get('db');

    const reflection = await db
      .select()
      .from(kissReflections)
      .where(
        and(
          eq(kissReflections.userId, userPayload.userId),
          eq(kissReflections.date, date)
        )
      )
      .get();

    return c.json({ reflection: reflection || null });
  } catch (error) {
    console.error('Error fetching KISS reflection:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/kiss/check-unlock?date=YYYY-MM-DD - 检查指定日期的 KISS 复盘是否可以解锁
kissRoutes.get('/check-unlock', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const date = c.req.query('date');
    if (!date) {
      return c.json({ error: 'Date parameter is required' }, 400);
    }

    // 验证日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
    }

    const db = c.get('db');

    // 获取指定日期的所有任务
    const userTasks = await db
      .select()
      .from(tasks)
      .where(
        and(eq(tasks.userId, userPayload.userId), eq(tasks.date, date))
      )
      .all();

    // 计算任务完成情况
    let totalTasks = userTasks.length;
    let completedTasks = 0;

    for (const task of userTasks) {
      if (task.progressType === 'boolean') {
        if (task.progressValue === 1) {
          completedTasks++;
        }
      } else if (task.progressType === 'numeric') {
        if (task.maxProgress && task.progressValue >= task.maxProgress) {
          completedTasks++;
        }
      } else if (task.progressType === 'percentage') {
        if (task.progressValue >= 100) {
          completedTasks++;
        }
      }
    }

    // 解锁条件：
    // 1. 当天没有任务，自动解锁
    // 2. 所有任务都完成了
    // 3. 或者日期是今天之前的日期（允许补录）
    const today = new Date().toISOString().split('T')[0];
    const isBeforeToday = date < today;
    const isUnlocked =
      totalTasks === 0 || completedTasks === totalTasks || isBeforeToday;

    return c.json({
      isUnlocked,
      totalTasks,
      completedTasks,
      canRetroactivelyFill: isBeforeToday,
    });
  } catch (error) {
    console.error('Error checking KISS unlock status:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/kiss - 创建或更新 KISS 复盘
kissRoutes.post('/', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { date, keep, improve, start, stop } = body;

    // 验证必填字段
    if (!date) {
      return c.json({ error: 'Date is required' }, 400);
    }

    // 验证日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
    }

    const db = c.get('db');

    // 检查是否已经存在该日期的复盘
    const existing = await db
      .select()
      .from(kissReflections)
      .where(
        and(
          eq(kissReflections.userId, userPayload.userId),
          eq(kissReflections.date, date)
        )
      )
      .get();

    if (existing) {
      // 更新现有复盘
      const [updated] = await db
        .update(kissReflections)
        .set({
          keep: keep || null,
          improve: improve || null,
          start: start || null,
          stop: stop || null,
        })
        .where(eq(kissReflections.id, existing.id))
        .returning();

      return c.json({
        message: 'KISS reflection updated successfully',
        reflection: updated,
      });
    } else {
      // 创建新复盘
      const [newReflection] = await db
        .insert(kissReflections)
        .values({
          userId: userPayload.userId,
          date,
          keep: keep || null,
          improve: improve || null,
          start: start || null,
          stop: stop || null,
        })
        .returning();

      return c.json({
        message: 'KISS reflection created successfully',
        reflection: newReflection,
      });
    }
  } catch (error) {
    console.error('Error creating/updating KISS reflection:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /api/kiss/:id - 删除 KISS 复盘
kissRoutes.delete('/:id', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid ID' }, 400);
    }

    const db = c.get('db');

    // 检查复盘是否存在且属于当前用户
    const reflection = await db
      .select()
      .from(kissReflections)
      .where(eq(kissReflections.id, id))
      .get();

    if (!reflection) {
      return c.json({ error: 'KISS reflection not found' }, 404);
    }

    if (reflection.userId !== userPayload.userId) {
      return c.json({ error: 'Unauthorized to delete this reflection' }, 403);
    }

    await db.delete(kissReflections).where(eq(kissReflections.id, id));

    return c.json({ message: 'KISS reflection deleted successfully' });
  } catch (error) {
    console.error('Error deleting KISS reflection:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
