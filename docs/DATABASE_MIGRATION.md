# Database Migration Guide

Complete guide for database schema management, migrations, and platform transitions.

## Table of Contents

1. [Overview](#overview)
2. [Current Database Setup](#current-database-setup)
3. [Schema Management](#schema-management)
4. [Migration Workflows](#migration-workflows)
5. [Migrating to PostgreSQL](#migrating-to-postgresql)
6. [Migrating to MySQL](#migrating-to-mysql)
7. [Migrating to Cloudflare D1](#migrating-to-cloudflare-d1)
8. [Data Migration](#data-migration)
9. [Backup and Restore](#backup-and-restore)
10. [Troubleshooting](#troubleshooting)

---

## Overview

BigPlans uses **Drizzle ORM** for database management, which provides:
- Type-safe database queries
- Automatic migration generation
- Support for multiple database systems
- Zero-cost abstractions

### Supported Databases

| Database | Use Case | Status |
|----------|----------|--------|
| **SQLite** | Local development | Primary (current) |
| **Cloudflare D1** | Serverless production | Production-ready |
| **PostgreSQL** | Traditional production | Supported |
| **MySQL** | Traditional production | Supported |

---

## Current Database Setup

### Schema Overview

The application has **6 core tables** with the following relationships:

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │
       ├─────────────┬──────────────┬───────────────┐
       │             │              │               │
┌──────▼──────┐ ┌───▼─────────┐ ┌──▼──────────┐ ┌─▼────────────┐
│    tasks    │ │kiss_reflect │ │   groups    │ │   comments   │
└─────────────┘ └─────────────┘ └──────┬──────┘ └──────────────┘
                                       │
                                ┌──────▼──────────┐
                                │ group_members   │
                                └─────────────────┘
```

### Table Definitions

#### 1. users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
```

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE on `username`

---

#### 2. tasks
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  progress_type TEXT DEFAULT 'boolean',
  progress_value INTEGER DEFAULT 0,
  max_progress INTEGER,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id`
- INDEX on `date`
- COMPOSITE INDEX on `(user_id, date)`

---

#### 3. kiss_reflections
```sql
CREATE TABLE kiss_reflections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  keep TEXT,
  improve TEXT,
  start TEXT,
  stop TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);
```

**Constraints:**
- UNIQUE on `(user_id, date)` - one reflection per user per day

---

#### 4. groups
```sql
CREATE TABLE groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);
```

**Indexes:**
- UNIQUE on `invite_code`

---

#### 5. group_members
```sql
CREATE TABLE group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at INTEGER DEFAULT (unixepoch()),
  show_kiss BOOLEAN DEFAULT true,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(group_id, user_id)
);
```

**Constraints:**
- UNIQUE on `(group_id, user_id)` - users can join groups only once

---

#### 6. comments
```sql
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  target_user_id INTEGER NOT NULL,
  task_id INTEGER,
  date TEXT NOT NULL,
  content TEXT NOT NULL,
  is_daily_comment BOOLEAN DEFAULT false,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

**Indexes:**
- INDEX on `target_user_id`
- INDEX on `date`
- INDEX on `task_id`

---

## Schema Management

### Local Development (SQLite)

#### Method 1: Push Schema (Fastest)

**Use when:**
- Starting fresh
- Rapid prototyping
- Don't need migration history

```bash
npm run db:push
```

**What it does:**
- Reads schema from `src/db/schema/`
- Directly applies changes to `local.db`
- No migration files created
- Fast and simple

---

#### Method 2: Generate Migrations (Recommended)

**Use when:**
- Working in a team
- Need migration history
- Preparing for production

```bash
# 1. Generate migration files
npm run db:generate

# 2. Review generated SQL in drizzle/migrations/
ls drizzle/migrations/

# 3. Apply migrations
npm run db:migrate
```

**What it does:**
- Compares current schema with database
- Generates timestamped SQL migration files
- Creates incremental migrations
- Maintains history

---

### Modifying Schema

#### Step 1: Edit Schema Files

Schema files are in `src/db/schema/`:

```typescript
// src/db/schema/users.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  avatar_url: text('avatar_url'),
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),

  // ADD NEW COLUMN:
  email: text('email').unique(), // New field
});
```

#### Step 2: Generate Migration

```bash
npm run db:generate
```

Output:
```
📦 Generating migrations...
✔ Migrations generated in drizzle/migrations/
  - 0001_add_email_to_users.sql
```

#### Step 3: Review Migration

```bash
cat drizzle/migrations/0001_add_email_to_users.sql
```

```sql
-- Add email column to users table
ALTER TABLE users ADD COLUMN email TEXT;
CREATE UNIQUE INDEX users_email_unique ON users(email);
```

#### Step 4: Apply Migration

```bash
npm run db:migrate
```

---

### Adding a New Table

Example: Add a `notifications` table

#### Step 1: Create Schema File

```typescript
// src/db/schema/notifications.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  read: integer('read', { mode: 'boolean' }).default(false),
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

#### Step 2: Export from Index

```typescript
// src/db/schema/index.ts
export * from './users';
export * from './tasks';
export * from './kiss-reflections';
export * from './groups';
export * from './group-members';
export * from './comments';
export * from './notifications'; // Add this
```

#### Step 3: Generate and Apply

```bash
npm run db:generate
npm run db:migrate
```

---

## Migration Workflows

### Development Workflow

```bash
# 1. Pull latest code
git pull

# 2. Apply any new migrations
npm run db:migrate

# 3. Make schema changes
# Edit src/db/schema/*.ts

# 4. Generate migration
npm run db:generate

# 5. Test migration
npm run db:migrate

# 6. Test application
npm run dev:server

# 7. Commit changes
git add src/db/schema/ drizzle/migrations/
git commit -m "Add email field to users"
```

---

### Production Deployment Workflow

```bash
# 1. Test locally first
npm run db:generate
npm run db:migrate
npm run dev:server  # Verify works

# 2. Generate production migrations
npm run db:generate:prod

# 3. Dry run (review SQL)
cat drizzle/migrations/*.sql

# 4. Backup production database (see Backup section)

# 5. Apply to production
npm run db:migrate:prod

# 6. Deploy application
npm run wrangler:deploy

# 7. Verify production
curl https://your-worker.workers.dev/api/auth/me
```

---

## Migrating to PostgreSQL

### Why Migrate?

- **Scalability:** Better for large datasets (100k+ rows)
- **Concurrency:** Multiple simultaneous writes
- **Features:** Full-text search, JSON queries, advanced indexing
- **Hosting:** Traditional VPS/cloud hosting

### Prerequisites

- PostgreSQL 14+ instance
- Database connection URL
- PostgreSQL client (`psql`)

### Step 1: Install Dependencies

```bash
# Remove SQLite dependencies
npm uninstall better-sqlite3 @types/better-sqlite3

# Install PostgreSQL dependencies
npm install pg @types/pg
npm install drizzle-orm postgres
```

### Step 2: Update Drizzle Config

Create `drizzle.config.postgres.ts`:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations-postgres',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    // Or individual credentials:
    // host: process.env.DB_HOST,
    // port: parseInt(process.env.DB_PORT || '5432'),
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
  },
});
```

### Step 3: Update Schema Files

Change imports from `drizzle-orm/sqlite-core` to `drizzle-orm/pg-core`:

```typescript
// Before (SQLite)
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// After (PostgreSQL)
import { pgTable, text, integer, serial, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow(),
});
```

**Key differences:**
- `sqliteTable` → `pgTable`
- `integer().primaryKey({ autoIncrement: true })` → `serial().primaryKey()`
- `integer({ mode: 'timestamp' })` → `timestamp()`
- `integer({ mode: 'boolean' })` → `boolean()`

### Step 4: Update Database Client

```typescript
// src/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
```

### Step 5: Environment Variables

Update `.env`:

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://username:password@localhost:5432/bigplans

# Or individual credentials
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=bigplans
```

### Step 6: Generate PostgreSQL Migrations

```bash
# Generate migrations for PostgreSQL
drizzle-kit generate --config=drizzle.config.postgres.ts

# Apply migrations
drizzle-kit migrate --config=drizzle.config.postgres.ts
```

### Step 7: Migrate Data

See [Data Migration](#data-migration) section below.

### Step 8: Update package.json Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate --config=drizzle.config.postgres.ts",
    "db:migrate": "drizzle-kit migrate --config=drizzle.config.postgres.ts",
    "db:studio": "drizzle-kit studio --config=drizzle.config.postgres.ts",
    "db:push": "drizzle-kit push --config=drizzle.config.postgres.ts"
  }
}
```

---

## Migrating to MySQL

### Step 1: Install Dependencies

```bash
npm uninstall better-sqlite3 @types/better-sqlite3
npm install mysql2
npm install drizzle-orm
```

### Step 2: Update Drizzle Config

```typescript
// drizzle.config.mysql.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations-mysql',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    // Or:
    // host: process.env.DB_HOST,
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
  },
});
```

### Step 3: Update Schema Files

```typescript
import { mysqlTable, varchar, int, boolean, timestamp } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  avatar_url: varchar('avatar_url', { length: 255 }),
  created_at: timestamp('created_at').defaultNow(),
});
```

### Step 4: Update Database Client

```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
});

export const db = drizzle(connection, { schema, mode: 'default' });
```

### Step 5: Environment Variables

```env
DATABASE_URL=mysql://username:password@localhost:3306/bigplans
```

---

## Migrating to Cloudflare D1

### Step 1: Create D1 Database

```bash
npx wrangler d1 create bigplans-db
```

Output:
```
✅ Successfully created DB 'bigplans-db'

[[d1_databases]]
binding = "DB"
database_name = "bigplans-db"
database_id = "xxxx-xxxx-xxxx-xxxx"
```

### Step 2: Update wrangler.toml

```toml
name = "bigplans"
main = "src/server/index.ts"
compatibility_date = "2025-01-11"

[[d1_databases]]
binding = "DB"
database_name = "bigplans-db"
database_id = "your-database-id-from-step-1"
```

### Step 3: Generate Migrations

```bash
npm run db:generate:prod
```

### Step 4: Apply Migrations

```bash
# Local D1 (for testing)
npx wrangler d1 migrations apply bigplans-db --local

# Remote D1 (production)
npm run db:migrate:prod
```

### Step 5: Test Locally

```bash
npm run wrangler:dev
```

### Step 6: Deploy

```bash
npm run wrangler:deploy
```

---

## Data Migration

### Exporting Data from SQLite

```bash
# Export to SQL dump
sqlite3 local.db .dump > backup.sql

# Export to JSON (using a script)
npx tsx scripts/export-data.ts
```

**Export script example:**

```typescript
// scripts/export-data.ts
import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('./local.db');

const tables = ['users', 'tasks', 'kiss_reflections', 'groups', 'group_members', 'comments'];

const data: any = {};

for (const table of tables) {
  data[table] = db.prepare(`SELECT * FROM ${table}`).all();
}

fs.writeFileSync('data-export.json', JSON.stringify(data, null, 2));
console.log('Data exported to data-export.json');
```

### Importing to PostgreSQL

```bash
# Method 1: Using pg_dump format
# (Requires converting SQLite → PostgreSQL syntax)

# Method 2: Using custom import script
npx tsx scripts/import-to-postgres.ts
```

**Import script example:**

```typescript
// scripts/import-to-postgres.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import fs from 'fs';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

const data = JSON.parse(fs.readFileSync('data-export.json', 'utf-8'));

async function importData() {
  // Import in order (respecting foreign keys)
  await db.insert(schema.users).values(data.users);
  await db.insert(schema.tasks).values(data.tasks);
  await db.insert(schema.kissReflections).values(data.kiss_reflections);
  await db.insert(schema.groups).values(data.groups);
  await db.insert(schema.groupMembers).values(data.group_members);
  await db.insert(schema.comments).values(data.comments);

  console.log('Data imported successfully');
}

importData().catch(console.error);
```

### Importing to MySQL

Similar to PostgreSQL, but use MySQL client:

```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
```

---

## Backup and Restore

### SQLite Backup

```bash
# Simple file copy
cp local.db local.db.backup

# Using SQLite command
sqlite3 local.db ".backup 'backup-$(date +%Y%m%d).db'"

# Automated daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
sqlite3 local.db ".backup 'backups/backup-$DATE.db'"
echo "Backup created: backups/backup-$DATE.db"
```

### PostgreSQL Backup

```bash
# Full database dump
pg_dump -U username -d bigplans > backup-$(date +%Y%m%d).sql

# Compressed backup
pg_dump -U username -d bigplans | gzip > backup-$(date +%Y%m%d).sql.gz

# Restore
psql -U username -d bigplans < backup-20250111.sql
```

### Cloudflare D1 Backup

```bash
# Export from D1
npx wrangler d1 execute bigplans-db --remote --command ".dump" > d1-backup.sql

# Or export to JSON (using custom script)
npx tsx scripts/export-d1-data.ts
```

---

## Troubleshooting

### Issue: Migration Fails

**Error:**
```
Error: Migration failed: column already exists
```

**Solution:**
```bash
# Drop problematic migration
npm run db:drop

# Regenerate
npm run db:generate

# Or push directly
npm run db:push
```

---

### Issue: Data Type Mismatch

**Error:**
```
Error: Cannot convert SQLite INTEGER to PostgreSQL BOOLEAN
```

**Solution:**

Manually convert in migration:

```sql
-- PostgreSQL migration
ALTER TABLE tasks ADD COLUMN is_recurring_new BOOLEAN;
UPDATE tasks SET is_recurring_new = (is_recurring = 1);
ALTER TABLE tasks DROP COLUMN is_recurring;
ALTER TABLE tasks RENAME COLUMN is_recurring_new TO is_recurring;
```

---

### Issue: Foreign Key Constraint Violation

**Error:**
```
Error: FOREIGN KEY constraint failed
```

**Solution:**

Import data in correct order:

```typescript
// Correct order (parents before children)
1. users
2. groups
3. tasks
4. kiss_reflections
5. group_members
6. comments
```

---

## Best Practices

### 1. Always Backup Before Migration

```bash
# SQLite
cp local.db local.db.pre-migration

# PostgreSQL
pg_dump bigplans > pre-migration-backup.sql
```

### 2. Test Migrations Locally First

```bash
# Test on local copy
cp production.db test.db
# Run migration on test.db
# Verify application works
# Then apply to production
```

### 3. Use Transactions

Drizzle migrations are automatically wrapped in transactions, but for manual migrations:

```sql
BEGIN;
-- Your migration SQL
COMMIT;
-- Or ROLLBACK; if something goes wrong
```

### 4. Version Control Migrations

```bash
git add drizzle/migrations/
git commit -m "Add email field to users table"
```

### 5. Document Breaking Changes

In migration file comments:

```sql
-- BREAKING CHANGE: This migration removes the 'old_field' column
-- Action required: Update application code to use 'new_field' instead
ALTER TABLE users DROP COLUMN old_field;
```

---

## Next Steps

1. **Choose your production database:** PostgreSQL, MySQL, or Cloudflare D1
2. **Set up backups:** Automated daily backups
3. **Plan migration strategy:** Zero-downtime if possible
4. **Test thoroughly:** Use staging environment
5. **Monitor after migration:** Check logs and performance

---

**Migration Checklist:**

- [ ] Backup current database
- [ ] Update dependencies
- [ ] Update Drizzle config
- [ ] Convert schema files
- [ ] Generate migrations
- [ ] Test locally
- [ ] Export data
- [ ] Apply migrations to new database
- [ ] Import data
- [ ] Test application
- [ ] Update environment variables
- [ ] Deploy
- [ ] Monitor

---

**Last Updated:** 2025-01-11
