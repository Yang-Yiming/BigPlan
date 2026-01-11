import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
  progressType: text('progress_type', {
    enum: ['boolean', 'numeric', 'percentage'],
  })
    .notNull()
    .default('boolean'),
  progressValue: integer('progress_value').notNull().default(0),
  maxProgress: integer('max_progress'), // null for boolean, number for numeric/percentage
  isRecurring: integer('is_recurring', { mode: 'boolean' })
    .notNull()
    .default(false),
  recurrencePattern: text('recurrence_pattern'), // JSON string: { frequency: 'daily' | 'weekly' | 'monthly', interval: number }
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
