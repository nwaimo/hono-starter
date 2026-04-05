import type { Logger as drizzleLogger } from 'drizzle-orm/logger';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/schema.js';
import type { userSchema } from './schema/schema.js';
import env from '../lib/env.js';
import { logger } from '../lib/logger.js';

const DB_ERRORS = {
  DUPLICATE_KEY: '23505',
};

export interface DatabaseError {
  type: string;
  message: string;
  stack?: string;
  code: string;
  errno: number;
  sql: string;
  sqlState: string;
  sqlMessage: string;
}

export type User = typeof userSchema.$inferSelect;
export type NewUser = typeof userSchema.$inferInsert;

class DBLogger implements drizzleLogger {
  logQuery(query: string, params: unknown[]): void {
    logger.debug({ query, params });
  }
}

const connection = postgres({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

const db = drizzle(connection, { schema: schema, logger: new DBLogger() });
export { DB_ERRORS, connection, db };
