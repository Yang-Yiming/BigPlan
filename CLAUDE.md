# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

**CRITICAL: Always use `bun` instead of `npm` for all operations.**

```bash
# DO:
bun install
bun run dev
bun add package-name

# DO NOT:
npm install
npm run dev
npm install package-name
```

## Tailwind CSS Version

**This project uses Tailwind CSS v4, NOT v3.**

The CSS import syntax is different from v3:

```css
/* Correct (v4): */
@import "tailwindcss";

/* Incorrect (v3 - DO NOT USE): */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- Configuration: `tailwind.config.js` (same as v3)
- PostCSS plugin: `@tailwindcss/postcss` (different from v3)
- All utility classes work the same as v3

## Development Commands

```bash
# Start development servers
bun run dev              # Frontend Vite server (http://localhost:5173)
bun run dev:server       # Backend Hono server (http://localhost:3000)

# Build
bun run build            # Development build
bun run build:prod       # Production build with optimizations

# Code quality
bun run lint             # Check linting errors
bun run lint:fix         # Auto-fix linting errors
bun run format           # Format code with Prettier
bun run format:check     # Check formatting without changes

# Testing
bun run test             # Run tests in watch mode
bun run test:ui          # Open Vitest UI
bun run test:run         # Run tests once (CI mode)
bun run test:coverage    # Generate coverage report

# Database operations (local development)
bun run db:generate      # Generate migrations from schema changes
bun run db:migrate       # Apply migrations to local SQLite
bun run db:studio        # Open Drizzle Studio (visual database manager)
bun run db:push          # Push schema changes directly (dev only)
bun run db:drop          # Drop tables (dangerous!)

# Database operations (production - Cloudflare D1)
bun run db:generate:prod # Generate migrations for production
bun run db:migrate:prod  # Apply migrations to D1 database

# Cloudflare deployment
bun run wrangler:dev     # Run Workers locally
bun run wrangler:deploy  # Deploy to Cloudflare
```

## Architecture Overview

### Dual Environment Setup

The application runs in **two different environments** with separate database configurations:

1. **Local Development**: Uses `better-sqlite3` with local `./local.db` file
2. **Production (Cloudflare)**: Uses Cloudflare D1 (managed SQLite)

Configuration files:
- `drizzle.config.local.ts` - Local development (uses `./local.db`)
- `drizzle.config.ts` - Production Cloudflare D1 (requires env vars)

### Backend Architecture (Hono + Drizzle ORM)

**Entry Points:**
- `src/server/index.ts` - Main Hono app with middleware and route registration
- `src/server/dev.ts` - Local development server using `@hono/node-server`

**Database Strategy:**
- Local dev: `createLocalDb()` from `src/db/client.ts` creates better-sqlite3 instance
- Production: Will use D1 binding in Cloudflare Workers environment
- All routes receive `db` client through Hono context (`c.get('db')`)

**Route Structure:**
- `src/server/routes/auth.ts` - Registration, login (JWT generation)
- `src/server/routes/tasks.ts` - CRUD for tasks (progress types: boolean/numeric/percentage)
  - **Auto-generates recurring task instances** on creation (next 30 days)
  - **Auto-generates missing instances** when fetching tasks for a date
  - Supports limited repetition via `maxOccurrences` field
- `src/server/routes/reflections.ts` - Daily reflections (deprecated in favor of KISS)
- `src/server/routes/kiss.ts` - KISS reflections (Keep, Improve, Start, Stop)
- `src/server/routes/groups.ts` - Group management and member invitations
- `src/server/routes/comments.ts` - Comments on tasks and reflections

**Authentication:**
- JWT-based auth with Bearer tokens
- `src/server/middleware/auth.ts` - Validates JWT and injects user into context
- Token stored in localStorage on frontend
- Auto-redirect to `/login` on 401 responses

### Frontend Architecture (React 19 + React Router v7)

**Application Bootstrap:**
- `src/main.tsx` - React app entry point
- `src/App.tsx` - Router setup with provider hierarchy

**Provider Hierarchy (outer to inner):**
1. `BrowserRouter` - React Router v7
2. `AuthProvider` - Manages auth state and localStorage
3. `ToastProvider` - Toast notifications
4. `ConfirmDialogProvider` - Confirmation dialogs

**Routing:**
- Public routes: `/login`, `/register`
- Protected routes (requires auth): `/`, `/groups`
- `ProtectedRoute` wrapper checks auth and redirects

**API Communication:**
- `src/lib/api-client.ts` - Axios instance with base URL from `VITE_API_BASE_URL`
- Interceptors add JWT token to all requests
- Auto-logout on 401 responses

**State Management:**
- React Context for global state (auth, toasts, dialogs)
- `src/hooks/` - Custom hooks for component logic

### Database Schema (Drizzle ORM)

Schema location: `src/db/schema/`

**Core Tables:**
- `users` - User accounts with bcrypt password hashing
- `tasks` - Tasks with progress types (boolean, numeric, percentage) and periodicity
  - `maxOccurrences` - Nullable integer for limiting recurring task instances (null = infinite repetition)
  - `parentTaskId` - References parent task ID for tracking generated instances
- `kiss-reflections` - Daily KISS reflections (Keep, Improve, Start, Stop)
- `groups` - Collaboration groups
- `group-members` - Many-to-many relationship between users and groups
- `comments` - Comments on tasks and reflections

**Important Concepts:**
- **Progress Types**: Tasks support three types: boolean (done/not done), numeric (e.g., 5/10), percentage (0-100%)
- **Periodicity**: Tasks can be one-time, daily, weekly, or monthly
- **Recurring Tasks Auto-Generation**:
  - **Hybrid Strategy**: When creating a recurring task, the system generates next 30 days of instances immediately
  - **On-Demand Generation**: When viewing a date, missing instances are generated automatically
  - **Limited Repetition**: Set `maxOccurrences` to limit total instances (leave null for infinite)
  - **Instance Tracking**: Generated instances have `parentTaskId` pointing to the template task
  - Implementation: `src/server/utils/recurring-tasks.ts` contains generation logic
- **KISS Framework**: Keep (what worked), Improve (what needs work), Start (new habits), Stop (bad habits)

### Environment Variables

**Required for Local Development (`.env`):**
```env
VITE_API_BASE_URL=http://localhost:3000/api        # Frontend API endpoint
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:3000  # Allowed CORS origins (comma-separated)
JWT_SECRET=your-secret-key                          # JWT signing key
PORT=3000                                           # Backend server port
```

**Required for Production Deployment:**
```env
CLOUDFLARE_ACCOUNT_ID=xxx    # For db:generate:prod
CLOUDFLARE_DATABASE_ID=xxx   # For db:generate:prod
CLOUDFLARE_D1_TOKEN=xxx      # For db:generate:prod
```

Production secrets are set via: `wrangler secret put JWT_SECRET --env production`

## Common Pitfalls

1. **Port Mismatch**: Frontend expects backend on port in `VITE_API_BASE_URL`. Default is `http://localhost:3000/api` (backend runs on port 3000, not 8787).

2. **CORS Errors**: If you see CORS errors, make sure the frontend port is listed in `CORS_ORIGIN` env var. Supports multiple origins (comma-separated).

3. **CSS Not Loading**: If styles disappear, check that `src/index.css` uses v4 syntax: `@import "tailwindcss";`

4. **Database Client**: Routes must use `c.get('db')` to get the database client, not create their own.

5. **Environment Variables**: Vite requires `VITE_` prefix for frontend env vars. Backend vars don't need prefix.

6. **Testing Database**: Tests use separate SQLite instance configured in `src/test/setup.ts`.

7. **Recurring Tasks**: When creating a recurring task, instances are generated automatically. Check `src/server/utils/recurring-tasks.ts` for generation logic. Generated instances have `isRecurring = false` and `parentTaskId` set to the template task ID.

## Code Patterns

### Adding a New API Route

1. Create route file in `src/server/routes/`
2. Import and use `authMiddleware` if route requires authentication
3. Get db client: `const db = c.get('db');`
4. Register in `src/server/index.ts`: `app.route('/api/your-route', yourRoutes)`

### Adding a Database Table

1. Create schema file in `src/db/schema/`
2. Export from `src/db/schema/index.ts`
3. Run `bun run db:generate` to create migration
4. Run `bun run db:migrate` to apply locally
5. For production: `bun run db:generate:prod && bun run db:migrate:prod`

### Frontend Data Fetching

Use service files in `src/services/` that wrap `apiClient` from `src/lib/api-client.ts`. Services automatically include auth tokens and handle errors.

## Testing

- Framework: Vitest with React Testing Library
- DOM environment: happy-dom
- Setup file: `src/test/setup.ts`
- Test pattern: `*.test.ts` or `*.test.tsx` files
- Coverage output: `coverage/` directory

## Deployment Target

- **Platform**: Cloudflare Workers (serverless)
- **Database**: Cloudflare D1 (SQLite at edge)
- **CDN**: Automatic via Cloudflare Pages (for static frontend)
- **Config**: `wrangler.toml` defines bindings and environment settings

## Continuous Deployment

**GitHub Actions** is configured for automatic deployment on push to `main` branch.

**Workflow File:** `.github/workflows/deploy.yml`

**Required GitHub Secrets:**
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_API_TOKEN` - API token with Workers and D1 edit permissions

**Deployment Process:**
1. Push to `main` branch triggers GitHub Actions
2. Workflow installs dependencies (Bun)
3. Runs database migrations (`bun run db:migrate:prod`)
4. Builds production bundle (`bun run build:prod`)
5. Deploys to Cloudflare Workers (`wrangler deploy`)

**Setup Guide:** See `GITHUB_ACTIONS_SETUP.md` for detailed step-by-step instructions on creating API tokens and configuring GitHub Secrets.

**Monitoring:** View deployment status at https://github.com/Yang-Yiming/BigPlan/actions
