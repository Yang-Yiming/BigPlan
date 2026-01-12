import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from './schema';

// Define D1Database type locally to avoid dependency issues if @cloudflare/workers-types is missing
interface D1Database {
  prepare(query: string): any;
  dump(): Promise<ArrayBuffer>;
  batch(statements: any[]): Promise<any[]>;
  exec(query: string): Promise<any>;
}

/**
 * Local SQLite database client for development
 */
export async function createLocalDb(dbPath = './local.db') {
  // Use dynamic import for better-sqlite3 to avoid issues in Cloudflare environment
  const { drizzle } = await import('drizzle-orm/better-sqlite3');
  const Database = (await import('better-sqlite3')).default;
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, { schema });
}

/**
 * Type for the database client
 */
export type DbClient = any;

/**
 * Create D1 database client for Cloudflare Workers
 */
export function createD1Db(d1: D1Database) {
  return drizzleD1(d1, { schema });
}
