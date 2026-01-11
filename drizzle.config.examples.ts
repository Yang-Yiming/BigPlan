/**
 * Example Drizzle configurations for different databases
 * Copy and modify based on your target database
 */

// ============================================
// PostgreSQL Configuration
// ============================================
/*
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME || 'bigplans',
    ssl: process.env.DB_SSL === 'true',
  },
});

// Or using connection URL:
export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

// Required packages:
// npm install pg @types/pg
// npm install drizzle-orm drizzle-kit
*/

// ============================================
// MySQL Configuration
// ============================================
/*
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME || 'bigplans',
  },
});

// Or using connection URL:
export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

// Required packages:
// npm install mysql2
// npm install drizzle-orm drizzle-kit
*/

// ============================================
// SQLite (Better-SQLite3) Configuration
// ============================================
/*
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_PATH || './local.db',
  },
});

// Required packages:
// npm install better-sqlite3 @types/better-sqlite3
// npm install drizzle-orm drizzle-kit
*/

// ============================================
// Cloudflare D1 Configuration
// ============================================
/*
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});

// Required packages:
// npm install drizzle-orm drizzle-kit wrangler
*/

// ============================================
// Turso (LibSQL) Configuration
// ============================================
/*
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});

// Required packages:
// npm install @libsql/client
// npm install drizzle-orm drizzle-kit
*/

// ============================================
// Neon (Serverless Postgres) Configuration
// ============================================
/*
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

// Required packages:
// npm install @neondatabase/serverless
// npm install drizzle-orm drizzle-kit
*/

export {};
