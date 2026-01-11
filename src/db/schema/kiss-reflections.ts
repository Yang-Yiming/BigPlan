import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const kissReflections = sqliteTable(
  'kiss_reflections',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
    keep: text('keep'), // What went well
    improve: text('improve'), // What could be improved
    start: text('start'), // What to start doing
    stop: text('stop'), // What to stop doing
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    // Ensure one KISS reflection per user per day
    userDateUnique: unique().on(table.userId, table.date),
  }),
);

export type KissReflection = typeof kissReflections.$inferSelect;
export type NewKissReflection = typeof kissReflections.$inferInsert;
