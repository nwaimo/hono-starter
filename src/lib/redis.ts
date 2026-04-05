import IORedis from 'ioredis';
import env from './env.js';

const redis = new IORedis({
  port: env.REDIS_PORT,
  host: env.REDIS_HOST,
  maxRetriesPerRequest: null,
});

export { redis };
