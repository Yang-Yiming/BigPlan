# BigPlans Backend

Backend API for BigPlans project management application built with Hono, Cloudflare Workers D1, and Drizzle ORM.

## Setup

### Install dependencies
```bash
npm install
```

### Create D1 Database
```bash
npx wrangler d1 create bigplans-db
```

Copy the database ID from the output and update `wrangler.toml`:
```toml
database_id = "your-database-id-here"
```

### Generate and run migrations
```bash
npm run db:generate
npm run db:local
```

## Development

Start the development server:
```bash
npm run dev
```

## Database Management

- `npm run db:generate` - Generate migrations from schema
- `npm run db:local` - Run migrations locally
- `npm run db:migrate` - Run migrations on remote D1
- `npm run db:studio` - Open Drizzle Studio

## Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## Project Structure

```
src/
├── db/              # Database configuration and schema
├── middleware/      # Hono middleware (CORS, logging, error handling)
├── routes/          # API route handlers
├── types/           # TypeScript type definitions
└── index.ts         # Main application entry point
```
