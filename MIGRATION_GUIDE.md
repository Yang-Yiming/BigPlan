# Database Migration Guide

Quick reference for database operations and migrations.

## Quick Start

### 1. Local Development Setup

```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations to local SQLite database
npm run db:push

# Open database GUI
npm run db:studio
```

### 2. Verify Installation

```bash
# Run test script
npx tsx test-db.ts
```

## Common Commands

### Development (Local SQLite)

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration SQL from schema changes |
| `npm run db:push` | Push schema directly to database (no migrations) |
| `npm run db:studio` | Launch Drizzle Studio on http://localhost:4983 |
| `npm run db:drop` | Drop migration files |

### Production (Cloudflare D1)

| Command | Description |
|---------|-------------|
| `npm run db:generate:prod` | Generate migrations for D1 |
| `npm run db:migrate:prod` | Apply migrations to D1 remote database |
| `npm run wrangler:dev` | Start local Cloudflare Workers dev server |
| `npm run wrangler:deploy` | Deploy to Cloudflare Workers |

## Migration Workflow

### Adding New Columns

1. Update schema file (e.g., `src/db/schema/users.ts`):
```typescript
export const users = sqliteTable('users', {
  // ... existing columns
  bio: text('bio'), // NEW COLUMN
});
```

2. Generate migration:
```bash
npm run db:generate
```

3. Apply migration:
```bash
npm run db:push
```

### Creating New Tables

1. Create new schema file (e.g., `src/db/schema/notifications.ts`):
```typescript
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  message: text('message').notNull(),
  // ... other columns
});
```

2. Export from `src/db/schema/index.ts`:
```typescript
export * from './notifications';
```

3. Generate and apply migration:
```bash
npm run db:generate
npm run db:push
```

## Cloudflare D1 Setup

### Initial Setup

1. **Create D1 Database**:
```bash
npx wrangler d1 create bigplans-db
```

2. **Copy Database ID** from output and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "bigplans-db"
database_id = "your-database-id-here"
```

3. **Set Environment Variables** (`.env`):
```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_DATABASE_ID=your-database-id
CLOUDFLARE_D1_TOKEN=your-api-token
```

4. **Generate and Apply Migrations**:
```bash
npm run db:generate:prod
npm run db:migrate:prod
```

### Applying Migrations to D1

```bash
# Apply to remote D1 database
wrangler d1 migrations apply bigplans-db --remote

# Apply to local D1 database (for testing)
wrangler d1 migrations apply bigplans-db --local
```

## Migrating to Other Databases

### PostgreSQL

1. **Install dependencies**:
```bash
npm install pg @types/pg
npm uninstall better-sqlite3 @types/better-sqlite3
```

2. **Update `drizzle.config.ts`**:
```typescript
export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

3. **Update schema imports** (change `sqlite-core` to `pg-core`):
```typescript
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
```

4. **Regenerate migrations**:
```bash
npm run db:generate
```

### MySQL

1. **Install dependencies**:
```bash
npm install mysql2
npm uninstall better-sqlite3 @types/better-sqlite3
```

2. **Update `drizzle.config.ts`**:
```typescript
export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

3. **Update schema imports** (change `sqlite-core` to `mysql-core`):
```typescript
import { mysqlTable, serial, varchar, timestamp } from 'drizzle-orm/mysql-core';
```

4. **Regenerate migrations**:
```bash
npm run db:generate
```

## Troubleshooting

### Issue: "No config path provided"

**Solution**: Ensure you're in the project root directory where `drizzle.config.local.ts` exists.

### Issue: "Database locked"

**Solution**: Close any open database connections (including Drizzle Studio).

### Issue: Migration conflicts

**Solution**: Drop the existing database and regenerate:
```bash
rm local.db local.db-*
npm run db:push
```

### Issue: Type errors after schema changes

**Solution**: Regenerate migrations to update type definitions:
```bash
npm run db:generate
```

## Best Practices

1. **Always generate migrations** for production databases
2. **Use `db:push`** only for rapid local development
3. **Backup production data** before applying migrations
4. **Test migrations locally** before deploying to production
5. **Keep schema files modular** (one table per file)
6. **Use TypeScript types** generated from schema
7. **Version control migrations** in git

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview)

## Schema Overview

```
users
  ├── id (PK)
  ├── username (unique)
  ├── password_hash
  ├── avatar_url
  └── created_at

tasks
  ├── id (PK)
  ├── user_id (FK → users)
  ├── title
  ├── description
  ├── date
  ├── progress_type (enum)
  ├── progress_value
  ├── max_progress
  ├── is_recurring
  ├── recurrence_pattern
  ├── created_at
  └── updated_at

kiss_reflections
  ├── id (PK)
  ├── user_id (FK → users)
  ├── date (unique with user_id)
  ├── keep
  ├── improve
  ├── start
  ├── stop
  └── created_at

groups
  ├── id (PK)
  ├── name
  ├── invite_code (unique)
  └── created_at

group_members
  ├── id (PK)
  ├── group_id (FK → groups)
  ├── user_id (FK → users, unique with group_id)
  ├── joined_at
  └── show_kiss

comments
  ├── id (PK)
  ├── user_id (FK → users)
  ├── target_user_id (FK → users)
  ├── task_id (FK → tasks, nullable)
  ├── date
  ├── content
  ├── is_daily_comment
  └── created_at
```
