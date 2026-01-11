import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { tasks } from './tasks';

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  targetUserId: integer('target_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  taskId: integer('task_id').references(() => tasks.id, {
    onDelete: 'cascade',
  }),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
  content: text('content').notNull(),
  isDailyComment: integer('is_daily_comment', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
}, (table) => ({
  targetDateIdx: index('idx_comments_target_date').on(table.targetUserId, table.date),
  taskIdx: index('idx_comments_task').on(table.taskId),
  dailyIdx: index('idx_comments_daily').on(table.targetUserId, table.isDailyComment, table.date),
}));

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
