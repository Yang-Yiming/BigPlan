# Development Environment Setup Guide

Complete guide for setting up the BigPlans development environment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Development Workflow](#development-workflow)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Configuration](#advanced-configuration)

---

## Prerequisites

### Required Software

| Software | Minimum Version | Recommended | Purpose |
|----------|----------------|-------------|---------|
| **Node.js** | 18.x | 20.x or higher | JavaScript runtime |
| **npm** | 9.x | 10.x | Package manager |
| **Git** | 2.x | Latest | Version control |

### Optional Software

| Software | Purpose |
|----------|---------|
| **pnpm** | Alternative package manager (faster than npm) |
| **VS Code** | Recommended IDE with extensions |
| **Cloudflare account** | For production deployment |

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## Initial Setup

### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/your-org/BigPlans.git

# Or via SSH
git clone git@github.com:your-org/BigPlans.git

# Navigate to project directory
cd BigPlans
```

### 2. Install Dependencies

```bash
# Using npm (default)
npm install

# Or using pnpm (faster)
pnpm install
```

This will install:
- Frontend dependencies (React, Vite, Tailwind)
- Backend dependencies (Hono, Drizzle ORM, SQLite)
- Development tools (ESLint, Prettier, TypeScript)

**Expected install time:** 2-5 minutes depending on internet speed

### 3. Verify Installation

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 9.x.x or higher

# Verify dependencies installed
ls node_modules
# Should show hundreds of packages
```

---

## Environment Configuration

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Open `.env` in your editor and configure:

```env
# ========================================
# API Configuration
# ========================================
# Base URL for API requests (frontend → backend)
VITE_API_BASE_URL=http://localhost:3000/api

# ========================================
# JWT Authentication
# ========================================
# Secret key for signing JWT tokens
# IMPORTANT: Change this in production!
# Generate: openssl rand -base64 32
JWT_SECRET=your-super-secret-key-change-in-production

# Token expiration time
JWT_EXPIRES_IN=7d

# ========================================
# Server Configuration
# ========================================
# Backend server port
PORT=3000

# Node environment
NODE_ENV=development

# ========================================
# Cloudflare D1 (Production Only)
# ========================================
# Uncomment for production deployment
# CLOUDFLARE_ACCOUNT_ID=your-account-id
# CLOUDFLARE_DATABASE_ID=your-database-id
# CLOUDFLARE_D1_TOKEN=your-d1-token

# ========================================
# Database (Local Development)
# ========================================
# SQLite database file location
DATABASE_PATH=./local.db
```

### 3. Generate Secure JWT Secret

For production, generate a secure random secret:

```bash
# Using OpenSSL (Mac/Linux)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and paste it as the `JWT_SECRET` value.

### 4. Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | Yes | - | API endpoint for frontend |
| `JWT_SECRET` | Yes | - | Secret for JWT signing |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration |
| `PORT` | No | `3000` | Backend server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `DATABASE_PATH` | No | `./local.db` | SQLite database location |

---

## Database Setup

### Understanding the Database System

BigPlans uses:
- **SQLite** for local development (file-based, no server needed)
- **Cloudflare D1** for production (SQLite in the cloud)
- **Drizzle ORM** for type-safe database queries
- **Drizzle Kit** for migrations and schema management

### 1. Database Schema Overview

The database consists of 6 tables:

```
users (authentication)
  ↓
tasks (user's tasks)
kiss_reflections (daily reflections)
groups (collaboration groups)
  ↓
group_members (membership + settings)
  ↓
comments (task and daily comments)
```

### 2. Initialize Database (Method A: Push Schema)

**Fastest method for development:**

```bash
npm run db:push
```

This directly pushes the schema to your local SQLite database without creating migration files.

**Use this when:**
- Starting fresh
- Rapid prototyping
- You don't care about migration history

### 3. Initialize Database (Method B: Migrations)

**Recommended for production-like workflow:**

```bash
# Step 1: Generate migration files
npm run db:generate

# Step 2: Apply migrations
npm run db:migrate
```

This creates timestamped migration files in `drizzle/migrations/`.

**Use this when:**
- You want migration history
- Working in a team
- Preparing for production

### 4. Inspect Database with Drizzle Studio

Launch the visual database GUI:

```bash
npm run db:studio
```

Opens at: **https://local.drizzle.studio**

Features:
- Browse all tables and data
- Run SQL queries
- Edit records visually
- See schema relationships

### 5. Database File Location

Your SQLite database is stored at:
```
./local.db
```

**Important:** This file is gitignored. Each developer has their own local database.

### 6. Resetting the Database

To start fresh:

```bash
# Delete the database file
rm local.db

# Recreate schema
npm run db:push

# Or apply migrations again
npm run db:migrate
```

---

## Running the Application

### Development Servers

BigPlans requires **two servers** running simultaneously:

#### Terminal 1: Backend Server

```bash
npm run dev:server
```

**Output:**
```
Server running at http://localhost:3000
Database connected: local.db
```

**What it does:**
- Runs Hono server with Node.js
- Serves API endpoints at `/api/*`
- Auto-restarts on file changes (via tsx watch)
- Connects to SQLite database

#### Terminal 2: Frontend Dev Server

```bash
npm run dev
```

**Output:**
```
VITE v7.2.4  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**What it does:**
- Runs Vite development server
- Serves React app with HMR (Hot Module Replacement)
- Proxies API requests to backend
- Auto-reloads on file changes

### Accessing the Application

1. **Open browser:** http://localhost:5173
2. **Register an account:** Click "Register" and create user
3. **Login:** Use your credentials
4. **Start using:** Create tasks and reflections

### Stopping the Servers

Press `Ctrl+C` in each terminal window.

---

## Development Workflow

### Making Code Changes

#### Frontend Changes

Edit files in `src/`:
- `src/components/` - React components
- `src/pages/` - Page-level components
- `src/services/` - API service calls
- `src/contexts/` - Global state management
- `src/hooks/` - Custom React hooks

**Changes auto-reload** in the browser (HMR).

#### Backend Changes

Edit files in `src/server/`:
- `src/server/routes/` - API route handlers
- `src/server/middleware/` - Server middleware
- `src/server/utils/` - Backend utilities

**Server auto-restarts** on changes.

#### Database Schema Changes

Edit files in `src/db/schema/`:
- `src/db/schema/users.ts` - Users table
- `src/db/schema/tasks.ts` - Tasks table
- etc.

**After schema changes:**

```bash
# Option A: Push directly (fast)
npm run db:push

# Option B: Generate migration (proper)
npm run db:generate
npm run db:migrate
```

### Code Quality Checks

#### Before Committing

```bash
# Check linting
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Check formatting
npm run format:check

# Format all files
npm run format

# Type check
npm run build
```

#### Pre-commit Hook (Optional)

Install husky for automatic checks:

```bash
npx husky-init && npm install
```

Add to `.husky/pre-commit`:
```bash
#!/bin/sh
npm run lint && npm run format:check
```

### Testing Your Changes

#### Manual Testing

1. **Frontend:** Test in browser at http://localhost:5173
2. **Backend:** Use test scripts or curl

#### API Testing Scripts

```bash
# Test authentication
npx tsx test-auth.ts

# Test tasks API
npx tsx test-tasks.ts

# Test KISS reflections
npx tsx test-kiss.ts

# Test database connection
npx tsx test-db.ts
```

#### Using curl

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Get tasks (requires token)
curl -X GET "http://localhost:3000/api/tasks?date=2025-01-11" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Building for Production

```bash
# Compile TypeScript and build Vite bundle
npm run build

# Output: dist/ directory

# Preview production build locally
npm run preview
```

---

## Troubleshooting

### Common Issues

#### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

```bash
# Option 1: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Change port in .env
PORT=3001

# Option 3: Find and kill manually
lsof -i :3000
kill -9 <PID>
```

#### Issue: Database Locked

**Error:**
```
SqliteError: database is locked
```

**Solutions:**

1. Close Drizzle Studio if running
2. Stop all dev:server instances
3. Delete `local.db-wal` and `local.db-shm` files:
   ```bash
   rm local.db-wal local.db-shm
   ```
4. Restart servers

#### Issue: Module Not Found

**Error:**
```
Error: Cannot find module 'xyz'
```

**Solution:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or clear npm cache
npm cache clean --force
npm install
```

#### Issue: CORS Errors

**Error in browser console:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

1. Verify backend is running on http://localhost:3000
2. Verify frontend is running on http://localhost:5173
3. Check `VITE_API_BASE_URL` in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```
4. Restart both servers

#### Issue: Token Expired

**Error:**
```
401 Unauthorized
```

**Solution:**

1. Clear localStorage in browser DevTools:
   ```javascript
   localStorage.clear()
   ```
2. Refresh page and login again

#### Issue: TypeScript Errors

**Error:**
```
error TS2304: Cannot find name 'xyz'
```

**Solutions:**

```bash
# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"

# Rebuild TypeScript
npm run build

# Check tsconfig.json is valid
npx tsc --showConfig
```

### Getting Help

1. **Check documentation:** `/docs` directory
2. **Search issues:** GitHub Issues
3. **Review logs:** Check terminal output for errors
4. **Enable verbose logging:** Set `NODE_ENV=development`

---

## Advanced Configuration

### Using pnpm Instead of npm

```bash
# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install

# Run scripts
pnpm dev
pnpm dev:server
```

### Custom Vite Configuration

Edit `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 5174, // Custom port
    open: true, // Auto-open browser
    proxy: {
      // Custom proxy rules
    }
  }
})
```

### Custom Backend Port

Edit `.env`:
```env
PORT=8000
```

Update `VITE_API_BASE_URL`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Environment-Specific Configs

Create multiple env files:
- `.env.development`
- `.env.production`
- `.env.test`

Vite automatically loads the correct file based on mode.

### Database Configuration

#### Custom Database Location

Edit `.env`:
```env
DATABASE_PATH=/custom/path/to/database.db
```

#### Connection Pool Settings

Edit `src/db/client.ts` for advanced settings:

```typescript
const db = new Database(process.env.DATABASE_PATH, {
  verbose: console.log, // SQL query logging
  timeout: 5000,
  readonly: false
})
```

### Debugging

#### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/server/dev.ts",
      "runtimeArgs": ["--loader", "tsx"],
      "console": "integratedTerminal"
    }
  ]
}
```

#### Enable SQL Query Logging

Edit `src/db/client.ts`:

```typescript
const db = new Database('./local.db', {
  verbose: console.log // Logs every SQL query
})
```

### Performance Optimization

#### Frontend Build Optimization

```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer
```

#### Backend Optimization

- Enable SQLite WAL mode for better concurrency
- Use prepared statements (Drizzle handles this)
- Index frequently queried columns

---

## Next Steps

After setup is complete:

1. **Read the API documentation:** `docs/API.md`
2. **Explore the database schema:** `docs/DATABASE_MIGRATION.md`
3. **Learn the user features:** `docs/USER_MANUAL.md`
4. **Ready to contribute?** `docs/CONTRIBUTING.md`

---

## Quick Reference

### One-Command Setup

```bash
# Complete setup in one go
git clone <repo-url> && \
cd BigPlans && \
npm install && \
cp .env.example .env && \
npm run db:push
```

Then edit `.env` and run:
```bash
npm run dev:server    # Terminal 1
npm run dev           # Terminal 2
```

### Daily Development Commands

```bash
# Start work
npm run dev:server &  # Background
npm run dev

# Code quality
npm run lint:fix
npm run format

# Database
npm run db:studio     # Visual editor
npm run db:push       # Apply schema changes

# Testing
npx tsx test-auth.ts
```

---

**Happy coding!**
