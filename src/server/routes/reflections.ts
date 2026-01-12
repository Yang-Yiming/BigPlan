import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { kissReflections } from '../../db/schema/kiss-reflections';
import { tasks } from '../../db/schema/tasks';
import { authMiddleware } from '../middleware/auth';
import type { DbClient } from '../../db/client';

export const reflectionRoutes = new Hono<{
  Variables: {
    db: DbClient;
    user?: { userId: number; username: string };
  };
}>();

// 所有复盘相关接口都需要认证
reflectionRoutes.use('*', authMiddleware);

// 检查复盘是否可以解锁
async function checkReflectionUnlocked(
  db: DbClient,
  userId: number,
  date: string
): Promise<{ unlocked: boolean; reason?: string }> {
  // 获取当前日期 (YYYY-MM-DD)
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];

  // 如果是查看未来日期的复盘，不允许
  if (date > currentDate) {
    return {
      unlocked: false,
      reason: 'Cannot create reflection for future dates',
    };
  }

  // 如果是当天之前的日期，总是解锁（可以回顾历史）
  if (date < currentDate) {
    return { unlocked: true };
  }

  // 对于当天日期，检查两个条件之一：
  // 1. 当天所有任务都已完成
  // 2. 当天已经结束（现在时间 >= 23:59）

  // 检查是否当天已结束（简化为检查小时是否 >= 23）
  const currentHour = now.getHours();
  if (currentHour >= 23) {
    return { unlocked: true, reason: 'Day has ended' };
  }

  // 检查当天任务是否全部完成
  const todayTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.date, date)));

  if (todayTasks.length === 0) {
    // 如果没有任务，允许创建复盘
    return { unlocked: true, reason: 'No tasks for the day' };
  }

  // 检查所有任务是否完成
  const allTasksCompleted = todayTasks.every((task: any) => {
    if (task.progressType === 'boolean') {
      return task.progressValue === 1;
    } else if (task.progressType === 'numeric' || task.progressType === 'percentage') {
      return task.maxProgress !== null && task.progressValue >= task.maxProgress;
    }
    return false;
  });

  if (allTasksCompleted) {
    return { unlocked: true, reason: 'All tasks completed' };
  }

  return {
    unlocked: false,
    reason: 'Not all tasks are completed and day has not ended yet',
  };
}

// POST /api/reflections - 创建/更新 KISS 复盘
reflectionRoutes.post('/', async (c) => {
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

    // 检查复盘是否解锁
    const unlockStatus = await checkReflectionUnlocked(db, userPayload.userId, date);
    if (!unlockStatus.unlocked) {
      return c.json(
        {
          error: 'Reflection is locked',
          reason: unlockStatus.reason,
        },
        403
      );
    }

    // 检查是否已存在该日期的复盘
    const [existingReflection] = await db
      .select()
      .from(kissReflections)
      .where(
        and(
          eq(kissReflections.userId, userPayload.userId),
          eq(kissReflections.date, date)
        )
      )
      .limit(1);

    let reflection;
    if (existingReflection) {
      // 更新现有复盘
      [reflection] = await db
        .update(kissReflections)
        .set({
          keep,
          improve,
          start,
          stop,
        })
        .where(
          and(
            eq(kissReflections.userId, userPayload.userId),
            eq(kissReflections.date, date)
          )
        )
        .returning();

      return c.json({
        message: 'Reflection updated successfully',
        reflection,
      });
    } else {
      // 创建新复盘
      [reflection] = await db
        .insert(kissReflections)
        .values({
          userId: userPayload.userId,
          date,
          keep,
          improve,
          start,
          stop,
        })
        .returning();

      return c.json(
        {
          message: 'Reflection created successfully',
          reflection,
        },
        201
      );
    }
  } catch (error) {
    console.error('Create/update reflection error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/reflections?date=YYYY-MM-DD - 获取指定日期的复盘
reflectionRoutes.get('/', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const date = c.req.query('date');
    if (!date) {
      return c.json({ error: 'Date parameter is required' }, 400);
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
    }

    const db = c.get('db');

    const [reflection] = await db
      .select()
      .from(kissReflections)
      .where(
        and(
          eq(kissReflections.userId, userPayload.userId),
          eq(kissReflections.date, date)
        )
      )
      .limit(1);

    // 检查复盘是否解锁
    const unlockStatus = await checkReflectionUnlocked(db, userPayload.userId, date);

    return c.json({
      reflection: reflection || null,
      unlocked: unlockStatus.unlocked,
      unlockReason: unlockStatus.reason,
    });
  } catch (error) {
    console.error('Get reflection error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/reflections/user/:userId?date=YYYY-MM-DD - 获取其他用户的复盘（群组功能）
reflectionRoutes.get('/user/:userId', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const targetUserId = parseInt(c.req.param('userId'));
    if (isNaN(targetUserId)) {
      return c.json({ error: 'Invalid user ID' }, 400);
    }

    const date = c.req.query('date');
    if (!date) {
      return c.json({ error: 'Date parameter is required' }, 400);
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
    }

    const db = c.get('db');

    // TODO: 在未来可以添加群组成员验证逻辑
    // 现在先简单实现：任何登录用户都可以查看其他用户的复盘
    // 后续可以添加：
    // 1. 检查是否在同一个群组
    // 2. 检查目标用户的 show_kiss 设置

    const [reflection] = await db
      .select()
      .from(kissReflections)
      .where(
        and(
          eq(kissReflections.userId, targetUserId),
          eq(kissReflections.date, date)
        )
      )
      .limit(1);

    if (!reflection) {
      return c.json({
        reflection: null,
        message: 'No reflection found for this user on this date',
      });
    }

    return c.json({
      reflection,
    });
  } catch (error) {
    console.error('Get user reflection error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
