import { defineConfig } from 'drizzle-kit';
import env from './src/lib/env.js';

export default defineConfig({
  schema: './src/db/schema/schema.ts',
  out: './src/db/schema/migration',
  dialect: 'postgresql',
  dbCredentials: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: false,
  },
  verbose: true,
  strict: true,
});
