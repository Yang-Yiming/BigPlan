/**
 * Database Usage Examples
 *
 * This file demonstrates how to use the database schema in your application.
 */

import { createLocalDb } from './src/db/client';
import {
  users,
  tasks,
  kissReflections,
  groups,
  groupMembers,
  comments,
  type User,
  type Task,
  type NewTask,
} from './src/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Initialize database
const db = createLocalDb();

// ============================================
// USER OPERATIONS
// ============================================

// Create a new user
async function createUser(username: string, passwordHash: string) {
  const [user] = await db
    .insert(users)
    .values({
      username,
      passwordHash,
      avatarUrl: null,
    })
    .returning();

  return user;
}

// Get user by username
async function getUserByUsername(username: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  return user;
}

// Update user avatar
async function updateUserAvatar(userId: number, avatarUrl: string) {
  await db
    .update(users)
    .set({ avatarUrl })
    .where(eq(users.id, userId));
}

// ============================================
// TASK OPERATIONS
// ============================================

// Create a new task
async function createTask(taskData: NewTask) {
  const [task] = await db
    .insert(tasks)
    .values(taskData)
    .returning();

  return task;
}

// Get tasks for a user on a specific date
async function getTasksForDate(userId: number, date: string) {
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.date, date)))
    .orderBy(desc(tasks.createdAt));
}

// Update task progress
async function updateTaskProgress(
  taskId: number,
  progressValue: number,
) {
  await db
    .update(tasks)
    .set({
      progressValue,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId));
}

// ============================================
// KISS REFLECTION OPERATIONS
// ============================================

// Create or update KISS reflection for a day
async function upsertKissReflection(
  userId: number,
  date: string,
  reflection: {
    keep?: string;
    improve?: string;
    start?: string;
    stop?: string;
  },
) {
  // Note: SQLite doesn't support upsert the same way as Postgres
  // For production, use proper upsert logic
  const [existing] = await db
    .select()
    .from(kissReflections)
    .where(
      and(
        eq(kissReflections.userId, userId),
        eq(kissReflections.date, date),
      ),
    );

  if (existing) {
    await db
      .update(kissReflections)
      .set(reflection)
      .where(eq(kissReflections.id, existing.id));
  } else {
    await db.insert(kissReflections).values({
      userId,
      date,
      ...reflection,
    });
  }
}

// Get KISS reflection for a date
async function getKissReflection(userId: number, date: string) {
  const [reflection] = await db
    .select()
    .from(kissReflections)
    .where(
      and(
        eq(kissReflections.userId, userId),
        eq(kissReflections.date, date),
      ),
    );

  return reflection;
}

// ============================================
// GROUP OPERATIONS
// ============================================

// Create a new group
async function createGroup(name: string, inviteCode: string) {
  const [group] = await db
    .insert(groups)
    .values({
      name,
      inviteCode,
    })
    .returning();

  return group;
}

// Join a group
async function joinGroup(
  userId: number,
  groupId: number,
  showKiss = true,
) {
  await db.insert(groupMembers).values({
    userId,
    groupId,
    showKiss,
  });
}

// Get user's groups
async function getUserGroups(userId: number) {
  return db
    .select({
      id: groups.id,
      name: groups.name,
      inviteCode: groups.inviteCode,
      joinedAt: groupMembers.joinedAt,
      showKiss: groupMembers.showKiss,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, userId));
}

// ============================================
// COMMENT OPERATIONS
// ============================================

// Add a comment to a task
async function addTaskComment(
  userId: number,
  targetUserId: number,
  taskId: number,
  content: string,
  date: string,
) {
  const [comment] = await db
    .insert(comments)
    .values({
      userId,
      targetUserId,
      taskId,
      content,
      date,
      isDailyComment: false,
    })
    .returning();

  return comment;
}

// Add a daily comment
async function addDailyComment(
  userId: number,
  targetUserId: number,
  content: string,
  date: string,
) {
  const [comment] = await db
    .insert(comments)
    .values({
      userId,
      targetUserId,
      taskId: null,
      content,
      date,
      isDailyComment: true,
    })
    .returning();

  return comment;
}

// Get comments for a user on a date
async function getCommentsForDate(
  targetUserId: number,
  date: string,
) {
  return db
    .select({
      id: comments.id,
      content: comments.content,
      isDailyComment: comments.isDailyComment,
      taskId: comments.taskId,
      createdAt: comments.createdAt,
      author: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(
      and(
        eq(comments.targetUserId, targetUserId),
        eq(comments.date, date),
      ),
    )
    .orderBy(desc(comments.createdAt));
}

// ============================================
// EXAMPLE USAGE
// ============================================

async function exampleUsage() {
  // Create a user
  const user = await createUser('john_doe', 'hashed_password');
  console.log('Created user:', user);

  // Create a task
  const task = await createTask({
    userId: user.id,
    title: 'Complete database schema',
    description: 'Design and implement all tables',
    date: '2024-01-11',
    progressType: 'boolean',
    progressValue: 0,
    maxProgress: null,
    isRecurring: false,
    recurrencePattern: null,
  });
  console.log('Created task:', task);

  // Update task progress
  await updateTaskProgress(task.id, 1);
  console.log('Task marked as complete');

  // Add KISS reflection
  await upsertKissReflection(user.id, '2024-01-11', {
    keep: 'Good code organization',
    improve: 'Add more tests',
    start: 'Daily standups',
    stop: 'Working late',
  });
  console.log('Added KISS reflection');

  // Create a group and join it
  const group = await createGroup('Dev Team', 'ABC123');
  await joinGroup(user.id, group.id);
  console.log('Created and joined group');

  // Add a comment
  await addDailyComment(
    user.id,
    user.id,
    'Great progress today!',
    '2024-01-11',
  );
  console.log('Added daily comment');
}

// Uncomment to run examples
// exampleUsage().catch(console.error);

export {
  createUser,
  getUserByUsername,
  updateUserAvatar,
  createTask,
  getTasksForDate,
  updateTaskProgress,
  upsertKissReflection,
  getKissReflection,
  createGroup,
  joinGroup,
  getUserGroups,
  addTaskComment,
  addDailyComment,
  getCommentsForDate,
};
