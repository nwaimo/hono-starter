import { sdk } from './lib/telemetry.js';
import env from './lib/env.js';

import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { showRoutes } from 'hono/dev';
import { logger as httpLogger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';

import { NODE_ENVIRONMENTS } from './lib/constants.js';
import { connection } from './db/database.js';
import { logger } from './lib/logger.js';
import { tracing } from './web/middlelayer/tracing.js';
import { Server } from './web/server.js';

const app = new Hono();

// Generic middlewares
app.use(cors());
app.use(secureHeaders());
app.use(tracing);
app.use(compress());
app.use(httpLogger());
app.use(trimTrailingSlash());

await connection`SELECT 1`;
logger.info('Database connection established');

const server = new Server(app);
server.configure();

if (env.NODE_ENV === NODE_ENVIRONMENTS.development) {
  console.log('Available routes:');
  showRoutes(app);
}

const port = env.PORT;
logger.info(`Server is running on port: ${port}, env: ${env.NODE_ENV}`);
const web = Bun.serve({ fetch: app.fetch, port });

const shutdown = async () => {
  logger.info('Shutdown signal received');

  logger.info('Closing http server');
  web.stop();

  logger.info('Closing worker');
  await server.shutDownWorker();

  logger.info('Closing database connection');
  await connection.end({ timeout: 5 });

  logger.info('Shutting down telemetry');
  await sdk.shutdown();

  logger.info('Exiting...');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
