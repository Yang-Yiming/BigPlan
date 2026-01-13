import { Hono } from 'hono';
import { eq, and, sql } from 'drizzle-orm';
import { tasks } from '../../db/schema/tasks';
import { authMiddleware } from '../middleware/auth';
import type { DbClient } from '../../db/client';
import {
  generateRecurringTasksForDate,
  generateInitialInstances,
} from '../utils/recurring-tasks';

export const taskRoutes = new Hono<{
  Variables: {
    db: DbClient;
    user?: { userId: number; username: string };
  };
}>();

// 所有任务相关接口都需要认证
taskRoutes.use('*', authMiddleware);

// POST /api/tasks - 创建任务
taskRoutes.post('/', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const {
      title,
      description,
      date,
      progressType = 'boolean',
      progressValue = 0,
      maxProgress,
      isRecurring = false,
      recurrencePattern,
      maxOccurrences,
    } = body;

    // 验证必填字段
    if (!title || !date) {
      return c.json({ error: 'Title and date are required' }, 400);
    }

    // 验证日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
    }

    // 验证进度类型
    const validProgressTypes = ['boolean', 'numeric', 'percentage'];
    if (!validProgressTypes.includes(progressType)) {
      return c.json(
        {
          error: `Invalid progressType. Must be one of: ${validProgressTypes.join(', ')}`,
        },
        400
      );
    }

    // 验证周期性任务的配置
    if (isRecurring && !recurrencePattern) {
      return c.json(
        { error: 'Recurrence pattern is required for recurring tasks' },
        400
      );
    }

    if (recurrencePattern) {
      try {
        const pattern = JSON.parse(recurrencePattern);
        if (
          !pattern.frequency ||
          !['daily', 'weekly', 'monthly'].includes(pattern.frequency)
        ) {
          return c.json(
            {
              error:
                'Invalid recurrence pattern. Frequency must be daily, weekly, or monthly',
            },
            400
          );
        }
        if (!pattern.interval || pattern.interval < 1) {
          return c.json(
            { error: 'Recurrence interval must be at least 1' },
            400
          );
        }

        // Add maxOccurrences to pattern if provided
        if (maxOccurrences !== undefined && maxOccurrences !== null) {
          pattern.maxOccurrences = maxOccurrences;
          body.recurrencePattern = JSON.stringify(pattern);
        }
      } catch {
        return c.json(
          { error: 'Invalid recurrence pattern JSON format' },
          400
        );
      }
    }

    const db = c.get('db');

    const [newTask] = await db
      .insert(tasks)
      .values({
        userId: userPayload.userId,
        title,
        description,
        date,
        progressType,
        progressValue,
        maxProgress,
        isRecurring,
        recurrencePattern: body.recurrencePattern || recurrencePattern,
        parentTaskId: null, // This is a template task
      })
      .returning();

    // If recurring, generate initial 30-day batch
    if (isRecurring) {
      await generateInitialInstances(db, newTask.id);
    }

    return c.json(
      {
        message: 'Task created successfully',
        task: newTask,
      },
      201
    );
  } catch (error) {
    console.error('Create task error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/tasks?date=YYYY-MM-DD - 获取指定日期的任务列表
taskRoutes.get('/', async (c) => {
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

    // Generate missing recurring tasks for this date (on-demand generation)
    await generateRecurringTasksForDate(db, userPayload.userId, date);

    const taskList = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userPayload.userId), eq(tasks.date, date)))
      .orderBy(tasks.createdAt);

    return c.json({ tasks: taskList });
  } catch (error) {
    console.error('Get tasks error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/users/:userId/tasks - 获取指定用户的任务列表（用于群组成员查看）
taskRoutes.get('/users/:userId/tasks', async (c) => {
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
    // 现在先简单实现:任何登录用户都可以查看其他用户的任务

    // Generate missing recurring tasks for this date (on-demand generation)
    await generateRecurringTasksForDate(db, targetUserId, date);

    const taskList = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, targetUserId), eq(tasks.date, date)))
      .orderBy(tasks.createdAt);

    return c.json({ tasks: taskList });
  } catch (error) {
    console.error('Get user tasks error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/tasks/recurring - 获取所有周期性任务
taskRoutes.get('/recurring', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const db = c.get('db');

    const recurringTasks = await db
      .select()
      .from(tasks)
      .where(
        and(eq(tasks.userId, userPayload.userId), eq(tasks.isRecurring, true))
      )
      .orderBy(tasks.createdAt);

    return c.json({ tasks: recurringTasks });
  } catch (error) {
    console.error('Get recurring tasks error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /api/tasks/:id - 更新任务（包括进度）
taskRoutes.put('/:id', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const taskId = parseInt(c.req.param('id'));
    if (isNaN(taskId)) {
      return c.json({ error: 'Invalid task ID' }, 400);
    }

    const db = c.get('db');

    // 检查任务是否存在且属于当前用户
    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userPayload.userId)))
      .limit(1);

    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const body = await c.req.json();
    const {
      title,
      description,
      date,
      progressType,
      progressValue,
      maxProgress,
      isRecurring,
      recurrencePattern,
    } = body;

    // 验证日期格式（如果提供）
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
      }
    }

    // 验证进度类型（如果提供）
    if (progressType) {
      const validProgressTypes = ['boolean', 'numeric', 'percentage'];
      if (!validProgressTypes.includes(progressType)) {
        return c.json(
          {
            error: `Invalid progressType. Must be one of: ${validProgressTypes.join(', ')}`,
          },
          400
        );
      }
    }

    // 验证周期性任务配置（如果提供）
    if (recurrencePattern) {
      try {
        const pattern = JSON.parse(recurrencePattern);
        if (
          !pattern.frequency ||
          !['daily', 'weekly', 'monthly'].includes(pattern.frequency)
        ) {
          return c.json(
            {
              error:
                'Invalid recurrence pattern. Frequency must be daily, weekly, or monthly',
            },
            400
          );
        }
        if (!pattern.interval || pattern.interval < 1) {
          return c.json(
            { error: 'Recurrence interval must be at least 1' },
            400
          );
        }
      } catch {
        return c.json(
          { error: 'Invalid recurrence pattern JSON format' },
          400
        );
      }
    }

    // 构建更新对象（只更新提供的字段）
    const updateData: any = {
      updatedAt: sql`(unixepoch())`,
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;
    if (progressType !== undefined) updateData.progressType = progressType;
    if (progressValue !== undefined) updateData.progressValue = progressValue;
    if (maxProgress !== undefined) updateData.maxProgress = maxProgress;
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    if (recurrencePattern !== undefined)
      updateData.recurrencePattern = recurrencePattern;

    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userPayload.userId)))
      .returning();

    return c.json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PATCH /api/tasks/:id/progress - 更新任务进度
taskRoutes.patch('/:id/progress', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const taskId = parseInt(c.req.param('id'));
    if (isNaN(taskId)) {
      return c.json({ error: 'Invalid task ID' }, 400);
    }

    const db = c.get('db');

    // 检查任务是否存在且属于当前用户
    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userPayload.userId)))
      .limit(1);

    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const body = await c.req.json();
    const { progressValue } = body;

    if (progressValue === undefined || typeof progressValue !== 'number') {
      return c.json({ error: 'Progress value is required and must be a number' }, 400);
    }

    // 更新任务进度
    const [updatedTask] = await db
      .update(tasks)
      .set({
        progressValue,
        updatedAt: sql`(unixepoch())`,
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userPayload.userId)))
      .returning();

    return c.json({
      message: 'Task progress updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task progress error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /api/tasks/:id - 删除任务
taskRoutes.delete('/:id', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const taskId = parseInt(c.req.param('id'));
    if (isNaN(taskId)) {
      return c.json({ error: 'Invalid task ID' }, 400);
    }

    const db = c.get('db');

    // 检查任务是否存在且属于当前用户
    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userPayload.userId)))
      .limit(1);

    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userPayload.userId)));

    return c.json({
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/tasks/generate-recurring - 为指定日期生成周期性任务
taskRoutes.post('/generate-recurring', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { date } = body;

    if (!date) {
      return c.json({ error: 'Date is required' }, 400);
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
    }

    const db = c.get('db');

    const generatedTasks = await generateRecurringTasksForDate(
      db,
      userPayload.userId,
      date
    );

    return c.json({
      message: `Generated ${generatedTasks.length} recurring task(s)`,
      tasks: generatedTasks,
      count: generatedTasks.length,
    });
  } catch (error) {
    console.error('Generate recurring tasks error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
