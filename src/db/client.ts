import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

/**
 * Local SQLite database client for development
 */
export function createLocalDb(dbPath = './local.db') {
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, { schema });
}

/**
 * Type for the database client
 */
export type DbClient = ReturnType<typeof createLocalDb>;

/**
 * Create D1 database client for Cloudflare Workers
 * Usage in Worker context:
 *
 * import { drizzle } from 'drizzle-orm/d1';
 * import * as schema from './schema';
 *
 * export interface Env {
 *   DB: D1Database;
 * }
 *
 * export default {
 *   async fetch(request: Request, env: Env) {
 *     const db = drizzle(env.DB, { schema });
 *     // Use db...
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export function createD1Db(_d1: any) {
  // This will be implemented when setting up Cloudflare Workers
  // For now, this is a placeholder
  throw new Error('D1 client not implemented yet. Use in Worker context.');
}
