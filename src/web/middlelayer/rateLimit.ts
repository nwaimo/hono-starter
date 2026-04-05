import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { StatusCodes } from 'http-status-codes';
import { createMiddleware } from 'hono/factory';
import { redis } from '../../lib/redis.js';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}

export const rateLimit = (options: RateLimitOptions) => {
  const { windowMs, max, keyPrefix = 'rl' } = options;
  const windowS = Math.ceil(windowMs / 1000);

  return createMiddleware(async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const key = `${keyPrefix}:${ip}:${c.req.path}`;

    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowS);
    }

    c.header('X-RateLimit-Limit', max.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, max - current).toString());

    if (current > max) {
      return c.json(
        { error: 'Too many requests, please try again later' },
        <ContentfulStatusCode>StatusCodes.TOO_MANY_REQUESTS,
      );
    }

    await next();
  });
};
