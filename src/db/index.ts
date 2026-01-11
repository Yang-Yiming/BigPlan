import { drizzle } from 'drizzle-orm/d1';

export const initDB = (d1: D1Database) => {
  return drizzle(d1);
};

export type DB = ReturnType<typeof initDB>;
