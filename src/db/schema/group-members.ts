import { sqliteTable, integer, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { groups } from './groups';
import { users } from './users';

export const groupMembers = sqliteTable(
  'group_members',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    groupId: integer('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: integer('joined_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    showKiss: integer('show_kiss', { mode: 'boolean' })
      .notNull()
      .default(true),
  },
  (table) => ({
    // Ensure a user can only join a group once
    groupUserUnique: unique().on(table.groupId, table.userId),
  }),
);

export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;
