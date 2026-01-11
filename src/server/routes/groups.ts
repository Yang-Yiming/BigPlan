import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { groups } from '../../db/schema/groups';
import { groupMembers } from '../../db/schema/group-members';
import { users } from '../../db/schema/users';
import { tasks } from '../../db/schema/tasks';
import { authMiddleware } from '../middleware/auth';
import type { DbClient } from '../../db/client';

export const groupRoutes = new Hono<{
  Variables: {
    db: DbClient;
    user?: { userId: number; username: string };
  };
}>();

// 所有群组相关接口都需要认证
groupRoutes.use('*', authMiddleware);

// 生成唯一邀请码的辅助函数
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 检查用户是否是群组成员
async function checkGroupMembership(
  db: DbClient,
  groupId: number,
  userId: number
): Promise<boolean> {
  const [membership] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .limit(1);

  return !!membership;
}

// POST /api/groups - 创建群组（生成唯一邀请码）
groupRoutes.post('/', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { name } = body;

    // 验证必填字段
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return c.json({ error: 'Group name is required' }, 400);
    }

    if (name.trim().length > 100) {
      return c.json({ error: 'Group name must be less than 100 characters' }, 400);
    }

    const db = c.get('db');

    // 生成唯一邀请码
    let inviteCode = generateInviteCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const [existing] = await db
        .select()
        .from(groups)
        .where(eq(groups.inviteCode, inviteCode))
        .limit(1);

      if (!existing) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return c.json({ error: 'Failed to generate unique invite code' }, 500);
    }

    // 创建群组
    const [newGroup] = await db
      .insert(groups)
      .values({
        name: name.trim(),
        inviteCode,
      })
      .returning();

    // 自动将创建者添加为群组成员
    const [newMember] = await db
      .insert(groupMembers)
      .values({
        groupId: newGroup.id,
        userId: userPayload.userId,
        showKiss: true,
      })
      .returning();

    return c.json(
      {
        group: newGroup,
        member: newMember,
      },
      201
    );
  } catch (error) {
    console.error('Create group error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/groups/join - 通过邀请码加入群组
groupRoutes.post('/join', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { inviteCode } = body;

    // 验证必填字段
    if (!inviteCode || typeof inviteCode !== 'string') {
      return c.json({ error: 'Invite code is required' }, 400);
    }

    const db = c.get('db');

    // 查找群组
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.inviteCode, inviteCode.toUpperCase()))
      .limit(1);

    if (!group) {
      return c.json({ error: 'Invalid invite code' }, 404);
    }

    // 检查用户是否已经是成员
    const [existingMember] = await db
      .select()
      .from(groupMembers)
      .where(
        and(eq(groupMembers.groupId, group.id), eq(groupMembers.userId, userPayload.userId))
      )
      .limit(1);

    if (existingMember) {
      return c.json({ error: 'You are already a member of this group' }, 409);
    }

    // 添加用户为群组成员
    const [newMember] = await db
      .insert(groupMembers)
      .values({
        groupId: group.id,
        userId: userPayload.userId,
        showKiss: true,
      })
      .returning();

    return c.json(
      {
        group,
        member: newMember,
      },
      201
    );
  } catch (error) {
    console.error('Join group error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/groups - 获取用户所在的所有群组
groupRoutes.get('/', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const db = c.get('db');

    // 获取用户所在的所有群组
    const userGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        inviteCode: groups.inviteCode,
        createdAt: groups.createdAt,
        joinedAt: groupMembers.joinedAt,
        showKiss: groupMembers.showKiss,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userPayload.userId));

    return c.json({ groups: userGroups });
  } catch (error) {
    console.error('Get groups error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/groups/:id/members - 获取群组成员列表
groupRoutes.get('/:id/members', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const groupId = parseInt(c.req.param('id'));
    if (isNaN(groupId)) {
      return c.json({ error: 'Invalid group ID' }, 400);
    }

    const db = c.get('db');

    // 验证用户是否是群组成员
    const isMember = await checkGroupMembership(db, groupId, userPayload.userId);
    if (!isMember) {
      return c.json({ error: 'You are not a member of this group' }, 403);
    }

    // 获取群组成员列表
    const members = await db
      .select({
        id: groupMembers.id,
        userId: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
        joinedAt: groupMembers.joinedAt,
        showKiss: groupMembers.showKiss,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId));

    return c.json({ members });
  } catch (error) {
    console.error('Get group members error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /api/groups/:id/settings - 更新群组设置（如是否显示 KISS）
groupRoutes.put('/:id/settings', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const groupId = parseInt(c.req.param('id'));
    if (isNaN(groupId)) {
      return c.json({ error: 'Invalid group ID' }, 400);
    }

    const body = await c.req.json();
    const { showKiss } = body;

    // 验证字段
    if (showKiss !== undefined && typeof showKiss !== 'boolean') {
      return c.json({ error: 'showKiss must be a boolean' }, 400);
    }

    const db = c.get('db');

    // 验证用户是否是群组成员
    const isMember = await checkGroupMembership(db, groupId, userPayload.userId);
    if (!isMember) {
      return c.json({ error: 'You are not a member of this group' }, 403);
    }

    // 更新设置
    const updateData: any = {};
    if (showKiss !== undefined) {
      updateData.showKiss = showKiss;
    }

    if (Object.keys(updateData).length === 0) {
      return c.json({ error: 'No settings to update' }, 400);
    }

    const [updatedMember] = await db
      .update(groupMembers)
      .set(updateData)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userPayload.userId))
      )
      .returning();

    return c.json({ member: updatedMember });
  } catch (error) {
    console.error('Update group settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/groups/:id/member/:userId/tasks?date=YYYY-MM-DD - 获取群组成员任务
groupRoutes.get('/:id/member/:userId/tasks', async (c) => {
  try {
    const userPayload = c.get('user');
    if (!userPayload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const groupId = parseInt(c.req.param('id'));
    const targetUserId = parseInt(c.req.param('userId'));
    const date = c.req.query('date');

    // 验证参数
    if (isNaN(groupId)) {
      return c.json({ error: 'Invalid group ID' }, 400);
    }

    if (isNaN(targetUserId)) {
      return c.json({ error: 'Invalid user ID' }, 400);
    }

    if (!date) {
      return c.json({ error: 'Date parameter is required' }, 400);
    }

    // 验证日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
    }

    const db = c.get('db');

    // 验证请求用户是否是群组成员
    const isRequesterMember = await checkGroupMembership(db, groupId, userPayload.userId);
    if (!isRequesterMember) {
      return c.json({ error: 'You are not a member of this group' }, 403);
    }

    // 验证目标用户是否是群组成员
    const isTargetMember = await checkGroupMembership(db, groupId, targetUserId);
    if (!isTargetMember) {
      return c.json({ error: 'Target user is not a member of this group' }, 404);
    }

    // 获取目标用户在指定日期的任务
    const userTasks = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, targetUserId), eq(tasks.date, date)));

    return c.json({ tasks: userTasks });
  } catch (error) {
    console.error('Get group member tasks error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
