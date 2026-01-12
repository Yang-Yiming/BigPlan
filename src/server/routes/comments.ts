import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { comments } from '../../db/schema/comments';
import { groupMembers } from '../../db/schema/group-members';
import { tasks } from '../../db/schema/tasks';
import { users } from '../../db/schema/users';
import { authMiddleware } from '../middleware/auth';
import type { DbClient } from '../../db/client';

export const commentRoutes = new Hono<{
  Variables: {
    db: DbClient;
    user?: { userId: number; username: string };
  };
}>();

// 所有评论相关接口都需要认证
commentRoutes.use('*', authMiddleware);

// 检查两个用户是否在同一个群组
async function checkSharedGroupMembership(
  db: DbClient,
  userId1: number,
  userId2: number
): Promise<boolean> {
  const user1Groups = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, userId1));

  const user2Groups = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, userId2));

  const user1GroupIds = new Set(user1Groups.map((g) => g.groupId));
  const hasSharedGroup = user2Groups.some((g) => user1GroupIds.has(g.groupId));

  return hasSharedGroup;
}

// POST /api/comments - 创建评论（支持任务评论和全天评论）
commentRoutes.post('/', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { targetUserId, taskId, date, content, isDailyComment } = body;

    // 验证必填字段
    if (
      targetUserId === undefined ||
      typeof targetUserId !== 'number' ||
      targetUserId <= 0
    ) {
      return c.json({ error: 'Valid targetUserId is required' }, 400);
    }

    if (!date || typeof date !== 'string') {
      return c.json({ error: 'Date is required' }, 400);
    }

    // 验证日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return c.json({ error: 'Comment content is required' }, 400);
    }

    if (content.trim().length > 1000) {
      return c.json({ error: 'Comment must be less than 1000 characters' }, 400);
    }

    if (isDailyComment !== undefined && typeof isDailyComment !== 'boolean') {
      return c.json({ error: 'isDailyComment must be a boolean' }, 400);
    }

    const db = c.get('db');

    // 验证目标用户存在
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (!targetUser) {
      return c.json({ error: 'Target user not found' }, 404);
    }

    // 验证权限：只能评论群组成员
    const hasSharedGroup = await checkSharedGroupMembership(
      db,
      userPayload.userId,
      targetUserId
    );

    if (!hasSharedGroup) {
      return c.json(
        { error: 'You can only comment on users in your groups' },
        403
      );
    }

    // 如果是任务评论，验证任务存在且属于目标用户
    if (taskId !== undefined && taskId !== null) {
      if (typeof taskId !== 'number' || taskId <= 0) {
        return c.json({ error: 'Invalid taskId' }, 400);
      }

      const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

      if (!task) {
        return c.json({ error: 'Task not found' }, 404);
      }

      if (task.userId !== targetUserId) {
        return c.json({ error: 'Task does not belong to target user' }, 400);
      }

      if (task.date !== date) {
        return c.json({ error: 'Task date does not match comment date' }, 400);
      }
    }

    // 创建评论
    const [newComment] = await db
      .insert(comments)
      .values({
        userId: userPayload.userId,
        targetUserId,
        taskId: taskId || null,
        date,
        content: content.trim(),
        isDailyComment: isDailyComment || false,
      })
      .returning();

    // 获取评论者用户信息
    const [commenter] = await db
      .select({
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, userPayload.userId))
      .limit(1);

    return c.json(
      {
        comment: {
          ...newComment,
          user: commenter,
        },
      },
      201
    );
  } catch (error) {
    console.error('Create comment error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/comments/task/:taskId - 获取任务评论
commentRoutes.get('/task/:taskId', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const taskId = parseInt(c.req.param('taskId'));
    if (isNaN(taskId)) {
      return c.json({ error: 'Invalid task ID' }, 400);
    }

    const db = c.get('db');

    // 验证任务存在
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);

    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    // 验证权限：只能查看群组成员的任务评论
    const hasSharedGroup = await checkSharedGroupMembership(
      db,
      userPayload.userId,
      task.userId
    );

    if (!hasSharedGroup && task.userId !== userPayload.userId) {
      return c.json(
        { error: 'You can only view comments for users in your groups' },
        403
      );
    }

    // 获取任务评论
    const taskComments = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        targetUserId: comments.targetUserId,
        taskId: comments.taskId,
        date: comments.date,
        content: comments.content,
        isDailyComment: comments.isDailyComment,
        createdAt: comments.createdAt,
        // 用户信息
        userUsername: users.username,
        userAvatarUrl: users.avatarUrl,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.taskId, taskId));

    // 格式化为包含嵌套 user 对象的结构
    const formattedComments = taskComments.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      targetUserId: comment.targetUserId,
      taskId: comment.taskId,
      date: comment.date,
      content: comment.content,
      isDailyComment: comment.isDailyComment,
      createdAt: comment.createdAt,
      user: {
        id: comment.userId,
        username: comment.userUsername,
        avatarUrl: comment.userAvatarUrl,
      },
    }));

    return c.json({ comments: formattedComments });
  } catch (error) {
    console.error('Get task comments error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/comments/daily?userId=xxx&date=YYYY-MM-DD - 获取全天评论
commentRoutes.get('/daily', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const targetUserIdParam = c.req.query('userId');
    const date = c.req.query('date');

    // 验证参数
    if (!targetUserIdParam) {
      return c.json({ error: 'userId parameter is required' }, 400);
    }

    const targetUserId = parseInt(targetUserIdParam);
    if (isNaN(targetUserId)) {
      return c.json({ error: 'Invalid userId' }, 400);
    }

    if (!date) {
      return c.json({ error: 'date parameter is required' }, 400);
    }

    // 验证日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
    }

    const db = c.get('db');

    // 验证权限：只能查看群组成员的全天评论
    const hasSharedGroup = await checkSharedGroupMembership(
      db,
      userPayload.userId,
      targetUserId
    );

    if (!hasSharedGroup && targetUserId !== userPayload.userId) {
      return c.json(
        { error: 'You can only view comments for users in your groups' },
        403
      );
    }

    // 获取全天评论
    const dailyComments = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        targetUserId: comments.targetUserId,
        taskId: comments.taskId,
        date: comments.date,
        content: comments.content,
        isDailyComment: comments.isDailyComment,
        createdAt: comments.createdAt,
        // 用户信息
        userUsername: users.username,
        userAvatarUrl: users.avatarUrl,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(
        and(
          eq(comments.targetUserId, targetUserId),
          eq(comments.date, date),
          eq(comments.isDailyComment, true)
        )
      );

    // 格式化为包含嵌套 user 对象的结构
    const formattedComments = dailyComments.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      targetUserId: comment.targetUserId,
      taskId: comment.taskId,
      date: comment.date,
      content: comment.content,
      isDailyComment: comment.isDailyComment,
      createdAt: comment.createdAt,
      user: {
        id: comment.userId,
        username: comment.userUsername,
        avatarUrl: comment.userAvatarUrl,
      },
    }));

    return c.json({ comments: formattedComments });
  } catch (error) {
    console.error('Get daily comments error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /api/comments/:id - 删除评论
commentRoutes.delete('/:id', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const commentId = parseInt(c.req.param('id'));
    if (isNaN(commentId)) {
      return c.json({ error: 'Invalid comment ID' }, 400);
    }

    const db = c.get('db');

    // 验证评论存在
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }

    // 验证权限：只能删除自己的评论
    if (comment.userId !== userPayload.userId) {
      return c.json({ error: 'You can only delete your own comments' }, 403);
    }

    // 删除评论
    await db.delete(comments).where(eq(comments.id, commentId));

    return c.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
