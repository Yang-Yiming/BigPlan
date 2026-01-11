# Database Schema & Migrations

This document describes the database schema design and migration procedures for BigPlans.

## Database Structure

The application uses **Drizzle ORM** with support for SQLite (D1), PostgreSQL, and MySQL databases.

### Tables

#### 1. `users`
User accounts with authentication credentials.

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key (auto-increment) |
| username | text | Unique username |
| password_hash | text | Hashed password |
| avatar_url | text | Optional profile picture URL |
| created_at | timestamp | Account creation time |

#### 2. `tasks`
User tasks with progress tracking and recurrence support.

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key (auto-increment) |
| user_id | integer | Foreign key to users |
| title | text | Task title |
| description | text | Optional task description |
| date | text | ISO date (YYYY-MM-DD) |
| progress_type | text | 'boolean', 'numeric', or 'percentage' |
| progress_value | integer | Current progress value |
| max_progress | integer | Maximum value (for numeric/percentage) |
| is_recurring | boolean | Whether task repeats |
| recurrence_pattern | text | JSON: { frequency, interval } |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

#### 3. `kiss_reflections`
Daily KISS (Keep, Improve, Start, Stop) reflections.

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key (auto-increment) |
| user_id | integer | Foreign key to users |
| date | text | ISO date (YYYY-MM-DD) |
| keep | text | What went well |
| improve | text | What could be improved |
| start | text | What to start doing |
| stop | text | What to stop doing |
| created_at | timestamp | Creation time |

**Unique constraint**: `(user_id, date)` - one reflection per user per day.

#### 4. `groups`
User groups for collaboration.

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key (auto-increment) |
| name | text | Group name |
| invite_code | text | Unique invite code |
| created_at | timestamp | Creation time |

#### 5. `group_members`
Group membership tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key (auto-increment) |
| group_id | integer | Foreign key to groups |
| user_id | integer | Foreign key to users |
| joined_at | timestamp | Join time |
| show_kiss | boolean | Show KISS reflections to group |

**Unique constraint**: `(group_id, user_id)` - users can join a group only once.

#### 6. `comments`
Comments on tasks or daily summaries.

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key (auto-increment) |
| user_id | integer | Comment author (FK to users) |
| target_user_id | integer | Target user (FK to users) |
| task_id | integer | Optional task reference (FK to tasks) |
| date | text | ISO date (YYYY-MM-DD) |
| content | text | Comment text |
| is_daily_comment | boolean | General daily comment vs task comment |
| created_at | timestamp | Creation time |

## Development Setup

### Local Development (SQLite)

1. **Generate migrations**:
```bash
npm run db:generate
```

2. **Apply migrations** (using Drizzle Kit):
```bash
npm run db:migrate
```

3. **Push schema directly** (for rapid development):
```bash
npm run db:push
```

4. **Open Drizzle Studio** (database GUI):
```bash
npm run db:studio
```

### Cloudflare D1 (Production)

1. **Create D1 database**:
```bash
npx wrangler d1 create bigplans-db
```

2. **Update `wrangler.toml`** with the database ID from the previous command.

3. **Generate migrations** for production:
```bash
npm run db:generate:prod
```

4. **Apply migrations** to D1:
```bash
npm run db:migrate:prod
```

5. **Deploy to Cloudflare Workers**:
```bash
npm run wrangler:deploy
```

## Database Scripts Reference

| Script | Description |
|--------|-------------|
| `db:generate` | Generate migrations from schema (local) |
| `db:generate:prod` | Generate migrations from schema (D1) |
| `db:migrate` | Apply migrations (local SQLite) |
| `db:migrate:prod` | Apply migrations (Cloudflare D1) |
| `db:studio` | Launch Drizzle Studio GUI |
| `db:push` | Push schema directly without migrations |
| `db:drop` | Drop migration files |

## Schema Design Decisions

### Timestamps
- All timestamps use Unix epoch integers for consistency across timezones
- Dates for tasks and reflections use ISO strings (YYYY-MM-DD) for simplicity

### Cascading Deletes
- All foreign keys use `ON DELETE CASCADE` to maintain referential integrity
- Deleting a user automatically removes their tasks, reflections, comments, and group memberships

### Progress Types
Tasks support three progress tracking modes:
- **boolean**: Simple done/not done (default)
- **numeric**: Count-based progress (e.g., 3/10 items)
- **percentage**: Percentage-based progress (e.g., 75%)

### KISS Reflections
The unique constraint on `(user_id, date)` ensures users can only have one reflection per day, maintaining the simplicity of the KISS method.

## Migration to Other Databases

This schema is designed to be database-agnostic. To migrate:

### PostgreSQL
1. Update `drizzle.config.ts`:
```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

2. Update dependencies:
```bash
npm install pg @types/pg
npm uninstall better-sqlite3 @types/better-sqlite3
```

3. Regenerate migrations:
```bash
npm run db:generate
```

### MySQL
1. Update `drizzle.config.ts`:
```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

2. Update dependencies:
```bash
npm install mysql2
npm uninstall better-sqlite3 @types/better-sqlite3
```

3. Regenerate migrations:
```bash
npm run db:generate
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables for Cloudflare D1:
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `CLOUDFLARE_DATABASE_ID`: Your D1 database ID
- `CLOUDFLARE_D1_TOKEN`: API token with D1 permissions

## Next Steps

1. Create database connection utilities in `src/db/client.ts`
2. Implement repository pattern for data access
3. Add database seeding scripts for development
4. Set up automated backups for production
