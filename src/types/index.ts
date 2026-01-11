import type { DB } from './db';

export interface Env {
  DB: D1Database;
}

export interface AppContext {
  Bindings: Env;
  Variables: {
    db: DB;
  };
}
